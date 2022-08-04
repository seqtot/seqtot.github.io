'use babel';

export type DrumType =
  | 'hiHatOpened'
  | 'hiHatPedal'
  | 'hiHatClosed'
  | 'snare2'
  | 'snare1'
  | 'sideRimshot'
  | 'bassDrum2'
  | 'bassDrum1'
  | 'handClap'
  | 'lowTom2'
  | 'lowTom1'
  | 'midTom2'
  | 'midTom1'
  | 'highTom2'
  | 'highTom1'
  | 'crashCymbal1'
  | 'rideCymbal1'
  | 'rideCymbal2'
  | 'chineseCymbal'
  | 'splashCymbal'
  | 'crashCymbal2'
  | 'rideBell'
  | 'tambourine'
  | 'maracas'
  | 'cowbell'
  | 'vibraSlap'
  | 'highBongo'
  | 'lowBongo'
  | 'muteHighConga'
  | 'openHighConga'
  | 'lowConga'
  | 'highTimbale'
  | 'lowTimbale'
  | 'highAgogo'
  | 'lowAgogo'
  | 'cabasa'
  | 'shortWhistle'
  | 'longWhistle'
  | 'shortGuiro'
  | 'longGuiro'
  | 'claves'
  | 'highWoodBlock'
  | 'lowWoodBlock'
  | 'muteCuica'
  | 'openCuica'
  | 'muteTriangle'
  | 'openTriangle'
  | 'nil';

export const Drums: Record<DrumType, number> = {
  bassDrum2: 35, // bd
  bassDrum1: 36,
  sideRimshot: 37,
  snare1: 38,
  handClap: 39,
  snare2: 40, // sn
  lowTom2: 41,
  hiHatClosed: 42, // hc
  lowTom1: 43,
  hiHatPedal: 44,
  midTom2: 45,
  hiHatOpened: 46, // ho
  midTom1: 47,
  highTom2: 48,
  crashCymbal1: 49,
  highTom1: 50,
  rideCymbal1: 51,
  chineseCymbal: 52,
  rideBell: 53,
  tambourine: 54,
  splashCymbal: 55,
  cowbell: 56,
  crashCymbal2: 57,
  vibraSlap: 58,
  rideCymbal2: 59,
  highBongo: 60,
  lowBongo: 61,
  muteHighConga: 62,
  openHighConga: 63,
  lowConga: 64,
  highTimbale: 65,
  lowTimbale: 66,
  highAgogo: 67,
  lowAgogo: 68,
  cabasa: 69,
  maracas: 70,
  shortWhistle: 71,
  longWhistle: 72,
  shortGuiro: 73,
  longGuiro: 74,
  claves: 75,
  highWoodBlock: 76,
  lowWoodBlock: 77,
  muteCuica: 78,
  openCuica: 79,
  muteTriangle: 80,
  openTriangle: 81,
  nil: 80,
} as const;

// hc ho hp
// bd
// sn
// tl tm th
export const drumCodes = {
  hc: 'drum_42',
  ho: 'drum_46',
  hp: 'drum_44',

  bd: 'drum_35',
  bd1: 'drum_36',
  bd2: 'drum_35',

  sn: 'drum_40',
  sn1: 'drum_38',
  sn2: 'drum_40',

  sideRimshot: 'drum_37',
  handClap: 'drum_39',
  tambourine: 'drum_54',
  vibraSlap: 'drum_58',
  rideBell: 'drum_53',
  cowbell: 'drum_56',

  tl: 'drum_41',
  lowTom2: 'drum_41',
  tl2: 'drum_41',
  lowTom1: 'drum_43',
  tl1: 'drum_43',

  tm: 'drum_45',
  midTom2: 'drum_45',
  tm2: 'drum_45',
  midTom1: 'drum_47',
  tm1: 'drum_47',

  th: 'drum_50',
  highTom2: 'drum_48',
  th2: 'drum_48',
  highTom1: 'drum_50',
  th1: 'drum_50',

  crashCymbal2: 'drum_57',
  cc2: 'drum_57',

  crashCymbal1: 'drum_49',
  cc1: 'drum_49',

  rideCymbal2: 'drum_59',
  rideCymbal1: 'drum_51',
  splashCymbal: 'drum_55',
  chineseCymbal: 'drum_52',

  highBongo: 'drum_60',
  lowBongo: 'drum_61',

  muteHighConga: 'drum_62',
  openHighConga: 'drum_63',
  lowConga: 'drum_64',

  highTimbale: 'drum_65',
  lowTimbale: 'drum_66',

  highAgogo: 'drum_67',
  lowAgogo: 'drum_68',

  cabasa: 'drum_69',
  maracas: 'drum_70',
  claves: 'drum_75',

  shortWhistle: 'drum_71',
  longWhistle: 'drum_72',

  shortGuiro: 'drum_73',
  longGuiro: 'drum_74',

  highWoodBlock: 'drum_76',
  lowWoodBlock: 'drum_77',

  muteCuica: 'drum_78',
  openCuica: 'drum_79',

  muteTriangle: 'drum_80',
  openTriangle: 'drum_81',
  nil: 'drum_80',
};

