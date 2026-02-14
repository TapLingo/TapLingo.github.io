export const ENGLISH_ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const ENGLISH_PHONICS_IPA = [
  '/æ/', '/b/', '/k/', '/d/', '/ɛ/', '/f/', '/g/', '/h/', '/ɪ/', '/dʒ/',
  '/k/', '/l/', '/m/', '/n/', '/ɑ/', '/p/', '/kw/', '/r/', '/s/', '/t/',
  '/ʌ/', '/v/', '/w/', '/ks/', '/j/', '/z/'
];

export const ENGLISH_PHONICS_SOUNDS = [
  'ae', 'buh', 'kuh', 'duh', 'eh', 'fuh', 'guh', 'huh', 'ih', 'juh',
  'kuh', 'luh', 'muh', 'nuh', 'ah', 'puh', 'kwuh', 'ruh', 'suh', 'tuh',
  'uh', 'vuh', 'wuh', 'ks', 'yuh', 'zuh'
];

export const HANGUL_CONSONANTS = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const HANGUL_CONSONANT_NAMES = [
  '기역', '니은', '디귿', '리을', '미음', '비읍', '시옷', '이응', '지읒', '치읓', '키읔', '티읕', '피읖', '히읗'
];

export const HANGUL_CONSONANT_SOUNDS = [
  '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐'
];

export const HANGUL_SYLLABLES = [
  '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'
];

export const HANGUL_VOWELS = [
  'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'
];

export const HANGUL_VOWEL_NAMES = [
  '아', '야', '어', '여', '오', '요', '우', '유', '으', '이'
];

export const HANGUL_DOUBLE_CONSONANTS = [
  'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'
];

export const HANGUL_DOUBLE_CONSONANT_NAMES = [
  '쌍기역', '쌍디귿', '쌍비읍', '쌍시옷', '쌍지읒'
];

export const HANGUL_DOUBLE_CONSONANT_SOUNDS = [
  '끄', '뜨', '쁘', '쓰', '쯔'
];

export const ALL_HANGUL = [...HANGUL_CONSONANTS, ...HANGUL_SYLLABLES];

export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const NUMBERS_KOREAN_NATIVE = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

export const NUMBERS_KOREAN_SINO = ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];

export const NUMBERS_ENGLISH = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

export const PLACE_VALUES = [
  '1', '10', '100', '1,000', '10,000', '100,000', '1,000,000'
];

export const PLACE_VALUES_KOREAN = [
  '일', '십', '백', '천', '만', '십만', '백만'
];

export const PLACE_VALUES_ENGLISH = [
  'one', 'ten', 'hundred', 'thousand', 'ten thousand', 'hundred thousand', 'million'
];

export const SEA_ANIMALS = [
  { name: 'whale', image: '/animals/sea/whale.png' },
  { name: 'dolphin', image: '/animals/sea/dolphin.png' },
  { name: 'shark', image: '/animals/sea/shark.png' },
  { name: 'octopus', image: '/animals/sea/octopus.png' },
  { name: 'seahorse', image: '/animals/sea/seahorse.png' },
  { name: 'jellyfish', image: '/animals/sea/jellyfish.png' },
  { name: 'crab', image: '/animals/sea/crab.png' },
  { name: 'clownfish', image: '/animals/sea/clownfish.png' },
  { name: 'penguin', image: '/animals/sea/penguin.png' },
  { name: 'starfish', image: '/animals/sea/starfish.png' },
  { name: 'seal', image: '/animals/sea/seal.png' },
  { name: 'walrus', image: '/animals/sea/walrus.png' },
  { name: 'stingray', image: '/animals/sea/stingray.png' },
  { name: 'lobster', image: '/animals/sea/lobster.png' },
  { name: 'shrimp', image: '/animals/sea/shrimp.png' },
  { name: 'sea otter', image: '/animals/sea/sea_otter.png' },
  { name: 'squid', image: '/animals/sea/squid.png' },
  { name: 'pufferfish', image: '/animals/sea/pufferfish.png' },
  { name: 'turtle', image: '/animals/sea/turtle.png' }
];

export const LAND_ANIMALS = [
  { name: 'dog', image: '/animals/land/dog.png' },
  { name: 'cat', image: '/animals/land/cat.png' },
  { name: 'lion', image: '/animals/land/lion.png' },
  { name: 'elephant', image: '/animals/land/elephant.png' },
  { name: 'bear', image: '/animals/land/bear.png' },
  { name: 'rabbit', image: '/animals/land/rabbit.png' },
  { name: 'horse', image: '/animals/land/horse.png' },
  { name: 'tiger', image: '/animals/land/tiger.png' },
  { name: 'giraffe', image: '/animals/land/giraffe.png' },
  { name: 'fox', image: '/animals/land/fox.png' },
  { name: 'deer', image: '/animals/land/deer.png' },
  { name: 'wolf', image: '/animals/land/wolf.png' },
  { name: 'monkey', image: '/animals/land/monkey.png' },
  { name: 'panda', image: '/animals/land/panda.png' },
  { name: 'koala', image: '/animals/land/koala.png' },
  { name: 'hippo', image: '/animals/land/hippo.png' },
  { name: 'zebra', image: '/animals/land/zebra.png' },
  { name: 'cow', image: '/animals/land/cow.png' },
  { name: 'gorilla', image: '/animals/land/gorilla.png' }
];

export const INSECT_ANIMALS = [
  { name: 'butterfly', image: '/animals/insects/butterfly.png' },
  { name: 'bee', image: '/animals/insects/bee.png' },
  { name: 'ladybug', image: '/animals/insects/ladybug.png' },
  { name: 'ant', image: '/animals/insects/ant.png' },
  { name: 'dragonfly', image: '/animals/insects/dragonfly.png' },
  { name: 'grasshopper', image: '/animals/insects/grasshopper.png' },
  { name: 'beetle', image: '/animals/insects/beetle.png' },
  { name: 'caterpillar', image: '/animals/insects/caterpillar.png' },
  { name: 'firefly', image: '/animals/insects/firefly.png' },
  { name: 'cricket', image: '/animals/insects/cricket.png' },
  { name: 'mantis', image: '/animals/insects/mantis.png' },
  { name: 'cicada', image: '/animals/insects/cicada.png' },
  { name: 'moth', image: '/animals/insects/moth.png' },
  { name: 'spider', image: '/animals/insects/spider.png' },
  { name: 'centipede', image: '/animals/insects/centipede.png' },
  { name: 'wasp', image: '/animals/insects/wasp.png' },
  { name: 'scorpion', image: '/animals/insects/scorpion.png' },
  { name: 'snail', image: '/animals/insects/snail.png' },
  { name: 'mosquito', image: '/animals/insects/mosquito.png' },
  { name: 'stag beetle', image: '/animals/insects/stag_beetle.png' }
];
