// 'use strict';
//
// const audioCtx = new AudioContext();
// const muse = {
//
// };
//
// function parseInteger(val, ifError) {
//   if (typeof val === 'number') {
//       return isNaN(val) ? ifError : val;
//   }
//
//   val = (val || '').toString().trim();
//   const num = parseInt(val, 10);
//
//   return isNaN(num) ? ifError : num;
// }
//
// function getStringWithBlanks(val) {
//   return ' ' + (val || '').trim() + ' ';
// }
//
// function getBpmFromString(str, byDefault = 120) {
//   str = getStringWithBlanks(str);
//
//   const regExp = / b\d+ /;
//
//   if (!regExp.test(str)) {
//       return byDefault;
//   }
//
//   str = str.match(regExp)[0].trim().replace('b', '');
//
//   return parseInteger(str, byDefault);
// }
//
// function getRepeatFromString(str, byDefault = 1) {
//   str = getStringWithBlanks(str);
//
//   const regExp = / r\d+ /;
//
//   if (!regExp.test(str)) {
//       return byDefault;
//   }
//
//   str = str.match(regExp)[0].trim().replace('r', '');
//
//   return parseInteger(str, byDefault);
// }
//
// function getPrebeatFromString(str, byDefault = 1) {
//   str = getStringWithBlanks(str);
//
//   const regExp = / r\d+ /;
//
//   if (!regExp.test(str)) {
//       return byDefault;
//   }
//
//   str = str.match(regExp)[0].trim().replace('p', '');
//
//   return parseInteger(str, byDefault);
// }
//
// muse.parseInteger = parseInteger;
// muse.getStringWithBlanks = getStringWithBlanks;
// muse.getBpmFromString = getBpmFromString;
// muse.getRepeatFromString = getRepeatFromString;
// muse.getPrebeatFromString = getPrebeatFromString;
//
// class Sound {
//   static ctx = audioCtx;
// }
//
// const DEFAULT_VOLUME = 50;
// const octaveListLat = 'uyoaei'.split('');
// const octaveListRus = 'ыуоаеи'.split('');
// const stepListLat = 'dtrnmfvszlkb'.split('');
// const stepListRus = 'дтрнмфвсзлкб'.split('');
//
//
// const keysToNoteLat = {
//   Backquote:   'du',
//   Tab:         'tu',
//   CapsLock:    'ru',
//   ShiftLeft:   'nu',
//   Digit1:      'mu',
//   KeyQ:        'fu',
//   KeyA:        'vu',
//   KeyZ:        'su',
//   Digit2:      'zu',
//   KeyW:        'lu',
//   KeyS:        'ku',
//   KeyX:        'bu',
//
//   Digit3:      'dy',
//   KeyE:        'ty',
//   KeyD:        'ry',
//   KeyC:        'ny',
//   Digit4:      'my',
//   KeyR:        'fy',
//   KeyF:        'vy',
//   KeyV:        'sy',
//   Digit5:      'zy',
//   KeyT:        'ly',
//   KeyG:        'ky',
//   KeyB:        'by',
//
//   Digit6:      'do',
//   KeyY:        'to',
//   KeyH:        'ro',
//   KeyN:        'no',
//   Digit7:      'mo',
//   KeyU:        'fo',
//   KeyJ:        'vo',
//   KeyM:        'so',
//   Digit8:      'zo',
//   KeyI:        'lo',
//   KeyK:        'ko',
//   Comma:       'bo',
//
//   Digit9:      'da',
//   KeyO:        'ta',
//   KeyL:        'ra',
//   Period:      'na',
//   Digit0:      'ma',
//   KeyP:        'fa',
//   Semicolon:   'va',
//   Slash:       'sa',
//   Minus:       'za',
//   BracketLeft: 'la',
//   Quote:       'ka',
//   ShiftRight:  'ba',
//
//   Equal:        'di',
//   BracketRight: 'ti',
// }

