'use babel';

export type WaveSlide = {
    endWhen: number,
    delta: number,
    volume?: number | null,
    isPlato?: boolean,
    hasVolumeSlide?: boolean,
};

export type NoteInfo = {
    note: string,
    durationQ: number,
    durationForNextQ: number,
    volume: number,
    cent?: number,
    instr?: string,
    pitchShift?: number,
    slides?: WaveSlide[];
}

export type NoteLineInfo = {
    notes: NoteInfo[],
    durationQ: number,
    repeat: number,
    bpm: number,
};
