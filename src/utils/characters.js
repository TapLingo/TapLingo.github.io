export const ENGLISH_ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const HANGUL_CONSONANTS = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

export const HANGUL_CONSONANT_NAMES = [
  '기역', '니은', '디귿', '리을', '미음', '비읍', '시옷', '이응', '지읒', '치읓', '키읔', '티읕', '피읖', '히읗'
];

export const HANGUL_CONSONANT_SOUNDS = [
  '그', '느', '드', '르', '므', '브', '스', '으', '즈', '츠', '크', '트', '프', '흐'
];

export const HANGUL_VOWELS = [
  'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'
];

export const ALL_HANGUL = [...HANGUL_CONSONANTS, ...HANGUL_VOWELS];

export const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const NUMBERS_KOREAN_NATIVE = ['하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];

export const NUMBERS_KOREAN_SINO = ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십'];

export const NUMBERS_ENGLISH = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
