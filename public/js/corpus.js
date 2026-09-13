/**
 * 中文发音语料库（分模块组织，便于按需加载）
 * 每个条目: { id, text, pinyin, meaning, group, tone }
 * - text: 实际朗读的文本
 * - pinyin: 拼音标注（展示用）
 * - meaning: 英文释义（面向外国学习者）
 * - group: 所属分组（声母/韵母/声调/常用字/场景）
 * - tone: 声调标记 1-5（5=轻声）
 */

// ========== 声母 Initials（23 个）==========
const INITIALS = [
  { id: 'b',  text: 'bō',  pinyin: 'bō',  meaning: '波 / bo',   group: 'initials' },
  { id: 'p',  text: 'pō',  pinyin: 'pō',  meaning: '坡 / po',   group: 'initials' },
  { id: 'm',  text: 'mō',  pinyin: 'mō',  meaning: '摸 / mo',   group: 'initials' },
  { id: 'f',  text: 'fō',  pinyin: 'fō',  meaning: '佛 / fo',   group: 'initials' },
  { id: 'd',  text: 'dē',  pinyin: 'dē',  meaning: '得 / de',   group: 'initials' },
  { id: 't',  text: 'tē',  pinyin: 'tē',  meaning: '特 / te',   group: 'initials' },
  { id: 'n',  text: 'nē',  pinyin: 'nē',  meaning: '呢 / ne',   group: 'initials' },
  { id: 'l',  text: 'lē',  pinyin: 'lē',  meaning: '了 / le',   group: 'initials' },
  { id: 'g',  text: 'gē',  pinyin: 'gē',  meaning: '哥 / ge',   group: 'initials' },
  { id: 'k',  text: 'kē',  pinyin: 'kē',  meaning: '科 / ke',   group: 'initials' },
  { id: 'h',  text: 'hē',  pinyin: 'hē',  meaning: '喝 / he',   group: 'initials' },
  { id: 'j',  text: 'jī',  pinyin: 'jī',  meaning: '鸡 / ji',   group: 'initials' },
  { id: 'q',  text: 'qī',  pinyin: 'qī',  meaning: '七 / qi',   group: 'initials' },
  { id: 'x',  text: 'xī',  pinyin: 'xī',  meaning: '西 / xi',   group: 'initials' },
  { id: 'zh', text: 'zhī', pinyin: 'zhī', meaning: '知 / zhi',  group: 'initials' },
  { id: 'ch', text: 'chī', pinyin: 'chī', meaning: '吃 / chi',  group: 'initials' },
  { id: 'sh', text: 'shī', pinyin: 'shī', meaning: '师 / shi',  group: 'initials' },
  { id: 'r',  text: 'rī',  pinyin: 'rī',  meaning: '日 / ri',   group: 'initials' },
  { id: 'z',  text: 'zī',  pinyin: 'zī',  meaning: '资 / zi',   group: 'initials' },
  { id: 'c',  text: 'cī',  pinyin: 'cī',  meaning: '次 / ci',   group: 'initials' },
  { id: 's',  text: 'sī',  pinyin: 'sī',  meaning: '思 / si',   group: 'initials' },
  { id: 'y',  text: 'yī',  pinyin: 'yī',  meaning: '一 / yi',   group: 'initials' },
  { id: 'w',  text: 'wū',  pinyin: 'wū',  meaning: '乌 / wu',   group: 'initials' },
];

