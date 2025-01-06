import { Deferred } from './utils';

// https://github.com/audiojs/audio-buffer-utils
export async function getAudioBufferFromString(audioFile: string, ctx?: AudioContext): Promise<AudioBuffer> {
	const dfr = new Deferred();
	let arrayBuffer = new ArrayBuffer(audioFile.length);
	let view = new Uint8Array(arrayBuffer);
	let decoded = atob(audioFile);
	let b;
	for (let i = 0; i < decoded.length; i++) {
		b = decoded.charCodeAt(i);
		view[i] = b;
	}

	ctx = ctx || new AudioContext();
	ctx.decodeAudioData(arrayBuffer, async (val) => {
		dfr.resolve(val);
	});

	return dfr.promise;
}
