'use babel';

import {WavePreset, WaveZone} from './otypes'
import {Deferred} from './utils';

function isNeg (number): boolean {
	return number === 0 && (1 / number) === -Infinity;
}

function nidx (idx, length) {
	return idx == null ? 0 : isNeg(idx) ? length : idx <= -length ? 0 : idx < 0 ? (length + (idx % length)) : Math.min(length, idx);
}

/**
 * Generic in-place fill/transform
 */
function fill (params: {buffer: AudioBuffer, fn?: (...args) => number, target?: AudioBuffer, value?: number, start?: number, end?: number}): AudioBuffer {
	let {buffer, fn, target, value, start, end} = params;

	if (!target) {
		target = buffer;
	}

	// if target buffer is passed
	// if (!isAudioBuffer(target) && target != null) {
	// 	//target is bad argument
	// 	if (typeof value == 'function') {
	// 		target = null;
	// 	}
	// 	else {
	// 		end = start;
	// 		start = value;
	// 		value = target;
	// 		target = null;
	// 	}
	// }
	//
	// if (target) {
	// 	validate(target);
	// }
	// else {
	// 	target = buffer;
	// }
	//
	// //resolve optional start/end args
	// start = start == null ? 0 : nidx(start, buffer.length);
	// end = end == null ? buffer.length : nidx(end, buffer.length);
	// //resolve type of value
	// if (!(value instanceof Function)) {
	// 	for (var channel = 0, c = buffer.numberOfChannels; channel < c; channel++) {
	// 		var targetData = target.getChannelData(channel);
	// 		for (var i = start; i < end; i++) {
	// 			targetData[i] = value
	// 		}
	// 	}
	// }
	// else {
	// 	for (var channel = 0, c = buffer.numberOfChannels; channel < c; channel++) {
	// 		var data = buffer.getChannelData(channel),
	// 			targetData = target.getChannelData(channel);
	// 		for (var i = start; i < end; i++) {
	// 			targetData[i] = value.call(buffer, data[i], i, channel, data);
	// 		}
	// 	}
	// }
	//
	// return target;

	//resolve optional start/end args
	start = start == null ? 0 : nidx(start, buffer.length);
	end = end == null ? buffer.length : nidx(end, buffer.length);
	//resolve type of value
	if (!fn) {
		for (let channel = 0, c = buffer.numberOfChannels; channel < c; channel++) {
			let targetData = target.getChannelData(channel);
			for (let i = start; i < end; i++) {
				targetData[i] = value
			}
		}
	}
	else {
		for (let channel = 0, c = buffer.numberOfChannels; channel < c; channel++) {
			let data = buffer.getChannelData(channel),
				targetData = target.getChannelData(channel);
			for (var i = start; i < end; i++) {
				targetData[i] = fn.call(buffer, data[i], i, channel, data);
			}
		}
	}

	return target;
}

