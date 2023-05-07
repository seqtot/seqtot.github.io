'use babel';

// CapsLock
// vowel
// И - третья i - С6
// Е - вторая e - С5
// А - первая a - С4
// O - малая o -  С3
// У - большая y - С2
// Ы - контроктава u - С1
// -  субконтроктава - С0

// <!--желтый желто-оранжевый оранжевый красно-оранжевый красный красно-фиолетовый фиолетовый сине-фиолетовый синий сине-зелёный  зелёный жёлто-зелёный жёлтый-->

// С2  С3  С4  С5  С6  С7
// Ы   У   О   А   Е   И
// U   Y   O   A   E   I

export const octaveListLat = 'uyoaei'.split('');
export const octaveListRus = 'ыуоаеи'.split('');
export const stepListLat = 'dtrnmfvszlkb'.split('');
export const stepListRus = 'дтрнмфвсзлкб'.split('');

// абвгдеёжзийклмнопрстуфхцчшщъыьэюя: гёжйпцчшцъьэюя
// abcdefghijklmnopqrstuvwxyz:        cgjpqwx

// D T R n M F V S z L k B    h
// Д t Р н М Ф в С з Л к Б    х

// бвгджзйклмнпрстфхцчшщ - 21
// субконтроктава 12-23
// контроктава    24-35
// большая        36-47

// http://midi.teragonaudio.com/tutr/notefreq.htm
export const freqList: { value: number; code: number }[] = [
  /* КОНТРОКТАВА 1 */
  { code: 24, value: 32.7 }, //  д
  { code: 25, value: 34.65 }, // т
  { code: 26, value: 36.71 }, // р
  { code: 27, value: 38.89 }, // н
  { code: 28, value: 41.2 }, //  м
  { code: 29, value: 43.65 }, // ф
  { code: 30, value: 46.25 }, // в
  { code: 31, value: 49.0 }, //  с
  { code: 32, value: 51.91 }, // з
  { code: 33, value: 55.0 }, //  л
  { code: 34, value: 58.27 }, // к
  { code: 35, value: 61.74 }, // б
  /* БОЛЬШАЯ */
  { code: 36, value: 65.41 },
  { code: 37, value: 69.3 },
  { code: 38, value: 73.42 },
  { code: 39, value: 77.78 },
  { code: 40, value: 82.41 },
  { code: 41, value: 87.31 },
  { code: 42, value: 92.5 },
  { code: 43, value: 98.0 },
  { code: 44, value: 103.83 },
  { code: 45, value: 110.0 },
  { code: 46, value: 116.54 },
  { code: 47, value: 123.47 },
  /* МАЛАЯ */
  { code: 48, value: 130.82 },
  { code: 49, value: 138.59 },
  { code: 50, value: 146.83 },
  { code: 51, value: 155.57 },
  { code: 52, value: 164.82 },
  { code: 53, value: 174.62 },
  { code: 54, value: 185.0 },
  { code: 55, value: 196.0 },
  { code: 56, value: 207.65 },
  { code: 57, value: 220.0 }, // л
  { code: 58, value: 233.08 },
  { code: 59, value: 246.94 },
  /* ПЕРВАЯ */
  { code: 60, value: 261.63 },
  { code: 61, value: 277.18 },
  { code: 62, value: 293.66 },
  { code: 63, value: 311.13 },
  { code: 64, value: 329.63 },
  { code: 65, value: 349.23 },
  { code: 66, value: 369.99 },
  { code: 67, value: 392.0 },
  { code: 68, value: 415.3 },
  { code: 69, value: 440.0 },
  { code: 70, value: 466.16 },
  { code: 71, value: 493.88 },
  /* ВТОРАЯ */
  { code: 72, value: 523.26 },
  { code: 73, value: 554.36 },
  { code: 74, value: 587.32 },
  { code: 75, value: 622.26 },
  { code: 76, value: 659.26 },
  { code: 77, value: 698.46 },
  { code: 78, value: 739.98 },
  { code: 79, value: 784.0 },
  { code: 80, value: 830.6 },
  { code: 81, value: 880.0 },
  { code: 82, value: 932.32 },
  { code: 83, value: 987.76 },
  /* ТРЕТЬЯ */
  { code: 84, value: 1046.52 },
  { code: 85, value: 1108.72 },
  { code: 86, value: 1174.64 },
  { code: 87, value: 1244.52 },
  { code: 88, value: 1318.52 },
  { code: 89, value: 1396.92 },
  { code: 90, value: 1479.96 },
  { code: 91, value: 1568.0 },
  { code: 92, value: 1661.2 },
  { code: 93, value: 1760.0 },
  { code: 94, value: 1864.6 },
  { code: 95, value: 1975.52 },
];

