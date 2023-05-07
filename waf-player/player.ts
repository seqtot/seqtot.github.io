'use strict'
//console.log('WebAudioFont Engine v3.0.04 GPL3');
//docs 
//npm link typescript
//npx typedoc player.ts otypes.ts channel.ts loader.ts reverberator.ts ticker.ts

import {WaveBox, WavePreset, WaveZone, WaveAHDSR, WaveSlide} from './otypes'
import {WebAudioFontLoader} from './loader'
import {WebAudioFontChannel} from './channel';
import {WebAudioFontReverberator} from './reverberator';
import {preparePreset, prepareZone} from './prepare';

export  class WebAudioFontPlayer {
	wboxes: WaveBox[] = [];
	loader = new WebAudioFontLoader(this);
	//onCacheFinish = null;
	//onCacheProgress = null;
	afterTime = 0.05;    // 50ms
	nearZero = 0.000001; // 0.001ms

	createChannel(audioContext: AudioContext) {
		return new WebAudioFontChannel(audioContext);
	};

	createReverberator(audioContext: AudioContext) {
		return new WebAudioFontReverberator(audioContext);
	};

	limitVolume(volume: number | undefined): number {
		if (volume) {
			volume = 1.0 * volume;
		} else {
			volume = 0.5;
		}
		return volume;
	};

	queueChord(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
		volume = this.limitVolume(volume);
		var envelopes: WaveBox[] = [];
		for (var i = 0; i < pitches.length; i++) {
			var singleSlide: undefined | WaveSlide[] = undefined;
			if (slides) {
				singleSlide = slides[i];
			}
			var envlp: WaveBox | null = this.queueWaveTable(audioContext, target, preset, when, pitches[i], duration, volume - Math.random() * 0.01, singleSlide);
			if (envlp) envelopes.push(envlp);
		}
		return envelopes;
	};

