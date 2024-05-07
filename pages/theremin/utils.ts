export type FreqItem = {
    step: string;
    code: number;
    value: number;
    octave: string;
    volume: number;
    noteLat: string;
    noteRus: string;
    relatives: number[];
    index: number;

    midF: number;
    botF: number;
    topF: number;
}

export const freqList: FreqItem[] = [];

// 6 * 12 = 72
const freqListSrc = [
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
  { step: 'd', code: 36, value:  65.406395, octave: 'u', volume: 1.00 },
  { step: 't', code: 37, value:  69.295654, octave: 'u', volume: 0.99 },
  { step: 'r', code: 38, value:  73.416191, octave: 'u', volume: 0.98 },
  { step: 'n', code: 39, value:  77.781746, octave: 'u', volume: 0.97 },
  { step: 'm', code: 40, value:  82.406891, octave: 'u', volume: 0.96 },
  { step: 'f', code: 41, value:  87.307060, octave: 'u', volume: 0.95 },
  { step: 'v', code: 42, value:  92.498604, octave: 'u', volume: 0.94 },
  { step: 's', code: 43, value:  97.998856, octave: 'u', volume: 0.93 },
  { step: 'z', code: 44, value: 103.826172, octave: 'u', volume: 0.92 },
  { step: 'l', code: 45, value: 110.000000, octave: 'u', volume: 0.91 },
  { step: 'k', code: 46, value: 116.540939, octave: 'u', volume: 0.90 },
  { step: 'b', code: 47, value: 123.470825, octave: 'u', volume: 0.89 },
  /* МАЛАЯ О */
  { step: 'd', code: 48, value: 130.812790, octave: 'y', volume: 0.88 },
  { step: 't', code: 49, value: 138.591309, octave: 'y', volume: 0.87 },
  { step: 'r', code: 50, value: 146.832382, octave: 'y', volume: 0.86 },
  { step: 'n', code: 51, value: 155.563492, octave: 'y', volume: 0.85 },
  { step: 'm', code: 52, value: 164.813782, octave: 'y', volume: 0.84 },
  { step: 'f', code: 53, value: 174.614120, octave: 'y', volume: 0.83 },
  { step: 'v', code: 54, value: 184.997208, octave: 'y', volume: 0.82 },
  { step: 's', code: 55, value: 195.997711, octave: 'y', volume: 0.81 },
  { step: 'z', code: 56, value: 207.652344, octave: 'y', volume: 0.80 },
  { step: 'l', code: 57, value: 220.000000, octave: 'y', volume: 0.79 },
  { step: 'k', code: 58, value: 233.081879, octave: 'y', volume: 0.78 },
  { step: 'b', code: 59, value: 246.941650, octave: 'y', volume: 0.77 },
  /* ПЕРВАЯ А */
  { step: 'd', code: 60, value: 261.625580, octave: 'o', volume: 0.76 },
  { step: 't', code: 61, value: 277.182617, octave: 'o', volume: 0.75 },
  { step: 'r', code: 62, value: 293.664764, octave: 'o', volume: 0.74 },
  { step: 'n', code: 63, value: 311.126984, octave: 'o', volume: 0.73 },
  { step: 'm', code: 64, value: 329.627563, octave: 'o', volume: 0.72 },
  { step: 'f', code: 65, value: 349.228241, octave: 'o', volume: 0.71 },
  { step: 'v', code: 66, value: 369.994415, octave: 'o', volume: 0.70 },
  { step: 's', code: 67, value: 391.995422, octave: 'o', volume: 0.69 },
  { step: 'z', code: 68, value: 415.304688, octave: 'o', volume: 0.68 },
  { step: 'l', code: 69, value: 440.000000, octave: 'o', volume: 0.67 },
  { step: 'k', code: 70, value: 466.163757, octave: 'o', volume: 0.66 },
  { step: 'b', code: 71, value: 493.883301, octave: 'o', volume: 0.65 },
  /* ВТОРАЯ */
  { step: 'd', code: 72, value: 523.251160, octave: 'a', volume: 0.64 },
  { step: 't', code: 73, value: 554.365234, octave: 'a', volume: 0.63 },
  { step: 'r', code: 74, value: 587.329529, octave: 'a', volume: 0.62 },
  { step: 'n', code: 75, value: 622.253967, octave: 'a', volume: 0.61 },
  { step: 'm', code: 76, value: 659.255127, octave: 'a', volume: 0.60 },
  { step: 'f', code: 77, value: 698.456482, octave: 'a', volume: 0.59 },
  { step: 'v', code: 78, value: 739.988831, octave: 'a', volume: 0.58 },
  { step: 's', code: 79, value: 783.990845, octave: 'a', volume: 0.57 },
  { step: 'z', code: 80, value: 830.609375, octave: 'a', volume: 0.56 },
  { step: 'l', code: 81, value: 880.000000, octave: 'a', volume: 0.55 },
  { step: 'k', code: 82, value: 932.327515, octave: 'a', volume: 0.54 },
  { step: 'b', code: 83, value: 987.766602, octave: 'a', volume: 0.53 },
  /* ТРЕТЬЯ */
  { step: 'd', code: 84, value: 1046.502319, octave: 'e', volume: 0.52 },
  { step: 't', code: 85, value: 1108.730469, octave: 'e', volume: 0.51 },
  { step: 'r', code: 86, value: 1174.659058, octave: 'e', volume: 0.50 },
  { step: 'n', code: 87, value: 1244.507935, octave: 'e', volume: 0.49 },
  { step: 'm', code: 88, value: 1318.510254, octave: 'e', volume: 0.48 },
  { step: 'f', code: 89, value: 1396.912964, octave: 'e', volume: 0.47 },
  { step: 'v', code: 90, value: 1479.977661, octave: 'e', volume: 0.46 },
  { step: 's', code: 91, value: 1567.981689, octave: 'e', volume: 0.45 },
  { step: 'z', code: 92, value: 1661.218750, octave: 'e', volume: 0.44 },
  { step: 'l', code: 93, value: 1760.000000, octave: 'e', volume: 0.43 },
  { step: 'k', code: 94, value: 1864.655029, octave: 'e', volume: 0.42 },
  { step: 'b', code: 95, value: 1975.533203, octave: 'e', volume: 0.41 },

  /* ЧЕТВЁРТАЯ */
  { step: 'd', code: 96,  value: 2093.004639, octave: 'i', volume: 0.40 },
  { step: 't', code: 97,  value: 2217.460938, octave: 'i', volume: 0.39 },
  { step: 'r', code: 98,  value: 2349.318115, octave: 'i', volume: 0.38 },
  { step: 'n', code: 99,  value: 2489.015869, octave: 'i', volume: 0.37 },
  { step: 'm', code: 100, value: 2637.020508, octave: 'i', volume: 0.36 },
  { step: 'f', code: 101, value: 2793.825928, octave: 'i', volume: 0.35 },
  { step: 'v', code: 102, value: 2959.955322, octave: 'i', volume: 0.34 },
  { step: 's', code: 103, value: 3135.963379, octave: 'i', volume: 0.33 },
  { step: 'z', code: 104, value: 3322.437500, octave: 'i', volume: 0.32 },
  { step: 'l', code: 105, value: 3520.000000, octave: 'i', volume: 0.31 },
  { step: 'k', code: 106, value: 3729.310059, octave: 'i', volume: 0.30 },
  { step: 'b', code: 107, value: 3951.066406, octave: 'i', volume: 0.29 },
];


