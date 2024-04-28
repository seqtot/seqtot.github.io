
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

const stepLatToRus = {d: 'д', t: 'т', r: 'р', n: 'н', m: 'м', f: 'ф', v: 'в', s: 'с', z: 'з', l: 'л', k: 'к', b: 'б'};
const octaveLatToRus = {u: 'ы', y: 'у', o: 'о', a: 'а', e: 'е', i: 'и'};

// абвгдеёжзийклмнопрстуфхцчшщъыьэюя: гёжйпцчшцъьэюя
// abcdefghijklmnopqrstuvwxyz:        cgjpqwx

// D T R n M F V S z L k B    h
// Д t Р н М Ф в С з Л к Б    х

// бвгджзйклмнпрстфхцчшщ - 21
// субконтроктава 12-23
// контроктава    24-35
// большая        36-47

export type TFreqInfo = {
  step: string,
  code: number,
  octave: string,
  volume: number,
  value: number,
  index: number,
  relatives: number[],
  noteLat: string,
  noteRus: string,
  midF: number,
  botF: number,
  topF: number,
}

const freqListSrc: TFreqInfo[] = [
  /* КОНТРОКТАВА 1 Ы */
  // { step: 'd', code: 24, value: 32.703197 },
  // { step: 't', code: 25, value: 34.647827 },
  // { step: 'r', code: 26, value: 36.708096 },
  // { step: 'n', code: 27, value: 38.890873 },
  // { step: 'm', code: 28, value: 41.203445 },
  // { step: 'f', code: 29, value: 43.653530 },
  // { step: 'v', code: 30, value: 46.249302 },
  // { step: 's', code: 31, value: 48.999428 },
  // { step: 'z', code: 32, value: 51.913086 },
  // { step: 'l', code: 33, value: 55.000000 },
  // { step: 'k', code: 34, value: 58.270470 },
  // { step: 'b', code: 35, value: 61.735413 },

  /* БОЛЬШАЯ У */
  { step: 'd', code: 36, value:  65.406395, octave: 'u', volume: 1.00  },
  { step: 't', code: 37, value:  69.295654, octave: 'u', volume: 0.995 },
  { step: 'r', code: 38, value:  73.416191, octave: 'u', volume: 0.990 },
  { step: 'n', code: 39, value:  77.781746, octave: 'u', volume: 0.985 },
  { step: 'm', code: 40, value:  82.406891, octave: 'u', volume: 0.980 },
  { step: 'f', code: 41, value:  87.307060, octave: 'u', volume: 0.975 },
  { step: 'v', code: 42, value:  92.498604, octave: 'u', volume: 0.970 },
  { step: 's', code: 43, value:  97.998856, octave: 'u', volume: 0.965 },
  { step: 'z', code: 44, value: 103.826172, octave: 'u', volume: 0.960 },
  { step: 'l', code: 45, value: 110.000000, octave: 'u', volume: 0.955 },
  { step: 'k', code: 46, value: 116.540939, octave: 'u', volume: 0.950 },
  { step: 'b', code: 47, value: 123.470825, octave: 'u', volume: 0.945 },

  /* МАЛАЯ О */
  { step: 'd', code: 48, value: 130.812790, octave: 'y', volume: 0.940 },
  { step: 't', code: 49, value: 138.591309, octave: 'y', volume: 0.935 },
  { step: 'r', code: 50, value: 146.832382, octave: 'y', volume: 0.930 },
  { step: 'n', code: 51, value: 155.563492, octave: 'y', volume: 0.925 },
  { step: 'm', code: 52, value: 164.813782, octave: 'y', volume: 0.920 },
  { step: 'f', code: 53, value: 174.614120, octave: 'y', volume: 0.915 },
  { step: 'v', code: 54, value: 184.997208, octave: 'y', volume: 0.910 },
  { step: 's', code: 55, value: 195.997711, octave: 'y', volume: 0.905 },
  { step: 'z', code: 56, value: 207.652344, octave: 'y', volume: 0.900 },
  { step: 'l', code: 57, value: 220.000000, octave: 'y', volume: 0.895 },
  { step: 'k', code: 58, value: 233.081879, octave: 'y', volume: 0.890 },
  { step: 'b', code: 59, value: 246.941650, octave: 'y', volume: 0.885 },

  /* ПЕРВАЯ А */
  { step: 'd', code: 60, value: 261.625580, octave: 'o', volume: 0.880 },
  { step: 't', code: 61, value: 277.182617, octave: 'o', volume: 0.875 },
  { step: 'r', code: 62, value: 293.664764, octave: 'o', volume: 0.870 },
  { step: 'n', code: 63, value: 311.126984, octave: 'o', volume: 0.865 },
  { step: 'm', code: 64, value: 329.627563, octave: 'o', volume: 0.860 },
  { step: 'f', code: 65, value: 349.228241, octave: 'o', volume: 0.855 },
  { step: 'v', code: 66, value: 369.994415, octave: 'o', volume: 0.850 },
  { step: 's', code: 67, value: 391.995422, octave: 'o', volume: 0.845 },
  { step: 'z', code: 68, value: 415.304688, octave: 'o', volume: 0.840 },
  { step: 'l', code: 69, value: 440.000000, octave: 'o', volume: 0.835 },
  { step: 'k', code: 70, value: 466.163757, octave: 'o', volume: 0.830 },
  { step: 'b', code: 71, value: 493.883301, octave: 'o', volume: 0.825 },

  /* ВТОРАЯ */
  { step: 'd', code: 72, value: 523.251160, octave: 'a', volume: 0.820 },
  { step: 't', code: 73, value: 554.365234, octave: 'a', volume: 0.815 },
  { step: 'r', code: 74, value: 587.329529, octave: 'a', volume: 0.810 },
  { step: 'n', code: 75, value: 622.253967, octave: 'a', volume: 0.805 },
  { step: 'm', code: 76, value: 659.255127, octave: 'a', volume: 0.800 },
  { step: 'f', code: 77, value: 698.456482, octave: 'a', volume: 0.795 },
  { step: 'v', code: 78, value: 739.988831, octave: 'a', volume: 0.790 },
  { step: 's', code: 79, value: 783.990845, octave: 'a', volume: 0.785 },
  { step: 'z', code: 80, value: 830.609375, octave: 'a', volume: 0.780 },
  { step: 'l', code: 81, value: 880.000000, octave: 'a', volume: 0.775 },
  { step: 'k', code: 82, value: 932.327515, octave: 'a', volume: 0.770 },
  { step: 'b', code: 83, value: 987.766602, octave: 'a', volume: 0.765 },

  /* ТРЕТЬЯ */
  { step: 'd', code: 84, value: 1046.502319, octave: 'e', volume: 0.760 },
  { step: 't', code: 85, value: 1108.730469, octave: 'e', volume: 0.755 },
  { step: 'r', code: 86, value: 1174.659058, octave: 'e', volume: 0.755 },
  { step: 'n', code: 87, value: 1244.507935, octave: 'e', volume: 0.750 },
  { step: 'm', code: 88, value: 1318.510254, octave: 'e', volume: 0.745 },
  { step: 'f', code: 89, value: 1396.912964, octave: 'e', volume: 0.740 },
  { step: 'v', code: 90, value: 1479.977661, octave: 'e', volume: 0.735 },
  { step: 's', code: 91, value: 1567.981689, octave: 'e', volume: 0.730 },
  { step: 'z', code: 92, value: 1661.218750, octave: 'e', volume: 0.725 },
  { step: 'l', code: 93, value: 1760.000000, octave: 'e', volume: 0.720 },
  { step: 'k', code: 94, value: 1864.655029, octave: 'e', volume: 0.715 },
  { step: 'b', code: 95, value: 1975.533203, octave: 'e', volume: 0.710 },

  /* ЧЕТВЁРТАЯ */
  { step: 'd', code: 96,  value: 2093.004639, octave: 'i', volume: 0.705 },
  { step: 't', code: 97,  value: 2217.460938, octave: 'i', volume: 0.700 },
  { step: 'r', code: 98,  value: 2349.318115, octave: 'i', volume: 0.695 },
  { step: 'n', code: 99,  value: 2489.015869, octave: 'i', volume: 0.690 },
  { step: 'm', code: 100, value: 2637.020508, octave: 'i', volume: 0.685 },
  { step: 'f', code: 101, value: 2793.825928, octave: 'i', volume: 0.680 },
  { step: 'v', code: 102, value: 2959.955322, octave: 'i', volume: 0.675 },
  { step: 's', code: 103, value: 3135.963379, octave: 'i', volume: 0.670 },
  { step: 'z', code: 104, value: 3322.437500, octave: 'i', volume: 0.665 },
  { step: 'l', code: 105, value: 3520.000000, octave: 'i', volume: 0.660 },
  { step: 'k', code: 106, value: 3729.310059, octave: 'i', volume: 0.655 },
  { step: 'b', code: 107, value: 3951.066406, octave: 'i', volume: 0.650 },
] as TFreqInfo[];