// ========== 韵母 Finals（24 个）==========
const FINALS = [
  // 单元音 6
  { id: 'a',   text: 'ā',    pinyin: 'ā',    meaning: '啊 / a',     group: 'finals' },
  { id: 'o',   text: 'ō',    pinyin: 'ō',    meaning: '哦 / o',     group: 'finals' },
  { id: 'e',   text: 'ē',    pinyin: 'ē',    meaning: '呃 / e',     group: 'finals' },
  { id: 'i',   text: 'ī',    pinyin: 'ī',    meaning: '衣 / i',     group: 'finals' },
  { id: 'u',   text: 'ū',    pinyin: 'ū',    meaning: '乌 / u',     group: 'finals' },
  { id: 'ü',   text: 'ǖ',    pinyin: 'ǖ',    meaning: '鱼 / ü',     group: 'finals' },
  // 复韵母 9
  { id: 'ai',  text: 'āi',   pinyin: 'āi',   meaning: '爱 / ai',    group: 'finals' },
  { id: 'ei',  text: 'ēi',   pinyin: 'ēi',   meaning: '诶 / ei',    group: 'finals' },
  { id: 'ui',  text: 'wēi',  pinyin: 'wēi',  meaning: '微 / ui',    group: 'finals' },
  { id: 'ao',  text: 'āo',   pinyin: 'āo',   meaning: '凹 / ao',    group: 'finals' },
  { id: 'ou',  text: 'ōu',   pinyin: 'ōu',   meaning: '欧 / ou',    group: 'finals' },
  { id: 'iu',  text: 'yōu',  pinyin: 'yōu',  meaning: '优 / iu',    group: 'finals' },
  { id: 'ie',  text: 'yē',   pinyin: 'yē',   meaning: '耶 / ie',    group: 'finals' },
  { id: 'üe',  text: 'yuē',  pinyin: 'yuē',  meaning: '约 / üe',    group: 'finals' },
  { id: 'er',  text: 'ér',   pinyin: 'ér',   meaning: '儿 / er',    group: 'finals' },
  // 前鼻韵母 5
  { id: 'an',  text: 'ān',   pinyin: 'ān',   meaning: '安 / an',    group: 'finals' },
  { id: 'en',  text: 'ēn',   pinyin: 'ēn',   meaning: '恩 / en',    group: 'finals' },
  { id: 'in',  text: 'yīn',  pinyin: 'yīn',  meaning: '音 / in',    group: 'finals' },
  { id: 'un',  text: 'wēn',  pinyin: 'wēn',  meaning: '温 / un',    group: 'finals' },
  { id: 'ün',  text: 'yūn',  pinyin: 'yūn',  meaning: '晕 / ün',    group: 'finals' },
  // 后鼻韵母 4
  { id: 'ang', text: 'āng',  pinyin: 'āng',  meaning: '昂 / ang',   group: 'finals' },
  { id: 'eng', text: 'ēng',  pinyin: 'ēng',  meaning: '嗯 / eng',   group: 'finals' },
  { id: 'ing', text: 'yīng', pinyin: 'yīng', meaning: '英 / ing',   group: 'finals' },
  { id: 'ong', text: 'wēng', pinyin: 'wēng', meaning: '翁 / ong',   group: 'finals' },
];

// ========== 声调示范 Tone Demos ==========
// 用同一个音节 ma 对比 4 声 + 轻声
const TONES = [
  { id: 'ma-1', text: 'mā 妈',  pinyin: 'mā',  meaning: 'mother',         tone: 1, group: 'tones' },
  { id: 'ma-2', text: 'má 麻',  pinyin: 'má',  meaning: 'hemp / numb',    tone: 2, group: 'tones' },
  { id: 'ma-3', text: 'mǎ 马',  pinyin: 'mǎ',  meaning: 'horse',          tone: 3, group: 'tones' },
  { id: 'ma-4', text: 'mà 骂',  pinyin: 'mà',  meaning: 'to scold',       tone: 4, group: 'tones' },
  { id: 'ma-5', text: 'ma 吗',  pinyin: 'ma',  meaning: 'question particle', tone: 5, group: 'tones' },
  { id: 'shi-1', text: 'shī 师', pinyin: 'shī', meaning: 'teacher',       tone: 1, group: 'tones' },
  { id: 'shi-2', text: 'shí 十', pinyin: 'shí', meaning: 'ten',            tone: 2, group: 'tones' },
  { id: 'shi-3', text: 'shǐ 使', pinyin: 'shǐ', meaning: 'to use',         tone: 3, group: 'tones' },
  { id: 'shi-4', text: 'shì 是', pinyin: 'shì', meaning: 'is / yes',       tone: 4, group: 'tones' },
];

