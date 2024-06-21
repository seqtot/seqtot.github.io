import {TWaveBox, TWavePreset, TWaveZone, TWaveAHDSR, TWaveSlide} from './otypes'
import {WebAudioFontLoader} from './loader'
import {WebAudioFontChannel} from './channel';
import {WebAudioFontReverberator} from './reverberator';
import {findZone} from './prepare';

function isPresent(val: any) {
	return val !== null && val !== undefined;
}

export  class WebAudioFontPlayer {
	wboxes: TWaveBox[] = [];
	loader = new WebAudioFontLoader(this);
	//onCacheFinish = null;
	//onCacheProgress = null;
	afterTime = 0.05;    // 50ms
	nearZero = 0.000001;

	limitVolume(volume: number | undefined): number {
		return volume ? 1.0 * volume: 0;

		// if (volume) {
		// 	volume = 1.0 * volume;
		// } else {
		// 	volume = 0.5;
		// }
		// return volume;
	};

	noZeroVolume(n: number): number {
		if (n > this.nearZero) {
			return n;
		} else {
			return this.nearZero;
		}
	};

	// createChannel(audioContext: AudioContext) {
	// 	return new WebAudioFontChannel(audioContext);
	// };
	//
	// createReverberator(audioContext: AudioContext) {
	// 	return new WebAudioFontReverberator(audioContext);
	// };
	//
	// queueStrum(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
	// 	volume = this.limitVolume(volume);
	// 	if (when < audioContext.currentTime) {
	// 		when = audioContext.currentTime;
	// 	}
	// 	var envelopes: WaveBox[] = [];
	// 	for (var i = 0; i < pitches.length; i++) {
	// 		var singleSlide: undefined | WaveSlide[] = undefined;
	// 		if (slides) {
	// 			singleSlide = slides[i];
	// 		}
	// 		var envlp: WaveBox | null = this.queueWaveTable(audioContext, target, preset, when + i * 0.01, pitches[i], duration, volume - Math.random() * 0.01, singleSlide);
	// 		if (envlp) envelopes.push(envlp);
	// 		volume = 0.9 * volume;
	// 	}
	// 	return envelopes;
	// };

	// queueStrumUp(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
	// 	pitches.sort(function (a, b) {
	// 		return b - a;
	// 	});
	// 	return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides);
	// };

	// queueStrumDown(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
	// 	pitches.sort(function (a, b) {
	// 		return a - b;
	// 	});
	// 	return this.queueStrum(audioContext, target, preset, when, pitches, duration, volume, slides);
	// };

	// queueChord(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
	// 	volume = this.limitVolume(volume);
	// 	var envelopes: WaveBox[] = [];
	// 	for (var i = 0; i < pitches.length; i++) {
	// 		var singleSlide: undefined | WaveSlide[] = undefined;
	// 		if (slides) {
	// 			singleSlide = slides[i];
	// 		}
	// 		var envlp: WaveBox | null = this.queueWaveTable(audioContext, target, preset, when, pitches[i], duration, volume - Math.random() * 0.01, singleSlide);
	// 		if (envlp) envelopes.push(envlp);
	// 	}
	// 	return envelopes;
	// };

	// queueSnap(audioContext: AudioContext, target: AudioNode, preset: WavePreset, when: number, pitches: number[], duration: number, volume?: number, slides?: WaveSlide[][]): WaveBox[] {
	// 	volume = this.limitVolume(volume);
	// 	volume = 1.5 * (volume || 1.0);
	// 	duration = 0.05;
	// 	return this.queueChord(audioContext, target, preset, when, pitches, duration, volume, slides);
	// };

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

	queueWaveTableSrc(x: {
		audioContext: AudioContext,
		targetNode: AudioNode,
		preset: TWavePreset,
		zone?: TWaveZone,
		when: number,
		pitch: number,
		duration: number,
		volume?: number,
		slides?: TWaveSlide[],
		cent?: number,
		asdf?: boolean,
	}): TWaveBox | null {
		//console.log(x.pitch, x.zone);

		let pitch = x.pitch + x.preset.pitchShift;
		let volume = this.limitVolume(x.volume);
		let cent = x.cent || 0;

		this.resumeContext(x.audioContext);
		var zone: TWaveZone = x.zone || findZone(x.audioContext, x.preset, pitch);

		if (!zone) {
			return null;
		}

		if (!(zone.buffer)) {
			console.log('empty buffer ', zone);
			return null;
		}
		var baseDetune = zone.originalPitch - 100.0 * zone.coarseTune - zone.fineTune;
		var playbackRate = 1.0 * Math.pow(2, ((100.0 * pitch + cent) - baseDetune) / 1200.0);
		let startWhen = x.when;
		if (startWhen < x.audioContext.currentTime) {
			startWhen = x.audioContext.currentTime;
		}
		var soundDuration = x.duration + this.afterTime;
		var loop = !!zone.loop;
		// if (zone.loopStart < 1 || zone.loopStart >= zone.loopEnd) {
		// 	loop = false;
		// }

		if (!loop) {
			if (soundDuration > zone.buffer.duration / playbackRate) {
				soundDuration = zone.buffer.duration / playbackRate;
			}
		}

		let hasVolumeSlide = false;
		let lastSlideVolume = volume;
		let lastSlideDelta = 0;
		let lastSlidePlaybackRate = playbackRate;
		let envelope: TWaveBox = this.findWaveBox(x.audioContext, x.targetNode);
		envelope.audioBufferSourceNode = x.audioContext.createBufferSource();

		// SLIDES (volume and playbackRate)
		const gain = envelope.gain.gain;
		gain.cancelScheduledValues(startWhen);
		envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, startWhen);

