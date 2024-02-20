'use babel';

export type StringHash = {[key: string]: string};

export type StoredRow = {
    partId?: string,
    rowNio?: number, // jjkl
    rowInPartId: string,
    type: string,
    track: string,
    status: string,
    lines: Line[],
}

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
    slidesText?: string;
}

export type NoteLineInfo = {
    notes: NoteInfo[],
    durationQ: number,
    repeat: number,
    bpm: number,
};

export type TrackInfo = {
    name: string,
    board: string,
    volume: number,
    items?: {name: string, volume: number}[], // громкость по инструментам трека

    label?: string,
    isHardTrack?: boolean,
    isExcluded?: boolean,
}

export type SongNode = {
    bmpValue: number,
    volume?: number,
    version: number,
    content: string,
    break: string,
    drums: string,
    tracks: TrackInfo[],
    hideMetronome?: boolean,
    score: string,
    parts: {name: string, id: string}[],
    dynamic: StoredRow[],
    source: 'my' | 'band',
    isSongList?: boolean,
    ns?: string,
    nsOld?: string,
    exportToLineModel?: boolean,
    pitchShift?: number,
    pitchShiftSrc?: number,
    songNodeHard?: any,
};

export type BlockType = 'text' | 'drums' | 'tones' | 'set';

export type TextBlock = {
    id: string;
    head: string,
    rows: string[];
    nio: number;
    startRow: number;
    endRow: number;
    type: BlockType;
    repeat?: number;
    bpm?: number;
    volume?: number;
};

export type KeyData = {
    quarterTime: number;
    quarterNio: number;
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
    color: string;
    color2: string;
    char: string;
};

export type LineNote = {
    id: number;
    durQ: number;
    note: string;
    startOffsetQ: number;

    lineOffsetQ?: number; // TODO
    headColor?: string;
    bodyColor?: string;
    char?: string;
    instCode?: string | number;
    instName?: string;
    volume?: number;
    slides?: string;
    pitchShift?: number;
    cent?: number;
};

export type Cell = {
    id: number;
    startOffsetQ: number;
    notes: LineNote[]
    blockOffsetQ?: number;
}

export type Line = {
    //nio: number,
    durQ: number,
    startOffsetQ: number,
    blockOffsetQ: number,
    rowInPartId: string,
    cellSizeQ: number,
    cells: Cell[],
    endLine?: boolean,
}

export type DataByTracks = {
    total: {
        volume: number,
    },
    [key: string]: {
        volume?: number,
        isExcluded?: boolean,
        items?: {
            [key: string]: {
                volume?: number
            },
        }
    }
};

export type SongPartInfo = {
    name: string,
    partNio: number,
    rowNio: number,
    partId: string,
    mask: string,
    ref: string,
    rowInPartId: string,
};

export type FileSettings = {
    import: string[],
    exclude: string[],
    dataByTracks: {[key: string]: string},
    pitchShift: string[],
    boardShift: string[],
    bpm: string[],
    //[key: string]: any,
};

export type RowInfo = {
    first: number,
    last: number,
}
