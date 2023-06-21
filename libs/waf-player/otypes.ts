export type WaveBox = {
	gain: GainNode,
	audioBufferSourceNode?: AudioBufferSourceNode | null,
	target: AudioNode,
	when: number,
	duration: number,
	cancel: () => void,
	pitch: number,
	preset: WavePreset,
};
export type WaveZone = {
	keyRangeLow: number,
	keyRangeHigh: number,
	originalPitch: number,
	coarseTune: number,
	fineTune: number,
	loopStart: number,
	loopEnd: number,
	buffer?: AudioBuffer,
	sampleRate: number,
	delay?: number,
	ahdsr?: boolean | WaveAHDSR[],
	sample?: string,
	file?: string,
	sustain?: number,
	// new
	midi?: number,
	startOffsetSec?: number,
	loop?: boolean,
	loopStartSec?: number,
	loopEndSec?: number,
	headMs?: number,
	tailMs?: number,
	tailed?: boolean,
};
export type WavePreset = {
	pitchShift?: number,
	zones: WaveZone[];
};
export type WaveSlide = {
    endWhen: number,
    delta: number,
    volume?: number | null,
    isPlato?: boolean,
	hasVolumeSlide?: boolean,
};
export type WaveAHDSR = {
	duration: number,
	volume: number
};
export type CachedPreset = {
	variableName: string,
	filePath: string
};
export type NumPair = number[];
export type PresetInfo = {
	variable: string,
	url: string,
	title: string,
	pitch: number,
	fileName: string,
};
export type ChordQueue = {
	when: number,
	destination: AudioNode,
	preset: WavePreset,
	pitch: number,
	duration: number,
	volume?: number,
	slides?: WaveSlide[],
};
