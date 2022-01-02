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
  sn: 'drum_40',
  bd: 'drum_35',
  sideRimshot: 'drum_37',
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
  // bassDrum1: {
  //   octave: 'drum',
  //   volume: 0.5,
  //   instr: Drums.bassDrum1,
  //   noteLat: 'bassDrum1',
  //   noteRus: 'bassDrum1',
  // },
  sideRimshot: {
    octave: 'drum',
    volume: 0.5,
    instr: Drums.sideRimshot,
    noteLat: 'sideRimshot',
    noteRus: 'sideRimshot',
  },

  // export enum Drums {
  //   sideRimshot = 37,
  //   snare1 = 38, // sn
  //   handClap = 39, //
  //   snare2 = 40, // sn
  //   lowTom2 = 41, //
  //   hiHatClosed = 42, // hc
  //   lowTom1 = 43,
  //   hiHatPedal = 44,
  //   midTom2 = 45,
  //   hiHatOpened = 46, // ho
  //   midTom1 = 47,
  //   highTom2 = 48,
  //   crashCymbal1 = 49,
  //   highTom1 = 50,
  //   rideCymbal1 = 51,
  //   chineseCymbal = 52,
  //   rideBell = 53,
  //   tambourine = 54,
  //   splashCymbal = 55,
  //   cowbell = 56,
  //   crashCymbal2 = 57,
  //   vibraSlap = 58,
  //   rideCymbal2 = 59,
  //   highBongo = 60,
  //   lowBongo = 61,
  //   muteHighConga = 62,
  //   openHighConga = 63,
  //   lowConga = 64,
  //   highTimbale = 65,
  //   lowTimbale = 66,
  //   highAgogo = 67,
  //   lowAgogo = 68,
  //   cabasa = 69,
  //   maracas = 70,
  //   shortWhistle = 71,
  //   longWhistle = 72,
  //   shortGuiro = 73,
  //   longGuiro = 74,
  //   claves = 75,
  //   highWoodBlock = 76,
  //   lowWoodBlock = 77,
  //   muteCuica = 78,
  //   openCuica = 79,
  //   muteTriangle = 80,
  //   openTriangle = 81,
  // }
};
