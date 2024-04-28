export type TWaveBox = {
	gain: GainNode,
	audioBufferSourceNode?: AudioBufferSourceNode | null,
	target: AudioNode,
	when: number,
	duration: number,
	cancel: () => void,
	pitch: number,
	preset: TWavePreset,
};
export type TWaveZone = {
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
	ahdsr?: boolean | TWaveAHDSR[],
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
export type TWavePreset = {
	pitchShift?: number,
	zones: TWaveZone[];
};
export type TWaveSlide = {
	endWhen: number,
	delta: number,
	volume?: number | null,
	isPlato?: boolean,
	hasVolumeSlide?: boolean,
};
export type TWaveAHDSR = {
	duration: number,
	volume: number
};
export type TCachedPreset = {
	variableName: string,
	filePath: string
};
export type TNumPair = number[];
export type TPresetInfo = {
	variable: string,
	url: string,
	title: string,
	pitch: number,
	fileName: string,
};
export type TChordQueue = {
	when: number,
	destination: AudioNode,
	preset: TWavePreset,
	pitch: number,
	duration: number,
	volume?: number,
	slides?: TWaveSlide[],
};