// ========== 常用字 Common Characters（HSK 1 精选 30）==========
const CHARACTERS = [
  // 人称代词
  { id: 'wo',  text: '我', pinyin: 'wǒ',  meaning: 'I / me',           group: 'chars' },
  { id: 'ni',  text: '你', pinyin: 'nǐ',  meaning: 'you',              group: 'chars' },
  { id: 'ta',  text: '他', pinyin: 'tā',  meaning: 'he / him',         group: 'chars' },
  { id: 'ta2', text: '她', pinyin: 'tā',  meaning: 'she / her',        group: 'chars' },
  { id: 'men', text: '们', pinyin: 'men', meaning: 'plural marker',    group: 'chars' },
  // 常用动词
  { id: 'shi', text: '是', pinyin: 'shì', meaning: 'to be',            group: 'chars' },
  { id: 'you', text: '有', pinyin: 'yǒu', meaning: 'to have',          group: 'chars' },
  { id: 'qu',  text: '去', pinyin: 'qù',  meaning: 'to go',            group: 'chars' },
  { id: 'lai', text: '来', pinyin: 'lái', meaning: 'to come',          group: 'chars' },
  { id: 'chi', text: '吃', pinyin: 'chī', meaning: 'to eat',           group: 'chars' },
  { id: 'he',  text: '喝', pinyin: 'hē',  meaning: 'to drink',         group: 'chars' },
  { id: 'kan', text: '看', pinyin: 'kàn', meaning: 'to look / see',    group: 'chars' },
  { id: 'ting',text: '听', pinyin: 'tīng',meaning: 'to listen',        group: 'chars' },
  { id: 'shuo',text: '说', pinyin: 'shuō',meaning: 'to speak',         group: 'chars' },
  { id: 'xie', text: '写', pinyin: 'xiě', meaning: 'to write',         group: 'chars' },
  { id: 'xue', text: '学', pinyin: 'xué', meaning: 'to study',         group: 'chars' },
  { id: 'hui', text: '会', pinyin: 'huì', meaning: 'can / to meet',     group: 'chars' },
  { id: 'xiang',text:'想', pinyin: 'xiǎng',meaning:'to want / think',  group: 'chars' },
  // 形容词
  { id: 'hao', text: '好', pinyin: 'hǎo', meaning: 'good',             group: 'chars' },
  { id: 'da',  text: '大', pinyin: 'dà',  meaning: 'big',             group: 'chars' },
  { id: 'xiao',text: '小', pinyin: 'xiǎo',meaning: 'small',           group: 'chars' },
  { id: 'gui', text: '贵', pinyin: 'guì', meaning: 'expensive',        group: 'chars' },
  { id: 'piányi', text:'便', pinyin:'pián',meaning: 'cheap (part1)',  group: 'chars' },
  // 数词
  { id: 'yi',  text: '一', pinyin: 'yī',  meaning: 'one',              group: 'chars' },
  { id: 'er',  text: '二', pinyin: 'èr',  meaning: 'two',              group: 'chars' },
  { id: 'san', text: '三', pinyin: 'sān', meaning: 'three',           group: 'chars' },
  { id: 'si',  text: '四', pinyin: 'sì',  meaning: 'four',            group: 'chars' },
  { id: 'wu',  text: '五', pinyin: 'wǔ',  meaning: 'five',            group: 'chars' },
  { id: 'da2', text: '八', pinyin: 'bā',  meaning: 'eight',           group: 'chars' },
  { id: 'shi', text: '十', pinyin: 'shí', meaning: 'ten',             group: 'chars' },
  // 时间
  { id: 'jin', text: '今', pinyin: 'jīn', meaning: 'today (part1)',   group: 'chars' },
  { id: 'tian',text: '天', pinyin: 'tiān',meaning: 'sky / day',       group: 'chars' },
  { id: 'shang',text:'上', pinyin: 'shàng',meaning: 'up / last',      group: 'chars' },
  { id: 'xia', text: '下', pinyin: 'xià', meaning: 'down / next',     group: 'chars' },
];