export const freqInfoList: TFreqInfo[] = freqListSrc.map((srcItem, i) => {
  const prev = freqListSrc[i-1];
  const next = freqListSrc[i+1];
  const item = {
    ...(srcItem as any)
  } as TFreqInfo;

  item.code = item.code - 12;
  item.noteLat = item.step + item.octave;
  item.noteRus = stepLatToRus[item.step] + octaveLatToRus[item.octave];

  item.relatives = freqListSrc.map((iItem, i) => iItem.step === item.step ? i : -1).filter(ind => ind > -1);
  item.index = i;
  item.midF = item.value;

  if (prev) {
    item.botF = item.value - ((item.value - prev.value)/2);
  } else {
    item.botF = item.value - ((next.value - item.value)/2);
  }

  if (next) {
    item.topF = item.value + ((next.value - item.value)/2);
  } else {
    item.topF = item.value + ((item.value - prev.value)/2);
  }

  return item;
});

export const freqInfoHash: {[key: string | number]: TFreqInfo} = freqInfoList.reduce(
    (acc, item) => {
      acc[item.noteLat] = item;
      acc[item.noteRus] = item;
      acc[item.code] = item;

      return acc;
    },
    {}
);

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

export const leftAndRightKeys = {
  ...leftKeys,
  ...rightKeys
};

export const freqByNoteHash: { [key: string]: number } = freqInfoList.reduce(
  (acc, item) => {
    const noteLat = item.step + item.octave;
    const noteRus = stepLatToRus[item.step] + octaveLatToRus[item.octave];

    acc[noteLat] = item.value;
    acc[noteRus] = item.value;

    return acc;
  },
  {}
);

export const codeByNoteHash: { [key: string]: number } = freqInfoList.reduce(
  (acc, item) => {
    const noteLat = item.step + item.octave;
    const noteRus = stepLatToRus[item.step] + octaveLatToRus[item.octave];

    acc[noteLat] = item.code;
    acc[noteRus] = item.code;

    return acc;
  },
  {}
);

export const noteLatByNoteHash: { [key: string]: string } = freqInfoList.reduce(
  (acc, item) => {
    const noteLat = item.step + item.octave;
    const noteRus = stepLatToRus[item.step] + octaveLatToRus[item.octave];

    acc[noteLat] = noteLat;
    acc[noteRus] = noteLat;

    return acc;
  },
  {}
);

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
  return val !== null && val !== undefined;
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
