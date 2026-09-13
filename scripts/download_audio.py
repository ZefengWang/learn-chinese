#!/usr/bin/env python3
"""
批量下载中文发音 MP3（edge-tts 微软 Azure TTS，走代理），存入 audio/<group>/<id>.mp3

优先引擎：edge-tts（微软 Azure TTS）——音质好、发音准、声调整齐
  zh-CN-XiaoxiaoNeural（女声）
  zh-CN-YunxiNeural（男声，更有力）
  通过 proxy=http://127.0.0.1:18080 出口

fallback：百度 fanyi.baidu.com/gettts

语速策略（edge-tts 的 rate 参数）：
  initials:  +80% — 快吐字，压掉声调尾巴，像教材示范音
  finals:    +50% — 中速偏快
  其他:      默认（+0%）

发音文本提取：
  initials/finals — meaning 里的第一个汉字（示范字）
  tones/characters — text 里的汉字
  scenes/minimal  — text 整条

用法：HTTP_PROXY=http://127.0.0.1:18080 python3 scripts/download_audio.py
"""
import json, os, re, sys, time, pathlib, subprocess, urllib.request, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / 'audio'
JS_DATA_DIR = ROOT / 'js' / 'data'

# —— TTS 引擎配置 ——
EDGE_VOICE = 'zh-CN-XiaoxiaoNeural'
EDGE_PROXY = os.environ.get('HTTP_PROXY') or os.environ.get('HTTPS_PROXY') or 'http://127.0.0.1:18080'

BAIDU_TTS = 'https://fanyi.baidu.com/gettts?lan=zh&text={text}&spd={spd}&source=web'

# edge-tts rate 配置
GROUP_RATE = {
    'initials':   '+80%',
    'finals':     '+50%',
    'tones':      '+0%',
    'characters': '+0%',
    'scenes':     '+0%',
    'minimal':    '+0%',
}

# 百度 fallback 语速（1-9）
GROUP_SPD = {
    'initials':   7,
    'finals':     5,
    'tones':      3,
    'characters': 3,
    'scenes':     3,
    'minimal':    3,
}

# —— 辅助函数 ——
def first_hanzi(s: str) -> str:
    m = re.search(r'[\u4e00-\u9fff]', s or '')
    return m.group() if m else ''

def extract_speak_text(group: str, item: dict) -> str:
    if group in ('initials', 'finals'):
        return first_hanzi(item.get('meaning', ''))
    elif group == 'tones':
        return first_hanzi(item.get('text', ''))
    elif group == 'characters':
        return item.get('text', '')
    elif group == 'scenes':
        return item.get('text', '')
    elif group == 'minimal':
        return item.get('text', '').replace(' / ', '')
    return ''

def download_edge(text: str, out_path: pathlib.Path, rate: str = '+0%') -> bool:
    """用 edge-tts 下载"""
    try:
        import asyncio, edge_tts
    except ImportError:
        print('  ✗ edge-tts 未安装', file=sys.stderr)
        return False

    async def _dl():
        extra = {'rate': rate}
        communicate = edge_tts.Communicate(text, EDGE_VOICE, proxy=EDGE_PROXY, **extra)
        await communicate.save(str(out_path))

    try:
        asyncio.run(_dl())
        sz = out_path.stat().st_size
        if sz < 1000:
            print(f'  ✗ edge-tts 文件太小 ({sz} bytes)', file=sys.stderr)
            return False
        return True
    except Exception as e:
        print(f'  ✗ edge-tts 失败: {e}', file=sys.stderr)
        return False

def download_baidu(text: str, out_path: pathlib.Path, spd: int = 3) -> bool:
    """百度 fallback"""
    url = BAIDU_TTS.format(text=urllib.parse.quote(text), spd=spd)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 Chrome/120',
        'Referer': 'https://fanyi.baidu.com/',
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
        if len(data) < 500:
            return False
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(data)
        return True
    except Exception as e:
        print(f'  ✗ 百度失败: {e}', file=sys.stderr)
        return False

def load_data(group: str) -> list:
    fp = JS_DATA_DIR / f'{group}.js'
    node = subprocess.run(
        ['node', '-e',
         f"const vm=require('vm');const ctx={{window:{{}}}};ctx.window=ctx;vm.createContext(ctx);"
         f"vm.runInContext(require('fs').readFileSync('{fp.as_posix()}','utf8'),ctx);"
         f"process.stdout.write(JSON.stringify(ctx.window.Data_{group}));"],
        capture_output=True, text=True, timeout=10
    )
    if node.returncode != 0:
        raise RuntimeError(f'Node 解析失败: {node.stderr}')
    return json.loads(node.stdout)

# —— 主流程 ——
def main():
    AUDIO_DIR.mkdir(exist_ok=True)
    groups = ['initials', 'finals', 'tones', 'characters', 'scenes', 'minimal']
    total_ok = total_fail = total_skip = 0

    print(f'🔊 TTS 引擎: edge-tts ({EDGE_VOICE}) + 百度 fallback')
    print(f'🌐 代理: {EDGE_PROXY}')

    for group in groups:
        items = load_data(group)
        rate = GROUP_RATE.get(group, '+0%')
        spd  = GROUP_SPD.get(group, 3)
        print(f'\n=== {group} ({len(items)} 条, rate={rate}, baidu_spd={spd}) ===')

        ok = fail = skip = 0
        for item in items:
            speak_text = extract_speak_text(group, item)
            if not speak_text:
                print(f'  SKIP  {item.get("id","?")} — 无法提取发音文本')
                skip += 1; total_skip += 1
                continue

            out = AUDIO_DIR / group / f'{item["id"]}.mp3'
            if out.exists() and out.stat().st_size > 1000:
                print(f'  CACHE {item["id"]}  → {speak_text}')
                ok += 1; total_ok += 1
                continue

            print(f'  DL    {item["id"]}  → {speak_text}', end='')
            sys.stdout.flush()

            # 先试 edge-tts
            if download_edge(speak_text, out, rate):
                print(' ✓ edge')
                ok += 1; total_ok += 1
            elif download_baidu(speak_text, out, spd):
                print(' ✓ baidu')
                ok += 1; total_ok += 1
            else:
                print(' ✗ FAIL')
                fail += 1; total_fail += 1

            time.sleep(0.2)

        print(f'  本组合计: OK={ok}  FAIL={fail}  SKIP={skip}')

    print(f'\n=== 总合计: OK={total_ok}  FAIL={total_fail}  SKIP={total_skip} ===')
    return 0 if total_fail == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
