#!/usr/bin/env python3
"""
批量下载中文发音 MP3（百度翻译 TTS），存入 audio/<group>/<id>.mp3

语速配置（GROUP_SPD）：
  initials: 9 — 快语速，发音短而轻，像教材里的声母轻声示范
  finals:   5 — 中速
  其他:     3 — 默认

发音文本提取策略：
  initials/finals — 从 meaning 提取第一个汉字
  tones/characters — 从 text 提取汉字
  scenes/minimal  — text 整条读

用法：python3 scripts/download_audio.py
"""
import json, os, re, sys, urllib.request, urllib.parse, time, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / 'audio'
JS_DATA_DIR = ROOT / 'js' / 'data'

BAIDU_TTS = 'https://fanyi.baidu.com/gettts?lan=zh&text={text}&spd={spd}&source=web'

# 各分组语速配置（1-9，9最快）
GROUP_SPD = {
    'initials':   3,   # 快语速 → 像轻声示范
    'finals':     3,   # 中速
    'tones':      3,   # 默认
    'characters': 3,
    'scenes':     3,
    'minimal':    3,
}

def first_hanzi(s: str) -> str:
    m = re.search(r'[\u4e00-\u9fff]', s or '')
    return m.group() if m else ''

def extract_speak_text(group: str, item: dict) -> str:
    if group in ('initials', 'finals'):
        # 直接用纯拼音让 TTS 读，避免汉字自带声调！
        # 百度 TTS 输入 "fo" 会读轻声 fo，输入 "佛" 会读二声 fó
        raw = item.get('pinyin', item.get('text', ''))
        # 拼音规范化：ü 字母替换为 yu，TTS 才能正确发音
        # ü 单韵母 = yu (迂), üe = yue, ün = yun
        return raw.replace('ü', 'yu')
    elif group == 'tones':
        return first_hanzi(item.get('text', ''))
    elif group == 'characters':
        return item.get('text', '')
    elif group == 'scenes':
        return item.get('text', '')
    elif group == 'minimal':
        return item.get('text', '').replace(' / ', '')
    return ''

def download_one(text: str, out_path: pathlib.Path, spd: int = 3) -> bool:
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
        print(f'  ✗ 下载失败: {e}', file=sys.stderr)
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

def main():
    AUDIO_DIR.mkdir(exist_ok=True)
    groups = ['initials', 'finals', 'tones', 'characters', 'scenes', 'minimal']
    total_ok = total_fail = total_skip = 0

    for group in groups:
        items = load_data(group)
        spd = GROUP_SPD.get(group, 3)
        print(f'\n=== {group} ({len(items)} 条, spd={spd}) ===')
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
            if download_one(speak_text, out, spd):
                ok += 1; total_ok += 1
            else:
                fail += 1; total_fail += 1
            time.sleep(0.15)

        print(f'  本组合计: OK={ok}  FAIL={fail}  SKIP={skip}')

    print(f'\n=== 总合计: OK={total_ok}  FAIL={total_fail}  SKIP={total_skip} ===')
    return 0 if total_fail == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