// ========== 场景句子 Scenario Sentences ==========
const SCENES = [
  // 打招呼
  { id: 'greet-1', text: '你好！',           pinyin: 'Nǐ hǎo!',         meaning: 'Hello!',                      scene: '打招呼', group: 'scenes' },
  { id: 'greet-2', text: '我叫李明。',       pinyin: 'Wǒ jiào Lǐ Míng.',meaning: 'My name is Li Ming.',         scene: '打招呼', group: 'scenes' },
  { id: 'greet-3', text: '我是美国人。',     pinyin: 'Wǒ shì Měiguó rén.',meaning: 'I am American.',             scene: '打招呼', group: 'scenes' },
  { id: 'greet-4', text: '很高兴认识你。',   pinyin: 'Hěn gāoxìng rènshi nǐ.',meaning: 'Nice to meet you.',         scene: '打招呼', group: 'scenes' },
  { id: 'greet-5', text: '谢谢！再见！',     pinyin: 'Xièxie! Zàijiàn!',meaning: 'Thanks! Bye!',                scene: '打招呼', group: 'scenes' },
  // 点餐
  { id: 'order-1', text: '请问有菜单吗？',   pinyin: 'Qǐngwèn yǒu càidān ma?',meaning: 'Do you have a menu?',      scene: '点餐',   group: 'scenes' },
  { id: 'order-2', text: '我要一份宫保鸡丁。',pinyin:'Wǒ yào yī fèn Gōngbǎo jīdīng.',meaning: 'I want Kung Pao Chicken.', scene: '点餐', group: 'scenes' },
  { id: 'order-3', text: '要辣的还是不辣的？',pinyin:'Yào là de háishi bù là de?',meaning: 'Spicy or not spicy?',       scene: '点餐',   group: 'scenes' },
  { id: 'order-4', text: '买单，谢谢。',     pinyin: 'Mǎidān, xièxie.', meaning: 'Check please, thanks.',       scene: '点餐',   group: 'scenes' },
  { id: 'order-5', text: '这个多少钱？',     pinyin: 'Zhège duōshao qián?',meaning: 'How much is this?',          scene: '点餐',   group: 'scenes' },
  // 问路
  { id: 'dir-1', text: '请问地铁站怎么走？', pinyin: 'Qǐngwèn dìtiě zhàn zěnme zǒu?',meaning:'How to get to the metro?',scene:'问路', group:'scenes' },
  { id: 'dir-2', text: '往左走，然后右转。', pinyin: 'Wǎng zuǒ zǒu, ránhòu yòu zhuǎn.',meaning: 'Go left, then turn right.', scene: '问路', group: 'scenes' },
  { id: 'dir-3', text: '远不远？走路要多久？',pinyin:'Yuǎn bù yuǎn? Zǒulù yào duōjiǔ?',meaning:'Is it far? How long on foot?', scene:'问路', group:'scenes' },
  // 购物
  { id: 'shop-1', text: '这个多少钱？便宜点？',pinyin:'Zhège duōshao qián? Piányi diǎn?',meaning:'How much? Any discount?', scene:'购物', group:'scenes' },
  { id: 'shop-2', text: '我要这个，红色的。', pinyin: 'Wǒ yào zhège, hóngsè de.',meaning: 'I want this one, red color.',    scene: '购物', group: 'scenes' },
  { id: 'shop-3', text: '太贵了！能不能便宜？',pinyin:'Tài guì le! Néng bu néng piányi?',meaning:'Too expensive! Any discount?', scene:'购物', group:'scenes' },
  // 打车
  { id: 'taxi-1', text: '去首都机场。',       pinyin: 'Qù Shǒudū Jīchǎng.',meaning: 'To Capital Airport.',              scene: '打车',   group: 'scenes' },
  { id: 'taxi-2', text: '大概多少钱？',       pinyin: 'Dàgài duōshao qián?',meaning: 'About how much?',                 scene: '打车',   group: 'scenes' },
  // 数字
  { id: 'num-1',  text: '一百二十三元。',     pinyin: 'Yī bǎi èr shí sān yuán.',meaning: '123 yuan.',                      scene: '数字',   group: 'scenes' },
  { id: 'num-2',  text: '现在几点了？',       pinyin: 'Xiànzài jǐ diǎn le?',meaning: 'What time is it now?',             scene: '数字',   group: 'scenes' },
  { id: 'num-3',  text: '我今年二十五岁。',   pinyin: 'Wǒ jīnnián èrshíwǔ suì.',meaning: 'I am 25 years old.',             scene: '数字',   group: 'scenes' },
];