export type FreqItem = {
    step: string;
    code: number;
    value: number;
    octave: string;
    volume: number;
    noteLat: string;
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

// Object.keys(keysToNoteLat).forEach(key => {
//   const noteLat = keysToNoteLat[key];
//   keysToNoteLat[key] = freqList.find(item => item.noteLat === noteLat);
// });

//console.log('freqList', freqList);
//console.log('keysToNoteLat', keysToNoteLat);


// let volumeList = [
//   {value: 100},
//   {value: 100},
//
//   // {value: 60},
//   // {value: 60},
//   {value: 60},
//   {value: 60},
//   {value: 60},
//
//   {value: 52.5, isMiddle: true},
//   //{value: 47.5},
//
//   // {value: 60},
//   //{value: 60},
//   {value: 60},
//   {value: 60},
//
//   {value: 0},
//   {value: 0},
// ]
//
//
// function isNil(val) {
//   return val === null || val === undefined;
// }
//
// function isPresent(val) {
//   return val !== null && val !== undefined;
// }
//
// function getWithDataAttr(name, el) {
//   return ((el || document).querySelectorAll(`[data-${name}]`)) || [];
// }
//
// function getWithDataAttrValue(name, val, el) {
//   return ((el || document).querySelectorAll(`[data-${name}="${val}"]`)) || [];
// }
//
// function getEndPointVolume(val) {
//   let valOut;
//   let mid = 20;
//
//   if (val === 0 || val === 100) {
//       valOut = val;
//   } else {
//       valOut = val / 100;
//       valOut = (1 - Math.sqrt(1 - (valOut * valOut))) * 100;
//   }
//
//   return valOut;
// }
//
// function mergeVolume(a, b) {
//   return a * (b / DEFAULT_VOLUME);
// }
//
//
// class Deferred {
//   constructor() {
//     this.promise = null;
//     this.resolve = null;
//     this.reject = null;
//
//     this.promise = new Promise((resolve, reject) => {
//         this.resolve = resolve;
//         this.reject = reject;
//     });
//   }
// }
//
// // https://github.com/audiojs/audio-buffer-utils
// async function getBufferFromFile(
//   ctx /*AudioContext*/,
//   file /*string*/
// ) /*Promise<AudioBuffer>*/ {
// 	const dfr = new Deferred();
//
// 	let len = file.length;
// 	let arraybuffer = new ArrayBuffer(len);
// 	let view = new Uint8Array(arraybuffer);
// 	let decoded = atob(file);
// 	let b;
// 	for (let i = 0; i < decoded.length; i++) {
// 		b = decoded.charCodeAt(i);
// 		view[i] = b;
// 	}
// 	ctx.decodeAudioData(arraybuffer, audioBuffer => {
// 		// dfr.resolve(fill({
// 		// 	buffer: audioBuffer,
// 		// 	fn: transformWithZero,
// 		// 	//value: .001,
// 		// 	// fn: (val, i, channel) => {
// 		// 	// 	if (Math.abs(val) < 0.02) { // 0.05 много
// 		// 	// 		return 0;
// 		// 	// 	}
// 		// 	//
// 		// 	// 	return val;
// 		// 	// 	//return Math.sin(Math.PI * 2 * frequency * i / rate);
// 		// 	// }
// 		// }));
//
// 		dfr.resolve(audioBuffer);
// 	});
//
// 	return dfr.promise;
// }
//
// function getBufferFromSample(
//   ctx  /*AudioContext*/,
//   zone /*WaveZone*/
// ) /*AudioBuffer*/ {
// 	const decoded = atob(zone.sample);
// 	const buffer = ctx.createBuffer(1, decoded.length / 2, zone.sampleRate);
// 	const float32Array = buffer.getChannelData(0);
// 	let b1,
// 		b2,
// 		n;
// 	for (let i = 0; i < decoded.length / 2; i++) {
// 		b1 = decoded.charCodeAt(i * 2);
// 		b2 = decoded.charCodeAt(i * 2 + 1);
// 		if (b1 < 0) {
// 			b1 = 256 + b1;
// 		}
// 		if (b2 < 0) {
// 			b2 = 256 + b2;
// 		}
// 		n = b2 * 256 + b1;
// 		if (n >= 65536 / 2) {
// 			n = n - 65536;
// 		}
// 		float32Array[i] = n / 65536.0;
// 	}
//
// 	return buffer;
// }
//
// function numValue(aValue, defValue) {
//   if (typeof aValue === 'number') {
//     return aValue;
//   } else {
//     return defValue;
//   }
// }
//
// async function prepareZone (
//   ctx /*AudioContext*/,
//   zone /*WaveZone*/
// ) /*Promise<WaveZone>*/ {
// 	if (zone.buffer) return Promise.resolve(zone);
//
// 	const dfr = new Deferred();
//
// 	zone.delay = zone.delay || 0;
// 	zone.startOffsetSec = zone.startOffsetSec || zone.delay;
// 	zone.loopStart = numValue(zone.loopStart, 0);
// 	zone.loopEnd = numValue(zone.loopEnd, 0);
// 	zone.coarseTune = numValue(zone.coarseTune, 0);
// 	zone.fineTune = numValue(zone.fineTune, 0);
// 	zone.originalPitch = numValue(zone.originalPitch, 6000);
// 	zone.sampleRate = numValue(zone.sampleRate, 44100);
// 	zone.sustain = numValue(zone.originalPitch, 0);
//
// 	if (zone.loopStartSec && zone.loopEndSec && zone.loopEndSec > zone.loopStartSec) {
// 		zone.loop = true;
// 	}
//
// 	if (zone.sampleRate &&
// 		zone.loopStart && zone.loopEnd &&
// 		zone.loopStart>1 && zone.loopEnd >= zone.loopStart &&
// 		!zone.loopStartSec && !zone.loopEndSec
// 	) {
// 		zone.loop = true;
// 		zone.loopStartSec = zone.loopStart / zone.sampleRate;
// 		zone.loopEndSec = zone.loopEnd / zone.sampleRate;
// 	}
//
// 	// create buffer
// 	if (zone.file) {
// 		zone.buffer = await getBufferFromFile(ctx, zone.file);
// 		dfr.resolve(zone);
// 	}
// 	else if (zone.sample) {
// 		zone.buffer = getBufferFromSample(ctx, zone);
// 		dfr.resolve(zone);
// 	}
// 	else {
// 		dfr.resolve(zone);
// 	}
//
// 	return dfr.promise;
// } // prepareZone
//
// async function preparePreset (x
//   /*{
// 		audioContext: AudioContext,
// 		preset: WavePreset,
// 		var?: string,
// 		id?: number | string
// 	} & {[key: string]: any}
//   */
// ) /* Promise<WavePreset | null> */ {
// 	if (!x.preset) {
// 		console.log('preparePreset: preset is null', x);
//
// 		return Promise.resolve(null);
// 	}
//
// 	x.preset.pitchShift = numValue(x.preset.pitchShift, 0);
//
// 	// TODO: сделать нормальный override костыль
// 	if (x.var === '_tone_0180_FluidR3_GM_sf2_file') {
// 		x.preset.pitchShift = 12;
// 	}
// 	else if (x.var === '_tone_0130_GeneralUserGS_sf2_file') {
// 		x.preset.pitchShift = 12;
// 	}
//
// 	for (let i = 0; i < x.preset.zones.length; i++) {
// 		prepareZone(x.audioContext, x.preset.zones[i]);
// 	}
//
// 	return Promise.resolve(x.preset);
// } // preparePreset

