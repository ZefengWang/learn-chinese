/**
 * 最小对立体 — 针对 5 母语群体的特色难点
 * contrast 字段: zh-z / s-sh / b-p / n-l / ü-u / n-ng
 */
window.Data_minimal = [
  // zh vs z
  { id: 'zz1', text: '知道 / 资道', pinyin: 'zhīdào / zīdào',   meaning: 'know / (non-standard)',  contrast: 'zh-z' },
  { id: 'zz2', text: '找人 / 早人', pinyin: 'zhǎo rén / zǎo rén', meaning: 'find / early',          contrast: 'zh-z' },
  { id: 'ss1', text: '四十 / 事实', pinyin: 'sìshí / shìshí',   meaning: 'forty / fact',           contrast: 's-sh' },
  // b vs p（日/韩特色难点）
  { id: 'bp1', text: '饱了 / 跑了', pinyin: 'bǎo le / pǎo le',   meaning: 'full / ran',            contrast: 'b-p' },
  { id: 'bp2', text: '白色 / 怕色', pinyin: 'báisè / pàisè',     meaning: 'white / scared',        contrast: 'b-p' },
  // n vs l
  { id: 'nl1', text: '男人 / 蓝人', pinyin: 'nánrén / lánrén',   meaning: 'man / blue person',     contrast: 'n-l' },
  { id: 'nl2', text: '你好 / 李好', pinyin: 'nǐ hǎo / lǐ hǎo',   meaning: 'hello / Li hello',      contrast: 'n-l' },
  // ü vs u（英语特色难点）
  { id: 'uu1', text: '旅游 / 路游', pinyin: 'lǚyóu / lùyóu',     meaning: 'travel / road swim',    contrast: 'ü-u' },
  { id: 'uu2', text: '鱼肉 / 牛肉', pinyin: 'yúròu / niúròu',   meaning: 'fish / beef',           contrast: 'ü-u' },
  // -n vs -ng（日/韩/东南亚特色难点）
  { id: 'nn1', text: '三 / 桑',     pinyin: 'sān / sāng',         meaning: 'three / mulberry',      contrast: 'n-ng' },
  { id: 'nn2', text: '沉 / 成',     pinyin: 'chén / chéng',       meaning: 'sink / become',         contrast: 'n-ng' },
];
