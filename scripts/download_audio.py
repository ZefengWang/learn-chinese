#!/usr/bin/env python3
"""
批量下载中文发音 MP3（百度翻译 TTS），存入 audio/<group>/<id>.mp3

发音文本提取策略：
  initials/finals — 从 meaning 提取第一个汉字（"波 / bo" → "波"）
  tones          — 从 text 提取汉字（"mā 妈" → "妈"）
  characters     — text 就是汉字，直接用
  scenes         — text 就是完整句子，直接用
  minimal        — text 是对比句（"知道 / 资道"），直接整条读

用法：python3 scripts/download_audio.py
"""
import json, os, re, sys, urllib.request, urllib.parse, time, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / 'audio'
JS_DATA_DIR = ROOT / 'js' / 'data'

BAIDU_TTS = 'https://fanyi.baidu.com/gettts?lan=zh&text={text}&spd=3&source=web'

# 从字符串里提取第一个中文字
def first_hanzi(s: str) -> str:
    m = re.search(r'[\u4e00-\u9fff]', s)
    return m.group() if m else ''

def extract_speak_text(group: str, item: dict) -> str:
    """返回应该被用来合成发音的汉字/中文句子"""
    if group in ('initials', 'finals'):
        # meaning 字段形如 "波 / bo"，提取第一个汉字
        return first_hanzi(item.get('meaning', ''))
    elif group == 'tones':
        # text 形如 "mā 妈"，提取第一个汉字
        return first_hanzi(item.get('text', ''))
    elif group == 'characters':
        # text 就是汉字
        return item.get('text', '')
    elif group == 'scenes':
        return item.get('text', '')
    elif group == 'minimal':
        # text 形如 "知道 / 资道"，整条读出来
        return item.get('text', '').replace(' / ', '')
    return ''

def download_one(text: str, out_path: pathlib.Path) -> bool:
    url = BAIDU_TTS.format(text=urllib.parse.quote(text))
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 Chrome/120',
        'Referer': 'https://fanyi.baidu.com/',
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
        if len(data) < 500:  # 太短说明是错误响应
            return False
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(data)
        return True
    except Exception as e:
        print(f'  ✗ 下载失败: {e}', file=sys.stderr)
        return False

def load_data(group: str) -> list:
    fp = JS_DATA_DIR / f'{group}.js'
    src = fp.read_text(encoding='utf-8')
    # 把 window.Data_xxx = [...] 转换成合法的 JS 表达式并 eval
    prefix = f'window.Data_{group} = '
    if prefix not in src:
        raise ValueError(f'找不到 {prefix} 在 {fp}')
    expr = src.split(prefix, 1)[1].rsplit(';', 1)[0]
    # 用 Node 跑一下拿到 JSON
    import subprocess
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

def main():
    AUDIO_DIR.mkdir(exist_ok=True)
    groups = ['initials', 'finals', 'tones', 'characters', 'scenes', 'minimal']
    total_ok = 0
    total_fail = 0
    total_skip = 0

    for group in groups:
        items = load_data(group)
        print(f'\n=== {group} ({len(items)} 条) ===')
        ok = fail = skip = 0
        for item in items:
            speak_text = extract_speak_text(group, item)
            if not speak_text:
                print(f'  SKIP  {item.get("id","?")} — 无法提取发音文本')
                skip += 1; total_skip += 1
                continue

            out = AUDIO_DIR / group / f'{item["id"]}.mp3'
            if out.exists() and out.stat().st_size > 500:
                print(f'  CACHE {item["id"]}  → {speak_text}')
                ok += 1; total_ok += 1
                continue

            print(f'  DL    {item["id"]}  → {speak_text}')
            if download_one(speak_text, out):
                ok += 1; total_ok += 1
            else:
                fail += 1; total_fail += 1
            time.sleep(0.15)  # 对百度客气点

        print(f'  本组合计: OK={ok}  FAIL={fail}  SKIP={skip}')

    print(f'\n=== 总合计: OK={total_ok}  FAIL={total_fail}  SKIP={total_skip} ===')
    return 0 if total_fail == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