export const drumInfo: Record<
  DrumType,
  {
    octave: string;
    volume: number;
    instr: number;
    instrCode?: number;
    noteLat: string;
    noteRus: string;
  }
> = {
  hiHatOpened: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatOpened,
    noteLat: 'ho',
    noteRus: 'хо',
  },
  hiHatClosed: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatClosed,
    noteLat: 'hc',
    noteRus: 'хз',
  },
  hiHatPedal: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatPedal,
    noteLat: 'hp',
    noteRus: 'хп',
  },

  snare2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.snare2,
    noteLat: 'sn',
    noteRus: 'мб',
  },
  snare1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.snare1,
    noteLat: 'sn1',
    noteRus: 'мб1',
  },
  sideRimshot: {
    // удар по ободу
    octave: 'drum',
    volume: 0.5,
    instr: Drums.sideRimshot,
    noteLat: 'sideRimshot',
    noteRus: 'sideRimshot',
  },

  bassDrum2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.bassDrum2, // 36
    noteLat: 'bd',
    noteRus: 'бб',
  },
  bassDrum1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.bassDrum1, // 35
    noteLat: 'bd1',
    noteRus: 'бб1',
  },

  lowTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowTom2,
    noteLat: 'tl2',
    noteRus: 'тл2',
  },
  lowTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowTom1,
    noteLat: 'tl1',
    noteRus: 'тл1',
  },
  midTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.midTom2,
    noteLat: 'tm2',
    noteRus: 'тм2',
  },
  midTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.midTom1,
    noteLat: 'tm1',
    noteRus: 'тм1',
  },
  highTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highTom2,
    noteLat: 'th2',
    noteRus: 'тх2',
  },
  highTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highTom1,
    noteLat: 'th1',
    noteRus: 'тх1',
  },

  crashCymbal2: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.crashCymbal2,
    noteLat: 'cc2',
    noteRus: 'cc2',
  },

  crashCymbal1: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.crashCymbal1,
    noteLat: 'cc1',
    noteRus: 'cc1',
  },

  splashCymbal: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.splashCymbal,
    noteLat: 'splashCymbal',
    noteRus: 'splashCymbal',
  },

  rideCymbal2: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.rideCymbal2,
    noteLat: 'rideCymbal2',
    noteRus: 'rideCymbal2',
  },

  rideCymbal1: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.rideCymbal1,
    noteLat: 'rideCymbal1',
    noteRus: 'rideCymbal1',
  },

  chineseCymbal: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.chineseCymbal,
    noteLat: 'chineseCymbal',
    noteRus: 'chineseCymbal',
  },

  handClap: {
    // хлопок в ладоши
    octave: 'drum',
    volume: 0.5,
    instr: Drums.handClap,
    noteLat: 'handClap',
    noteRus: 'handClap',
  },

  rideBell: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.rideBell,
    noteLat: 'rideBell',
    noteRus: 'rideBell',
  },

  cowbell: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.cowbell,
    noteLat: 'cowbell',
    noteRus: 'cowbell',
  },

  tambourine: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.tambourine,
    noteLat: 'tambourine',
    noteRus: 'tambourine',
  },

  vibraSlap: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.vibraSlap,
    noteLat: 'vibraSlap',
    noteRus: 'vibraSlap',
  },

  highBongo: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highBongo,
    noteLat: 'highBongo',
    noteRus: 'highBongo',
  },

  lowBongo: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowBongo,
    noteLat: 'lowBongo',
    noteRus: 'lowBongo',
  },
  muteHighConga: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.muteHighConga,
    noteLat: 'muteHighConga',
    noteRus: 'muteHighConga',
  },
  openHighConga: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.openHighConga,
    noteLat: 'openHighConga',
    noteRus: 'openHighConga',
  },

  lowConga: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowConga,
    noteLat: 'lowConga',
    noteRus: 'lowConga',
  },

  highTimbale: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highTimbale,
    noteLat: 'highTimbale',
    noteRus: 'highTimbale',
  },
  lowTimbale: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowTimbale,
    noteLat: 'lowTimbale',
    noteRus: 'lowTimbale',
  },

  highAgogo: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highAgogo,
    noteLat: 'highAgogo',
    noteRus: 'highAgogo',
  },
  lowAgogo: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowAgogo,
    noteLat: 'lowAgogo',
    noteRus: 'lowAgogo',
  },

  cabasa: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.cabasa,
    noteLat: 'cabasa',
    noteRus: 'cabasa',
  },
  maracas: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.maracas,
    noteLat: 'maracas',
    noteRus: 'maracas',
  },
  claves: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.claves,
    noteLat: 'claves',
    noteRus: 'claves',
  },

  shortWhistle: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.shortWhistle,
    noteLat: 'shortWhistle',
    noteRus: 'shortWhistle',
  },
  longWhistle: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.longWhistle,
    noteLat: 'longWhistle',
    noteRus: 'longWhistle',
  },

  shortGuiro: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.shortGuiro,
    noteLat: 'shortGuiro',
    noteRus: 'shortGuiro',
  },
  longGuiro: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.longGuiro,
    noteLat: 'longGuiro',
    noteRus: 'longGuiro',
  },

  highWoodBlock: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highWoodBlock,
    noteLat: 'highWoodBlock',
    noteRus: 'highWoodBlock',
  },
  lowWoodBlock: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowWoodBlock,
    noteLat: 'lowWoodBlock',
    noteRus: 'lowWoodBlock',
  },

  muteCuica: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.muteCuica,
    noteLat: 'muteCuica',
    noteRus: 'muteCuica',
  },
  openCuica: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.openCuica,
    noteLat: 'openCuica',
    noteRus: 'openCuica',
  },
  muteTriangle: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.muteTriangle,
    noteLat: 'muteTriangle',
    noteRus: 'muteTriangle',
  },
  openTriangle: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.openTriangle,
    noteLat: 'openTriangle',
    noteRus: 'openCuica',
  },
  nil: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.nil,
    noteLat: 'nil',
    noteRus: 'nil',
  },
};

