export async function getAudioBufferFromSample(sample: string, sampleRate: number, ctx?: AudioContext): Promise<AudioBuffer> {
	ctx = ctx || new AudioContext();
	const decoded = atob(sample);
	const buffer = ctx.createBuffer(1, decoded.length / 2, sampleRate);
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

	return Promise.resolve(buffer);
}
