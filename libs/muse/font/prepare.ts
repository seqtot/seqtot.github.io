import { TWavePreset, TWaveZone } from './otypes'
import { Deferred } from './utils';
import { getAudioBufferFromString } from './get-audio-buffer-from-string';
import { getAudioBufferFromSample } from './get-audio-buffer-from-sample';

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

export function findZone(audioContext: AudioContext, preset: TWavePreset, pitch: number): TWaveZone | null {
	var zone: TWaveZone | null = null;
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


export async function prepareZone (ctx: AudioContext, zone: TWaveZone): Promise<TWaveZone> {
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
		zone.buffer = await getAudioBufferFromString(zone.file, ctx);
		dfr.resolve(zone);
	}
	else if (zone.sample) {
		zone.buffer = await getAudioBufferFromSample(zone.sample, zone.sampleRate, ctx);
		dfr.resolve(zone);
	}
	else {
		dfr.resolve(zone);
	}

	return dfr.promise;
}

export async function preparePreset(
	x: {
		audioContext: AudioContext,
		preset: TWavePreset,
		var?: string,
		id?: number | string
	} & {[key: string]: any}
): Promise<TWavePreset | null> {
	if (!x.preset) {
		console.log('preparePreset: preset is null', x);

		return Promise.resolve(null);
	}

	x.preset.pitchShift = numValue(x.preset.pitchShift, 0);

	// TODO: сделать нормальный override костыль
	if (x.var === '_tone_0180_FluidR3_GM_sf2_file') {
		x.preset.pitchShift = 12;
	}
	else if (x.var === '_tone_0130_GeneralUserGS_sf2_file') {
		x.preset.pitchShift = 12;
	}

	for (let i = 0; i < x.preset.zones.length; i++) {
		prepareZone(x.audioContext, x.preset.zones[i]);
	}

	return Promise.resolve(x.preset);
}