		const slides = x.slides && x.slides.length > 0 ? x.slides : [];

		//console.log('slides', startWhen, slides);

		//const volumeSlideMap = {};

		const platoMap = {};
		for (let i = 0; i < slides.length; i++) {
			let slide = slides[i];
			let endWhen = startWhen + slide.endWhen;
			let volumeIsPresent = isPresent(slide.volume);

			hasVolumeSlide = volumeIsPresent || hasVolumeSlide;
			lastSlideVolume = volumeIsPresent
				? volume * (slide.volume / 50)
				: lastSlideVolume;

			const noZeroVolume = this.noZeroVolume(lastSlideVolume);

			if (i === 0) {
				envelope.audioBufferSourceNode.playbackRate.setValueAtTime(playbackRate, endWhen);
				// иначе установится в setupWaveBox, но возможно нужен будет рефакторинг
				if (slide.hasVolumeSlide) {
					gain.setValueAtTime(noZeroVolume, startWhen);
					platoMap[startWhen] = true;
					if (!platoMap[endWhen]) {
						gain.setValueAtTime(noZeroVolume, endWhen);
						platoMap[endWhen] = true;
					}
				}
			}
			else {
				if (slide.isPlato) {
					if (!platoMap[endWhen]) {
						gain.setValueAtTime(noZeroVolume, endWhen);
						platoMap[endWhen] = true;
					}

					envelope.audioBufferSourceNode.playbackRate.setValueAtTime(lastSlidePlaybackRate, endWhen);
				} else {
					if (slide.delta !== lastSlideDelta) {
						lastSlideDelta = slide.delta || 0;
						lastSlidePlaybackRate = 1.0 * Math.pow(2, ((100.0 * pitch + cent + lastSlideDelta) - baseDetune) / 1200.0);
						envelope.audioBufferSourceNode.playbackRate.linearRampToValueAtTime(lastSlidePlaybackRate, endWhen);
					}

					if (volumeIsPresent) {
						//if (!volumeSlideMap[`${endWhen}-${noZeroVolume}`]) {
							gain.linearRampToValueAtTime(noZeroVolume, endWhen);
							//volumeSlideMap[`${endWhen}-${noZeroVolume}`] = true;
						//}
					}
				}
			}
		} // end slides

		//console.log('volumeSlideMap', volumeSlideMap);

		if (hasVolumeSlide) {
			gain.linearRampToValueAtTime(this.noZeroVolume(0), startWhen + soundDuration);
		}
		else {
			//gain.linearRampToValueAtTime(this.noZeroVolume(0), startWhen + soundDuration);
			this.setupWaveBox(x.audioContext, envelope, zone, volume, startWhen, soundDuration, x.duration);
		}

		//
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
		envelope.audioBufferSourceNode.stop(startWhen + soundDuration);
		envelope.when = startWhen;
		envelope.duration = soundDuration;
		envelope.pitch = pitch;
		envelope.preset = x.preset;

		return envelope;
	};

	setupWaveBox(
		audioContext: AudioContext,
		wbox: TWaveBox,
		zone: TWaveZone,
		volume: number,
		startWhen: number,
		sampleDuration: number,
		noteDuration: number
	) {
		// ORIGINAL (envelop = box)
		var lastTime = 0;
		var lastVolume = 0;
		var duration = noteDuration;
		var zoneahdsr: undefined | boolean | TWaveAHDSR[] = zone.ahdsr;
		if (sampleDuration < duration + this.afterTime) {
			duration = sampleDuration - this.afterTime;
		}
		if (zoneahdsr) {
			if (!((zoneahdsr as any).length > 0)) {
				zoneahdsr = [
					{
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

		let ahdsr: TWaveAHDSR[] = zoneahdsr as TWaveAHDSR[];

		const gain = wbox.gain.gain;
		gain.setValueAtTime(this.noZeroVolume(ahdsr[0].volume * volume), startWhen);

		for (var i = 0; i < ahdsr.length; i++) {
			if (ahdsr[i].duration > 0) {
				if (ahdsr[i].duration + lastTime > duration) {
					var r = 1 - (ahdsr[i].duration + lastTime - duration) / ahdsr[i].duration;
					var n = lastVolume - r * (lastVolume - ahdsr[i].volume);
					gain.linearRampToValueAtTime(this.noZeroVolume(volume * n), startWhen + duration);
					break;
				}
				lastTime = lastTime + ahdsr[i].duration;
				lastVolume = ahdsr[i].volume;
				gain.linearRampToValueAtTime(this.noZeroVolume(volume * lastVolume), startWhen + lastTime);
			}
		}

		gain.linearRampToValueAtTime(this.noZeroVolume(0), startWhen + duration + this.afterTime);
	};

	findWaveBox(audioContext: AudioContext, targetNode: AudioNode): TWaveBox {
		let wbox: TWaveBox | null = null;

		//console.log('wboxes', this.wboxes);

		for (let i = 0; i < this.wboxes.length; i++) {
			let e = this.wboxes[i];
			if (e.target == targetNode && audioContext.currentTime > e.when + e.duration + 0.001) {
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
			wbox = {} as TWaveBox;
			wbox.gain = audioContext.createGain();
			wbox.target = targetNode;
			wbox.gain.connect(targetNode);
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
