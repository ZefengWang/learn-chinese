/**
 * 声母语料（23 个）
 * 每个条目: { id, text, pinyin, meaning }
 *
 * 标注原则：不编造不存在的音节。
 *   de/te/ne/le 没有第一声 → 标实际存在的声调
 *   示范字选百度 TTS 读音最稳定的
 */
window.Data_initials = [
  // 唇音 b/p/m/f — 配 o 韵母
  { id: 'b',  text: 'bō',  pinyin: 'bō',  meaning: '波 / bō' },
  { id: 'p',  text: 'pō',  pinyin: 'pō',  meaning: '坡 / pō' },
  { id: 'm',  text: 'mō',  pinyin: 'mō',  meaning: '摸 / mō' },
  { id: 'f',  text: 'fó',  pinyin: 'fó',  meaning: '佛 / fó' },
  // 舌尖音 d/t/n/l — 配 e 韵母
  // 注：de/te/ne/le 没有第一声，标注实际存在的声调
  { id: 'd',  text: 'dé',  pinyin: 'dé',  meaning: '得 / dé' },
  { id: 't',  text: 'tè',  pinyin: 'tè',  meaning: '特 / tè' },
  { id: 'n',  text: 'ne',  pinyin: 'ne',  meaning: '呢 / ne' },
  { id: 'l',  text: 'le',  pinyin: 'le',  meaning: '了 / le' },
  // 舌根音 g/k/h — 配 e 韵母
  { id: 'g',  text: 'gē',  pinyin: 'gē',  meaning: '哥 / gē' },
  { id: 'k',  text: 'kē',  pinyin: 'kē',  meaning: '科 / kē' },
  { id: 'h',  text: 'hē',  pinyin: 'hē',  meaning: '喝 / hē' },
  // 舌面音 j/q/x — 配 i 韵母
  { id: 'j',  text: 'jī',  pinyin: 'jī',  meaning: '鸡 / jī' },
  { id: 'q',  text: 'qī',  pinyin: 'qī',  meaning: '七 / qī' },
  { id: 'x',  text: 'xī',  pinyin: 'xī',  meaning: '西 / xī' },
  // 翘舌音 zh/ch/sh/r — 配舌尖元音
  { id: 'zh', text: 'zhī', pinyin: 'zhī', meaning: '知 / zhī' },
  { id: 'ch', text: 'chī', pinyin: 'chī', meaning: '吃 / chī' },
  { id: 'sh', text: 'shī', pinyin: 'shī', meaning: '师 / shī' },
  { id: 'r',  text: 'rén', pinyin: 'rén', meaning: '人 / rén' },
  // 平舌音 z/c/s — 配舌尖元音
  { id: 'z',  text: 'zī',  pinyin: 'zī',  meaning: '资 / zī' },
  { id: 'c',  text: 'cí',  pinyin: 'cí',  meaning: '词 / cí' },
  { id: 's',  text: 'sī',  pinyin: 'sī',  meaning: '思 / sī' },
  // 零声母 y/w
  { id: 'y',  text: 'yī',  pinyin: 'yī',  meaning: '一 / yī' },
  { id: 'w',  text: 'wū',  pinyin: 'wū',  meaning: '乌 / wū' },
];