export const drumKeysLeft = {
  /**/
  KeyX: {
    octave: 'drum',
    volume: 0.5,
    instr: 35, // бочка
    noteLat: 'bd',
    noteRus: 'бб',
  },
  KeyZ: {},
  ShiftLeft: {
    octave: 'drum',
    volume: 0.5,
    instr: 40, // малый барабан
    noteLat: 'sn',
    noteRus: 'мб',
  },
  /**/
  KeyS: {},
  KeyA: {
    octave: 'drum',
    volume: 0.5,
    instr: 43, // том низкий 41 43 lowTom
    noteLat: 'tl',
    noteRus: 'тн',
  },
  CapsLock: {
    octave: 'drum',
    volume: 0.5,
    instr: 44, // хэт закрытый
    noteLat: 'hp',
    noteRus: 'хп',
  },
  /**/
  KeyW: {
    octave: 'drum',
    volume: 0.5,
    instr: 40, // малый барабан
    noteLat: 'sn',
    noteRus: 'мб',
  },
  KeyQ: {
    octave: 'drum',
    volume: 0.5,
    instr: 47, // том средний   midTom1: 45 47
    noteLat: 'tm',
    noteRus: 'тс',
  },
  Tab: {
    octave: 'drum',
    volume: 0.5,
    instr: 42, // хэт закрытый
    noteLat: 'hc',
    noteRus: 'хз',
  },
  /**/
  Digit2: {},
  // 1qaz
  // lowTom 41 43 midTom1: 45 47 highTom: 50 48
  Digit1: {
    octave: 'drum',
    volume: 0.5,
    instr: 48, // том высокий highTom: 50 48
    noteLat: 'th',
    noteRus: 'тв',
  },
  Backquote: {
    octave: 'drum',
    volume: 0.5,
    instr: 46, // хэт открытый
    noteLat: 'ho',
    noteRus: 'хо',
  },
};

export const drumKeysRight = {
  ShiftRight: { ...drumInfo.bassDrum2 }, // Бочка
  Semicolon: { ...drumInfo.snare2 }, // Малый барабан
  Quote: { ...drumInfo.lowTom2 }, // Том низкий
  BracketLeft: { ...drumInfo.midTom2 }, // Том средний
  KeyP: { ...drumInfo.highTom2 }, // Том высокий
  KeyO: { ...drumInfo.hiHatOpened }, // Хэт октрытый
  KeyL: { ...drumInfo.hiHatClosed }, // Хэт закрытый
  Period: { ...drumInfo.hiHatPedal }, // Хэт педаль
  Minus: { ...drumInfo.rideCymbal2 }, // Тарелка малая ???
  Digit0: { ...drumInfo.crashCymbal2 }, // Тарелка большая ???
};

export const offsetFotNoteStep = {
  s: -5,
  z: -4,
  l: -3,
  k: -2,
  b: -1,
  d: 0,
  t: 1,
  r: 2,
  n: 3,
  m: 4,
  f: 5,
  v: 6,
};