freqListSrc.forEach((srcItem, i) => {
  const prev = freqListSrc[i-1];
  const next = freqListSrc[i+1];

  const item = {
      ...srcItem
  } as FreqItem;

  item.noteLat = item.step + item.octave;

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

  freqList.push(item);
});

export const colorHash = {
  '12':   { mask: '!__', val: 12,   name: 'йа',  rgb: '250,25,25'   },
  '-12':  { mask: '!__', val: -12,   name: 'йу',  rgb: '125,25,25'   },

  '11':   { mask: '!.:', val: 11,   name: 'га',  rgb: '250,175,200' },
  '-11':  { mask: '!.:', val: -11,  name:  'гу', rgb: '125,75,100'  },

  '10':   { mask: '_!_', val: 10,   name: 'жа', rgb: '25,250,25'   },
  '-10':  { mask: '_!_', val: -10,  name: 'жу', rgb: '25,100,25'   },

  '9':   { mask: '_!!', val: 9,  name: 'фа', rgb: '25,250,250'   },
  '-9':  { mask: '_!!', val: -9,  name: 'фу', rgb: '25,125,125'   },

  '8':  { mask: ':.!', val: 8, name: 'ва',  rgb: '200,150,250' },
  '-8': { mask: ':.!', val: -8, name:  'ву', rgb: '100,75,125'  },

  '7':   { mask: '!_!', val: 7,   name: 'за', rgb: '250,25,250'  },
  '-7':  { mask: '!_!', val: -7,   name: 'зу', rgb: '120,25,125'  },

  '6':   { mask: '__!', val: 6,  name: 'ща',      rgb: '25,25,250'    },
  '-6':  { mask: '__!', val: -6,  name: 'щу',      rgb: '25,25,125'   },

  '5':   { mask: '!:_', val: 5,  name: 'ла',  rgb: '250,175,25'   },
  '-5':  { mask: '!:_', val: -5,  name: 'лу',  rgb: '125,50,25'    },

  '4':  { mask: '.!:', val: 4,  name: 'ра', rgb: '150,250,200'  },
  '-4': { mask: '.!:', val: -4,  name: 'ру', rgb: '50,150,100'   },

  '3':   { mask: '.:!', val: 3,  name: 'ша', rgb: '150,200,250'  },
  '-3':  { mask: '.:!', val: -3,   name: 'шу', rgb: '50,100,150'   },

  '2':   { mask: '!!_', val: 2,   name: 'са', rgb: '250,250,25'   },
  '-2':  { mask: '!!_', val: -2,  name: 'су', rgb: '125,125,25'   },

  '1':  { mask: '!::', val: 1,  name:  'ха',  rgb: '200,190,190'  },
  '-1': { mask: '!::', val: -1, name:  'ху',  rgb: '100,100,110'  },

  '0':   { mask: '!!!', val: 0,   name: 'мо', rgb: '150,150,150' },
} as const;

export const colorArr = Object.values(colorHash);