// ========== 最小对立体 Minimal Pairs（针对难发音）==========
const MINIMAL_PAIRS = [
  // zh vs z（平翘舌）
  { id: 'zh-z-1', text: '知道 / 资道', pinyin: 'zhīdào / zīdào', meaning: 'know / (non-standard)', contrast: 'zh-z', group: 'minimal' },
  { id: 'zh-z-2', text: '找人 / 早人', pinyin: 'zhǎo rén / zǎo rén', meaning: 'find person / early person', contrast: 'zh-z', group: 'minimal' },
  { id: 'shi-si', text: '四十 / 事实', pinyin: 'sìshí / shìshí', meaning: 'forty / fact', contrast: 's-sh', group: 'minimal' },
  // b/p（送气 vs 不送气，日/韩特色难点）
  { id: 'b-p-1', text: '饱了 / 跑了', pinyin: 'bǎo le / pǎo le', meaning: 'full / ran', contrast: 'b-p', group: 'minimal' },
  { id: 'b-p-2', text: '白色 / 怕色', pinyin: 'báisè / pàisè', meaning: 'white / scared color', contrast: 'b-p', group: 'minimal' },
  // n/l
  { id: 'n-l-1', text: '男人 / 蓝人', pinyin: 'nánrén / lánrén', meaning: 'man / blue person', contrast: 'n-l', group: 'minimal' },
  { id: 'n-l-2', text: '你好 / 李好', pinyin: 'nǐ hǎo / lǐ hǎo', meaning: 'hello / Li hello', contrast: 'n-l', group: 'minimal' },
  // ü vs u
  { id: 'ü-u-1', text: '旅游 / 路游', pinyin: 'lǚyóu / lùyóu', meaning: 'travel / road swim', contrast: 'ü-u', group: 'minimal' },
  { id: 'ü-u-2', text: '鱼肉 / 牛肉', pinyin: 'yúròu / niúròu', meaning: 'fish meat / beef', contrast: 'ü-u', group: 'minimal' },
  // -n vs -ng（后鼻音，日/韩/东南亚特色难点）
  { id: 'n-ng-1', text: '三 / 桑', pinyin: 'sān / sāng', meaning: 'three / mulberry', contrast: 'n-ng', group: 'minimal' },
  { id: 'n-ng-2', text: '沉 / 成', pinyin: 'chén / chéng', meaning: 'sink / become', contrast: 'n-ng', group: 'minimal' },
];

// ========== 统一导出 ==========
const CORPUS = {
  initials: INITIALS,
  finals: FINALS,
  tones: TONES,
  chars: CHARACTERS,
  scenes: SCENES,
  minimal: MINIMAL_PAIRS,
};

const GROUP_META = {
  initials: { label: '声母 Initials',       icon: '🔤', desc: '23 个声母，点击听发音' },
  finals:   { label: '韵母 Finals',         icon: '🔡', desc: '24 个韵母，点击听发音' },
  tones:    { label: '四声 Tones',          icon: '🎵', desc: '同一个音节的四种声调对比' },
  chars:    { label: '常用字 Characters',    icon: '📝', desc: 'HSK 1 级高频字' },
  scenes:   { label: '场景句子 Sentences',  icon: '💬', desc: '真实交流场景中的句子' },
  minimal:  { label: '最小对立体 Minimal',  icon: '⚡', desc: '针对 zh/z、b/p、n/l、ü/u、-n/-ng' },
};
