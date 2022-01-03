export const Drums = {
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
} as const;

export const drumCodes = {
  hc: 'drum_42',
  ho: 'drum_46',
  hp: 'drum_44',
  bd: 'drum_35',
  bd2: 'drum_35',
  bd1: 'drum_36',
  sn: 'drum_40',
  sn2: 'drum_40',
  sn1: 'drum_38',

  sideRimshot: 'drum_37',
  handClap: 'drum_39',
  tambourine: 'drum_54',
  vibraSlap: 'drum_58',
  rideBell: 'drum_53',
  cowbell: 'drum_56',

  lowTom2: 'drum_41',
  lowTom1: 'drum_43',
  midTom2: 'drum_45',
  midTom1: 'drum_47',
  highTom2: 'drum_48',
  highTom1: 'drum_50',

  crashCymbal2: 'drum_57',
  crashCymbal1: 'drum_49',
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
};

export const drumKeys = {
  /**/
  KeyX: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.bassDrum2,
    noteLat: 'bd',
    noteRus: 'бб',
  },
  KeyZ: {},
  ShiftLeft: {},
  /**/
  KeyS: {},
  KeyA: {},
  CapsLock: {},
  /**/
  KeyW: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.snare2,
    noteLat: 'sn',
    noteRus: 'мб',
  },
  KeyQ: {},
  Tab: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatClosed,
    noteLat: 'hc',
    noteRus: 'хз',
  },
  /**/
  Digit2: {},
  Digit1: {},
  Backquote: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatOpened,
    noteLat: 'ho',
    noteRus: 'хо',
  },
  bassDrum1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.bassDrum1,
    noteLat: 'bd1',
    noteRus: 'бб1',
  },
  bassDrum2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.bassDrum2, // bd
    noteLat: 'bd2',
    noteRus: 'бб2',
  },
  snare1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.snare1,
    noteLat: 'sn1',
    noteRus: 'мб1',
  },
  snare2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.snare2,
    noteLat: 'sn2',
    noteRus: 'мб2',
  },

  sideRimshot: {
    // удар по ободу
    octave: 'drum',
    volume: 0.5,
    instr: Drums.sideRimshot,
    noteLat: 'sideRimshot',
    noteRus: 'sideRimshot',
  },
  handClap: {
    // хлопок в ладоши
    octave: 'drum',
    volume: 0.5,
    instr: Drums.handClap,
    noteLat: 'handClap',
    noteRus: 'handClap',
  },
  lowTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowTom2,
    noteLat: 'lowTom2',
    noteRus: 'lowTom2',
  },
  lowTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.lowTom1,
    noteLat: 'lowTom1',
    noteRus: 'lowTom1',
  },
  midTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.midTom2,
    noteLat: 'midTom2',
    noteRus: 'midTom2',
  },
  midTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.midTom1,
    noteLat: 'midTom1',
    noteRus: 'midTom1',
  },
  highTom2: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highTom2,
    noteLat: 'highTom2',
    noteRus: 'highTom2',
  },
  highTom1: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.highTom1,
    noteLat: 'highTom1',
    noteRus: 'highTom1',
  },
  hiHatPedal: {
    // highHatPedal
    octave: 'drum',
    volume: 0.5,
    instr: Drums.hiHatPedal,
    noteLat: 'hp',
    noteRus: 'хп',
  },

  crashCymbal2: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.crashCymbal2,
    noteLat: 'crashCymbal2',
    noteRus: 'crashCymbal2',
  },

  crashCymbal1: {
    // тарелка
    octave: 'drum',
    volume: 0.5,
    instr: Drums.crashCymbal1,
    noteLat: 'crashCymbal1',
    noteRus: 'crashCymbal1',
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
};