export const leftKeys = {
  ShiftLeft: 'ShiftLeft',
  KeyZ: 'KeyZ',
  KeyX: 'KeyX',
  KeyC: 'KeyC',
  KeyV: 'KeyV',
  KeyB: 'KeyB',

  CapsLock: 'CapsLock',
  KeyA: 'KeyA',
  KeyS: 'KeyS',
  KeyD: 'KeyD',
  KeyF: 'KeyF',
  KeyG: 'KeyG',

  Tab: 'Tab',
  KeyQ: 'KeyQ',
  KeyW: 'KeyW',
  KeyE: 'KeyE',
  KeyR: 'KeyR',
  KeyT: 'KeyT',

  Backquote: 'Backquote',
  Digit1: 'Digit1',
  Digit2: 'Digit2',
  Digit3: 'Digit3',
  Digit4: 'Digit4',
  Digit5: 'Digit5',
};

export const rightKeys = {
  KeyN: 'KeyN',
  KeyM: 'KeyM',
  Comma: 'Comma',
  Period: 'Period',
  Slash: 'Slash',
  ShiftRight: 'ShiftRight',

  KeyH: 'KeyH',
  KeyJ: 'KeyJ',
  KeyK: 'KeyK',
  KeyL: 'KeyL',
  Semicolon: 'Semicolon',
  Quote: 'Quote',

  KeyY: 'KeyY',
  KeyU: 'KeyU',
  KeyI: 'KeyI',
  KeyO: 'KeyO',
  KeyP: 'KeyP',
  BracketLeft: 'BracketLeft',

  Digit6: 'Digit6',
  Digit7: 'Digit7',
  Digit8: 'Digit8',
  Digit9: 'Digit9',
  Digit0: 'Digit0',
  Minus: 'Minus',
  Equal: 'Equal',
};

export const freqByNoteHash: { [key: string]: number } = freqList.reduce(
  (acc, item) => {
    const offset = -2;
    const octave = parseInt((item.code / 12).toString(), 10);
    const tone = item.code - octave * 12;
    const noteLat = stepListLat[tone] + octaveListLat[octave + offset];
    const noteRus = stepListRus[tone] + octaveListRus[octave + offset];
    acc[noteLat] = item.value;
    acc[noteRus] = item.value;

    return acc;
  },
  {}
);

export const codeByNoteHash: { [key: string]: number } = freqList.reduce(
  (acc, item) => {
    const offset = -2;
    const octave = parseInt((item.code / 12).toString(), 10);
    const tone = item.code - octave * 12;
    const noteLat = stepListLat[tone] + octaveListLat[octave + offset];
    const noteRus = stepListRus[tone] + octaveListRus[octave + offset];
    acc[noteLat] = item.code;
    acc[noteRus] = item.code;

    return acc;
  },
  {}
);

export const noteLatByNoteHash: { [key: string]: string } = freqList.reduce(
  (acc, item) => {
    const offset = -2;
    const octave = parseInt((item.code / 12).toString(), 10);
    const tone = item.code - octave * 12;
    const noteLat = stepListLat[tone] + octaveListLat[octave + offset];
    const noteRus = stepListRus[tone] + octaveListRus[octave + offset];
    acc[noteLat] = noteLat;
    acc[noteRus] = noteLat;

    return acc;
  },
  {}
);

export const noteLatByNote: { [key: string]: string } = stepListLat.reduce(
  (acc, step, iStep) => {
    octaveListLat.forEach((octave, iOctave) => {
      const noteLat = step + octave;
      const noteRus = stepListRus[iStep] + octaveListRus[iOctave];
      acc[noteLat] = noteLat;
      acc[noteRus] = noteLat;
    });

    return acc;
  },
  {}
);

//console.log('codeByNoteHash', codeByNoteHash);
//console.log('freqByNoteHash', freqByNoteHash);
//console.log('noteLatByNoteHash', noteLatByNoteHash);

export const noteByKeyHash = {
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

  Equal: 'бы',
};

function isPresent(val: any) {
  return val !== null || val !== undefined;
}

export function getNoteByStepAndOctave(
  step: number | string,
  octave: number | string,
  type: 'lat' | 'rus'
): string {
  let stepIndex: number;
  let octaveIndex: number;

  if (typeof step === 'string') {
    stepIndex = stepListLat.findIndex((item) => item === step);
    if (!isPresent(stepIndex)) {
      stepIndex = stepListRus.findIndex((item) => item === step);
    }
  } else {
    stepIndex = <number>step;
  }

  if (typeof stepIndex !== 'number') {
    return '';
  }

  if (typeof octave === 'string') {
    octaveIndex = octaveListLat.findIndex((item) => item === octave);
    if (!isPresent(stepIndex)) {
      octaveIndex = octaveListRus.findIndex((item) => item === octave);
    }
  } else {
    octaveIndex = <number>octave;
  }

  if (typeof octaveIndex !== 'number') {
    return '';
  }

  const octaveSign =
    type === 'lat' ? octaveListLat[octaveIndex] : octaveListRus[octaveIndex];
  const stepSign =
    type === 'lat' ? stepListLat[stepIndex] : stepListRus[stepIndex];

  if (!octaveSign || !stepSign) {
    return '';
  }

  return stepSign + octaveSign;
}
