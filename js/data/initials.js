/**
 * 声母语料（23 个）
 * 数据来源：《汉语拼音方案》声母表（国家标准 1958）
 *
 * 示范字 = 官方规定的声母表汉字：
 *   b 玻  p 坡  m 摸  f 佛  d 得  t 特  n 讷  l 勒
 *   g 哥  k 科  h 喝  j 基  q 欺  x 希
 *   zh 知  ch 嗤  sh 诗  r 日
 *   z 资  c 雌  s 思
 *   y —（无字，读 yī）  w —（无字，读 wū）
 *
 * text/pinyin 不带声调（轻声示范），目的是突出声母发音本身。
 * meaning 里的 pinyin 带正确声调方便学习者对照。
 */
window.Data_initials = [
  { id: 'b',  text: 'bō',  pinyin: 'bō',  meaning: '玻 / bō' },
  { id: 'p',  text: 'pō',  pinyin: 'pō',  meaning: '坡 / pō' },
  { id: 'm',  text: 'mō',  pinyin: 'mō',  meaning: '摸 / mō' },
  { id: 'f',  text: 'fó',  pinyin: 'fó',  meaning: '佛 / fó' },
  { id: 'd',  text: 'dé',  pinyin: 'dé',  meaning: '得 / dé' },
  { id: 't',  text: 'tè',  pinyin: 'tè',  meaning: '特 / tè' },
  { id: 'n',  text: 'nè',  pinyin: 'nè',  meaning: '讷 / nè' },
  { id: 'l',  text: 'lè',  pinyin: 'lè',  meaning: '勒 / lè' },
  { id: 'g',  text: 'gē',  pinyin: 'gē',  meaning: '哥 / gē' },
  { id: 'k',  text: 'kē',  pinyin: 'kē',  meaning: '科 / kē' },
  { id: 'h',  text: 'hē',  pinyin: 'hē',  meaning: '喝 / hē' },
  { id: 'j',  text: 'jī',  pinyin: 'jī',  meaning: '基 / jī' },
  { id: 'q',  text: 'qī',  pinyin: 'qī',  meaning: '欺 / qī' },
  { id: 'x',  text: 'xī',  pinyin: 'xī',  meaning: '希 / xī' },
  { id: 'zh', text: 'zhī', pinyin: 'zhī', meaning: '知 / zhī' },
  { id: 'ch', text: 'chī', pinyin: 'chī', meaning: '嗤 / chī' },
  { id: 'sh', text: 'shī', pinyin: 'shī', meaning: '诗 / shī' },
  { id: 'r',  text: 'rì',  pinyin: 'rì',  meaning: '日 / rì' },
  { id: 'z',  text: 'zī',  pinyin: 'zī',  meaning: '资 / zī' },
  { id: 'c',  text: 'cī',  pinyin: 'cī',  meaning: '雌 / cī' },
  { id: 's',  text: 'sī',  pinyin: 'sī',  meaning: '思 / sī' },
  { id: 'y',  text: 'yī',  pinyin: 'yī',  meaning: '一 / yī' },
  { id: 'w',  text: 'wū',  pinyin: 'wū',  meaning: '乌 / wū' },
];