	queueStrumUp(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
		pitches.sort(function (a, b) {
			return b - a;
		});
		return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides);
	};

	queueStrumDown(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
		pitches.sort(function (a, b) {
			return a - b;
		});
		return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides);
	};

	queueStrum(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
		volume = this.limitVolume(volume);
		if (when < audioContext.currentTime) {
			when = audioContext.currentTime;
		}
		var envelopes: WaveBox[] = [];
		for (var i = 0; i < pitches.length; i++) {
			var singleSlide: undefined | WaveSlide[] = undefined;
			if (slides) {
				singleSlide = slides[i];
			}
			var envlp: WaveBox | null = this.queueWaveTable(audioContext, target, preset, when + i * 0.01, pitches[i], duration, volume - Math.random() * 0.01, singleSlide);
			if (envlp) envelopes.push(envlp);
			volume = 0.9 * volume;
		}
		return envelopes;
	};

	queueSnap(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
		volume = this.limitVolume(volume);
		volume = 1.5 * (volume || 1.0);
		duration = 0.05;
		return this.queueChord(audioContext, target, preset, when, pitches, duration, volume, slides);
	};

	resumeContext(audioContext: AudioContext) {
		try {
			if (audioContext.state == 'suspended') {
				console.log('audioContext.resume', audioContext);
				audioContext.resume();
			}
		} catch (e) {
			//don't care
		}
	}

	queueWaveTable2(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitch: number, duration: number, volume?: number, slides?: WaveSlide[]): WaveBox | null {
		this.resumeContext(audioContext);

		volume = this.limitVolume(volume);

		const zone: WaveZone | null = this.findZone(audioContext, preset, pitch);
		if (!(zone.buffer)) {
			console.log('empty buffer ', zone);
			return null;
		}

		let baseDetune = zone.originalPitch - (100.0 * zone.coarseTune) - zone.fineTune;
		let playbackRate = 1.0 * Math.pow(2, (100.0 * pitch - baseDetune) / 1200.0); // original
		//let playbackRate = 1.0;
		// 2 ** ((49 - 48) / 12) https://zpl.fi/pitch-shifting-in-web-audio-api/
		// source.playbackRate.value = 2 ** ((noteToPlay - sampleNote) / 12);
		//let detune = (pitch * 100) - zone.originalPitch - (100.0 * zone.coarseTune) - zone.fineTune;

		let startWhen = when;
		if (startWhen < audioContext.currentTime) {
			startWhen = audioContext.currentTime;
		}
		let waveDuration = duration + this.afterTime;
		let loop = !!zone.loop;
		// if (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) {
		// 	loop = false;
		// }
		if (!loop) {
			if (waveDuration > zone.buffer.duration / playbackRate) {
				waveDuration = zone.buffer.duration / playbackRate;
			}
		}

		// buffer playbackRate loop loopStart loopEnd connect() detune start() stop()
		const wboxBufferSourceNode = audioContext.createBufferSource();
		const wbox: WaveBox = this.findWaveBox(audioContext, target);

		this.setupWaveBox(audioContext, wbox, zone, volume, startWhen, waveDuration, duration);
		wbox.audioBufferSourceNode = wboxBufferSourceNode;
		wboxBufferSourceNode.playbackRate.setValueAtTime(playbackRate, 0);
		//source.detune.value = 100;
		if (slides) {
			if (slides.length > 0) {
				wboxBufferSourceNode.playbackRate.setValueAtTime(playbackRate, when);
				for (var i = 0; i < slides.length; i++) {
					let nextPitch = pitch + slides[i].delta;
					let newPlaybackRate = 1.0 * Math.pow(2, (100.0 * nextPitch - baseDetune) / 1200.0);
					let newWhen = when + slides[i].when;
					wboxBufferSourceNode.playbackRate.linearRampToValueAtTime(newPlaybackRate, newWhen);
				}
			}
		}
		wboxBufferSourceNode.buffer = zone.buffer;

		if (loop) {
			wboxBufferSourceNode.loop = true;
			//envelope.audioBufferSourceNode.loopStart = zone.loopStart / zone.sampleRate + ((zone.delay) ? zone.delay : 0);
			//envelope.audioBufferSourceNode.loopEnd = zone.loopEnd / zone.sampleRate + ((zone.delay) ? zone.delay : 0);
			//wboxBufferSourceNode.loopStart = zone.loopStartSec + ((zone.delay) ? -zone.delay : 0);
			//wboxBufferSourceNode.loopEnd = zone.loopEndSec + ((zone.delay) ? -zone.delay : 0);
			wboxBufferSourceNode.loopStart = zone.loopStartSec;
			wboxBufferSourceNode.loopEnd = zone.loopEndSec;
		} else {
			wboxBufferSourceNode.loop = false;
		}

		wboxBufferSourceNode.connect(wbox.gain);
		//wboxBufferSourceNode.detune.value = detune; // вместо playbackRate
		wboxBufferSourceNode.start(startWhen, zone.startOffsetSec);
		wboxBufferSourceNode.stop(startWhen + waveDuration);
		wbox.when = startWhen;
		wbox.duration = waveDuration;
		wbox.pitch = pitch;
		wbox.preset = preset;

		return wbox;
	};

	queueWaveTable(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitch: number, duration: number, volume?: number, slides?: WaveSlide[]): WaveBox | null {
		this.resumeContext(audioContext);
		volume = this.limitVolume(volume);
		var zone: WaveZone | null = this.findZone(audioContext, preset, pitch);
		if (zone) {
			if (!(zone.buffer)) {
				console.log('empty buffer ', zone);
				return null;
			}
			var baseDetune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune;
			var playbackRate = 1.0 * Math.pow(2, (100.0 * pitch - baseDetune) / 1200.0);
			var startWhen = when;
			if (startWhen < audioContext.currentTime) {
				startWhen = audioContext.currentTime;
			}
			var waveDuration = duration + this.afterTime;
			var loop = !!zone.loop;
			// if (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) {
			// 	loop = false;
			// }
			if (!loop) {
				if (waveDuration > zone.buffer.duration / playbackRate) {
					waveDuration = zone.buffer.duration / playbackRate;
				}
			}
			var envelope: WaveBox = this.findWaveBox(audioContext, target);
			this.setupWaveBox(audioContext, envelope, zone, volume, startWhen, waveDuration, duration);
			envelope.audioBufferSourceNode = audioContext.createBufferSource();
			envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, 0);
			if (slides) {
				if (slides.length > 0) {
					envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, when);
					for (var i = 0; i < slides.length; i++) {
						var nextPitch = pitch + slides[i].delta;
						var newPlaybackRate = 1.0 * Math.pow(2, (100.0 * nextPitch - baseDetune) / 1200.0);
						var newWhen = when + slides[i].when;
						envelope.audioBufferSourceNode.playbackRate.linearRampToValueAtTime(newPlaybackRate, newWhen);
					}
				}
			}
			envelope.audioBufferSourceNode.buffer = zone.buffer;
			if (loop) {
				envelope.audioBufferSourceNode.loop = true;
				//envelope.audioBufferSourceNode.loopStart = zone.loopStart / zone.sampleRate + ((zone.delay) ? zone.delay : 0);
				//envelope.audioBufferSourceNode.loopEnd = zone.loopEnd / zone.sampleRate + ((zone.delay) ? zone.delay : 0);
				envelope.audioBufferSourceNode.loopStart = zone.loopStartSec;
				envelope.audioBufferSourceNode.loopEnd = zone.loopEndSec;
			} else {
				envelope.audioBufferSourceNode.loop = false;
			}
			envelope.audioBufferSourceNode.connect(envelope.gain);
			envelope.audioBufferSourceNode.start(startWhen, zone.delay);
			envelope.audioBufferSourceNode.stop(startWhen + waveDuration);
			envelope.when = startWhen;
			envelope.duration = waveDuration;
			envelope.pitch = pitch;
			envelope.preset = preset;
			return envelope;
		} else {
			return null
		}
	};

	noZeroVolume(n: number): number {
		if (n > this.nearZero) {
			return n;
		} else {
			return this.nearZero;
		}
	};

	setupWaveBox(audioContext: AudioContext, wbox: WaveBox, zone: WaveZone, volume: number, when: number, sampleDuration: number, noteDuration: number) {
		// wbox.gain.gain.setValueAtTime(this.noZeroVolume(0), audioContext.currentTime);
		// wbox.gain.gain.linearRampToValueAtTime(1, audioContext.currentTime + (1/12));

		// ORIGINAL (envelop = box)
		const gain = wbox.gain.gain;
		gain.setValueAtTime(this.noZeroVolume(0), audioContext.currentTime);
		var lastTime = 0;
		var lastVolume = 0;
		var duration = noteDuration;
		var zoneahdsr: undefined | boolean | WaveAHDSR[] = zone.ahdsr;
		if (sampleDuration < duration + this.afterTime) {
			duration = sampleDuration - this.afterTime;
		}
		if (zoneahdsr) {
			if (!((zoneahdsr as any).length > 0)) {
				zoneahdsr = [{
					duration: 0,
					volume: 1
				}, {
					duration: 0.5,
					volume: 1
				}, {
					duration: 1.5,
					volume: 0.5
				}, {
					duration: 3,
					volume: 0
				}
				];
			}
		} else {
			zoneahdsr = [{
				duration: 0,
				volume: 1
			}, {
				duration: duration,
				volume: 1
			}
			];
		}
		var ahdsr: WaveAHDSR[] = zoneahdsr as WaveAHDSR[];
		gain.cancelScheduledValues(when);
		gain.setValueAtTime(this.noZeroVolume(ahdsr[0].volume * volume), when);
		for (var i = 0; i < ahdsr.length; i++) {
			if (ahdsr[i].duration > 0) {
				if (ahdsr[i].duration + lastTime > duration) {
					var r = 1 - (ahdsr[i].duration + lastTime - duration) / ahdsr[i].duration;
					var n = lastVolume - r * (lastVolume - ahdsr[i].volume);
					gain.linearRampToValueAtTime(this.noZeroVolume(volume * n), when + duration);
					break;
				}
				lastTime = lastTime + ahdsr[i].duration;
				lastVolume = ahdsr[i].volume;
				wbox.gain.gain.linearRampToValueAtTime(this.noZeroVolume(volume * lastVolume), when + lastTime);
			}
		}

		gain.linearRampToValueAtTime(this.noZeroVolume(0), when + duration + this.afterTime);
	};

	numValue(aValue: any, defValue: number): number {
		if (typeof aValue === "number") {
			return aValue;
		} else {
			return defValue;
		}
	};

	findWaveBox(audioContext: AudioContext, target: AudioNode): WaveBox {
		let wbox: WaveBox | null = null;

		for (let i = 0; i < this.wboxes.length; i++) {
			let e = this.wboxes[i];
			if (e.target == target && audioContext.currentTime > e.when + e.duration + 0.001) {
				try {
					if (e.audioBufferSourceNode) {
						e.audioBufferSourceNode.disconnect();
						e.audioBufferSourceNode.stop(0);
						e.audioBufferSourceNode = null;
					}
				} catch (x) {
					//audioBufferSourceNode is dead already
				}
				wbox = e;
				break;
			}
		}

		// if (!(envelope)) {
		// 	envelope = (audioContext.createGain() as any) as WaveBox;
		// 	envelope.target = target;
		// 	((envelope as any) as GainNode).connect(target);
		// 	envelope.cancel = function () {
		// 		if (envelope && (envelope.when + envelope.duration > audioContext.currentTime)) {
		// 			((envelope as any) as GainNode).gain.cancelScheduledValues(0);
		// 			((envelope as any) as GainNode).gain.setTargetAtTime(0.00001, audioContext.currentTime, 0.1);
		// 			envelope.when = audioContext.currentTime + 0.00001;
		// 			envelope.duration = 0;
		// 		}
		// 	};
		// 	this.envelopes.push(envelope);
		// }

		if (!(wbox)) {
			wbox = {} as WaveBox;
			wbox.gain = audioContext.createGain();
			wbox.target = target;
			wbox.gain.connect(target);
			wbox.cancel = function () {
				if (wbox && (wbox.when + wbox.duration > audioContext.currentTime)) {
					wbox.gain.gain.cancelScheduledValues(0);
					wbox.gain.gain.setTargetAtTime(0.00001, audioContext.currentTime, 0.1);
					wbox.when = audioContext.currentTime + 0.00001;
					wbox.duration = 0;
				}
			};
			this.wboxes.push(wbox);
		}

		return wbox;
	};

	adjustPreset = async function (audioContext: AudioContext, preset: WavePreset): Promise<WavePreset> {
		return preparePreset(audioContext, preset);
	};

	adjustZone = function (ctx: AudioContext, zone: WaveZone): Promise<WaveZone> {
		return prepareZone(ctx, zone);
	};

	findZone(audioContext: AudioContext, preset: WavePreset, pitch: number): WaveZone | null {
		var zone: WaveZone | null = null;
		for (var i = preset.zones.length - 1; i >= 0; i--) {
			zone = preset.zones[i];
			//if (zone.keyRangeLow <= pitch && zone.keyRangeHigh + 1 >= pitch) { // original
			if (zone.keyRangeLow <= pitch && zone.keyRangeHigh >= pitch) {
				break;
			}
		}
		try {
			if (zone) this.adjustZone(audioContext, zone);
		} catch (ex) {
			console.log('adjustZone', ex);
		}
		return zone;
	};

	cancelQueue(audioContext: AudioContext) {
		for (var i = 0; i < this.wboxes.length; i++) {
			var e = this.wboxes[i];
			e.gain.gain.cancelScheduledValues(0);
			e.gain.gain.setValueAtTime(this.nearZero, audioContext.currentTime);
			e.when = -1;
			try {
				if (e.audioBufferSourceNode) e.audioBufferSourceNode.disconnect();
			} catch (ex) {
				console.log(ex);
			}
		}
	};
}

// queue  [kjuː] очередь коса хвост
// coarse [kɔːrs] грубый крупный
// envelope [ˈenvələʊp] конверт, оболочка, огибающая, обложка, футляр, обертка, покрышка, обвертка, пленка

// а и о у ы э
// йа йо йу (йи йы йэ)
// в ж з л м н р с ф х ш щ
// б г д к п т ц ч

// м н р х ш

// он са