function shallow (ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {

	//workaround for faster browser creation
	//avoid extra checks & copying inside of AudioBuffer class
	//if (isBrowser) {
	return ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
	//}

	//return create(buffer.length, buffer.numberOfChannels, buffer.sampleRate);
}


function clone (ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {
	return copy(buffer, shallow(ctx, buffer));
}

function copy (from: AudioBuffer, to: AudioBuffer, offset?: number): AudioBuffer {
	offset = offset || 0;

	for (let channel = 0, l = Math.min(from.numberOfChannels, to.numberOfChannels); channel < l; channel++) {
		to.getChannelData(channel).set(from.getChannelData(channel), offset);
	}

	return to;
}

function numValue(aValue: any, defValue: number): number {
	if (typeof aValue === 'number') {
		return aValue;
	} else {
		return defValue;
	}
}

function transformWithZero(val: number, i: number, channel: any, data: number[]) {
	if (i < 3 || !val || i > data.length - 2) {
		return val;
	}

	if (data[i-1] > 0 && data[i+1] < 0) {
		return 0;
	}

	if (data[i-1] < 0 && data[i+1] > 0) {
		return 0;
	}

	return val;
}

// https://github.com/audiojs/audio-buffer-utils
async function getBufferFromFile(ctx: AudioContext, file: string): Promise<AudioBuffer> {
	const dfr = new Deferred();

	let len = file.length;
	let arraybuffer = new ArrayBuffer(len);
	let view = new Uint8Array(arraybuffer);
	let decoded = atob(file);
	let b;
	for (let i = 0; i < decoded.length; i++) {
		b = decoded.charCodeAt(i);
		view[i] = b;
	}
	ctx.decodeAudioData(arraybuffer, audioBuffer => {
		// dfr.resolve(fill({
		// 	buffer: audioBuffer,
		// 	fn: transformWithZero,
		// 	//value: .001,
		// 	// fn: (val, i, channel) => {
		// 	// 	if (Math.abs(val) < 0.02) { // 0.05 много
		// 	// 		return 0;
		// 	// 	}
		// 	//
		// 	// 	return val;
		// 	// 	//return Math.sin(Math.PI * 2 * frequency * i / rate);
		// 	// }
		// }));

		dfr.resolve(audioBuffer);
	});

	return dfr.promise;
}

function getBufferFromSample(ctx: AudioContext, zone: WaveZone): AudioBuffer {
	const decoded = atob(zone.sample);
	const buffer = ctx.createBuffer(1, decoded.length / 2, zone.sampleRate);
	const float32Array = buffer.getChannelData(0);
	let b1,
		b2,
		n;
	for (let i = 0; i < decoded.length / 2; i++) {
		b1 = decoded.charCodeAt(i * 2);
		b2 = decoded.charCodeAt(i * 2 + 1);
		if (b1 < 0) {
			b1 = 256 + b1;
		}
		if (b2 < 0) {
			b2 = 256 + b2;
		}
		n = b2 * 256 + b1;
		if (n >= 65536 / 2) {
			n = n - 65536;
		}
		float32Array[i] = n / 65536.0;
	}

	return buffer;
}

export function findZone(audioContext: AudioContext, preset: WavePreset, pitch: number): WaveZone | null {
	var zone: WaveZone | null = null;
	for (let i = preset.zones.length - 1; i >= 0; i--) {
		zone = preset.zones[i];
		//if (zone.keyRangeLow <= pitch && zone.keyRangeHigh + 1 >= pitch) { // original
		if (zone.keyRangeLow <= pitch && zone.keyRangeHigh >= pitch) {
			break;
		}
	}
	try {
		if (zone) prepareZone(audioContext, zone);
	} catch (ex) {
		console.log('prepareZone', ex);
	}
	return zone;
}

export async function prepareZone (ctx: AudioContext, zone: WaveZone): Promise<WaveZone> {
	if (zone.buffer) return Promise.resolve(zone);

	const dfr = new Deferred();

	zone.delay = zone.delay || 0;
	zone.startOffsetSec = zone.startOffsetSec || zone.delay;
	zone.loopStart = numValue(zone.loopStart, 0);
	zone.loopEnd = numValue(zone.loopEnd, 0);
	zone.coarseTune = numValue(zone.coarseTune, 0);
	zone.fineTune = numValue(zone.fineTune, 0);
	zone.originalPitch = numValue(zone.originalPitch, 6000);
	zone.sampleRate = numValue(zone.sampleRate, 44100);
	zone.sustain = numValue(zone.originalPitch, 0);

	if (zone.loopStartSec && zone.loopEndSec && zone.loopEndSec > zone.loopStartSec) {
		zone.loop = true;
	}

	if (zone.sampleRate &&
		zone.loopStart && zone.loopEnd &&
		zone.loopStart>1 && zone.loopEnd >= zone.loopStart &&
		!zone.loopStartSec && !zone.loopEndSec
	) {
		zone.loop = true;
		zone.loopStartSec = zone.loopStart / zone.sampleRate;
		zone.loopEndSec = zone.loopEnd / zone.sampleRate;
	}

	// create buffer
	if (zone.file) {
		zone.buffer = await getBufferFromFile(ctx, zone.file);
		dfr.resolve(zone);
	}
	else if (zone.sample) {
		zone.buffer = getBufferFromSample(ctx, zone);
		dfr.resolve(zone);
	}
	else {
		dfr.resolve(zone);
	}

	return dfr.promise;
}

export async function preparePreset (audioContext: AudioContext, preset: WavePreset, info?: any): Promise<WavePreset | null> {
	if (!preset) {
		console.log('preparePreset: preset is null', info);

		return Promise.resolve(null);
	}

	preset.pitchShift = numValue(preset.pitchShift, 0);

	for (let i = 0; i < preset.zones.length; i++) {
		prepareZone(audioContext, preset.zones[i]);
	}

	return Promise.resolve(preset);
}
