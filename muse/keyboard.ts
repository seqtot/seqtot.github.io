// vowel
// И - третья      i - С6
// Е - вторая      e - С5
// А - первая      a - С4
// O - малая       o - С3
// У - большая     y - С2
// Ы - контроктава u - С1
// -  субконтроктава - С0

export const octaveLetter = {
  /* lat */
  u: 'u',
  y: 'y',
  o: 'o',
  a: 'a',
  e: 'e',
  i: 'i',
  /* ru */
  ы: 'u',
  у: 'y',
  о: 'o',
  а: 'a',
  е: 'e',
  и: 'i',
};

export const stepIndex = {
  /* lat */
  d: 0,
  t: 1,
  r: 2,
  n: 3,
  m: 4,
  f: 5,
  v: 6,
  s: 7,
  z: 8,
  l: 9,
  k: 10,
  b: 11,
  /* ru */
  д: 0,
  т: 1,
  р: 2,
  н: 3,
  м: 4,
  ф: 5,
  в: 6,
  с: 7,
  з: 8,
  л: 9,
  к: 10,
  б: 11,
};

export const octaveLeft1 = {
  KeyX: 0,
  KeyS: 1,
  KeyW: 2,
  Digit2: 3,
  KeyZ: 4,
  KeyA: 5,
  KeyQ: 6,
  Digit1: 7,
  ShiftLeft: 8,
  CapsLock: 9,
  Tab: 10,
  Backquote: 11,
};

export const octaveLeft2 = {
  KeyB: 0,
  KeyG: 1,
  KeyT: 2,
  Digit5: 3,
  KeyV: 4,
  KeyF: 5,
  KeyR: 6,
  Digit4: 7,
  KeyC: 8,
  KeyD: 9,
  KeyE: 10,
  Digit3: 11,
};

export const octaveRight2 = {
  Comma: 0,
  KeyK: 1,
  KeyI: 2,
  Digit8: 3,
  KeyM: 4,
  KeyJ: 5,
  KeyU: 6,
  Digit7: 7,
  KeyN: 8,
  KeyH: 9,
  KeyY: 10,
  Digit6: 11,
};

export const octaveRight1 = {
  ShiftRight: 0,
  Quote: 1,
  BracketLeft: 2,
  Minus: 3,
  Slash: 4,
  Semicolon: 5,
  KeyP: 6,
  Digit0: 7,
  Period: 8,
  KeyL: 9,
  KeyO: 10,
  Digit9: 11,
};

export const octaveRight0 = {
  Equal: 11,
};

export const noteByCodeHash = {
  /* 1 ряд нижний з м д */
  ShiftLeft: 'зе',
  KeyZ: 'ме',
  KeyX: 'де',

  KeyC: 'за',
  KeyV: 'ма',
  KeyB: 'да',

  KeyN: 'зо',
  KeyM: 'мо',
  Comma: 'до',

  Period: 'зу',
  Slash: 'му',
  ShiftRight: 'ду',

  /* 2 ряд л Ф т */
  CapsLock: 'ле',
  KeyA: 'фе',
  KeyS: 'те',

  KeyD: 'ла',
  KeyF: 'фа',
  KeyG: 'та',

  KeyH: 'ло',
  KeyJ: 'фо',
  KeyK: 'то',

  KeyL: 'лу',
  Semicolon: 'фу',
  Quote: 'ту',

  /* 3 ряд к в р */
  Tab: 'ке',
  KeyQ: 'ве',
  KeyW: 'ре',

  KeyE: 'ка',
  KeyR: 'ва',
  KeyT: 'ра',

  KeyY: 'ко',
  KeyU: 'во',
  KeyI: 'ро',

  KeyO: 'ку',
  KeyP: 'ву',
  BracketLeft: 'ру',

  /* 4 ряд верхний б с н */
  Backquote: 'бе',
  Digit1: 'се',
  Digit2: 'не',

  Digit3: 'ба',
  Digit4: 'са',
  Digit5: 'на',

  Digit6: 'бо',
  Digit7: 'со',
  Digit8: 'но',

  Digit9: 'бу',
  Digit0: 'су',
  Minus: 'ну',

  KeyBu: 'бы',
  KeyKu: 'кы',
  KeyLu: 'лы',
  KeyZu: 'зы',
};

export const fullOctaveBlocks: { name: string; value: any }[] = [
  {
    name: 'left1',
    value: octaveLeft1,
  },
  {
    name: 'left2',
    value: octaveLeft2,
  },
  {
    name: 'right2',
    value: octaveRight2,
  },
  {
    name: 'right1',
    value: octaveRight1,
  },
  {
    name: 'right0',
    value: octaveRight0,
  },
];

export const defaultSynthSettings = {
  octaves: {
    left1: {
      octave: 'e',
      volume: 0.1,
      instr: 0,
    },
    left2: {
      octave: 'a',
      volume: 0.2,
      instr: 0,
    },
    right2: {
      octave: 'o',
      volume: 0.3,
      instr: 0,
    },
    right1: {
      octave: 'y',
      volume: 0.4,
      instr: 0,
    },
    right0: {
      octave: 'u',
      volume: 0.5,
      instr: 0,
    },
  },
};
