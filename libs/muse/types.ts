export type TStringHash = {[key: string]: string};

export type TLineNote = {
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

export type TStoredRow = {
    partId?: string,
    rowNio?: number, // jjkl
    rowInPartId: string,
    type: string,
    track: string,
    status: string,
    lines: TLine[],
}

export type TWaveSlide = {
    endWhen: number,
    delta: number,
    volume?: number | null,
    isPlato?: boolean,
    hasVolumeSlide?: boolean,
};

export type TNoteInfo = {
    note: string,
    durationQ: number,
    durationForNextQ: number,
    volume: number,
    cent?: number,
    instr?: string,
    pitchShift?: number,
    slides?: TWaveSlide[];
    slidesText?: string;
}

export type TNoteLineInfo = {
    notes: TNoteInfo[],
    durationQ: number,
    repeat: number,
    bpm: number,
};

export type TTrackInfo = {
    name: string,
    board: string,
    volume: number,
    items?: {name: string, volume: number}[], // громкость по инструментам трека

    label?: string,
    isHardTrack?: boolean,
    isExcluded?: boolean,
}

export type TSongNode = {
    id: string,
    bpmValue: number,
    volume?: number,
    version: number,
    content: string,
    tracks: TTrackInfo[],
    hideMetronome?: boolean,
    score: string,
    tags: string[],
    parts: {name: string, id: string}[],
    dynamic: TStoredRow[],
    ns?: string,
    pitchShift?: number,
    pitchShiftSrc?: number,
    songNodeHard?: any,
};

export type TBlockType = 'text' | 'drums' | 'tones' | 'set';

export type TTextBlock = {
    id: string;
    head: string,
    rows: string[];
    nio: number;
    startRow: number;
    endRow: number;
    type: TBlockType;
    repeat?: number;
    bpm?: number;
    volume?: number;
};

export type TKeyData = {
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

export type TCell = {
    id: number;
    startOffsetQ: number;
    notes: TLineNote[]
    blockOffsetQ?: number;
}

export type TLine = {
    //nio: number,
    durQ: number,
    startOffsetQ: number,
    blockOffsetQ: number,
    rowInPartId: string,
    cellSizeQ: number,
    cells: TCell[],
    endLine?: boolean,
}

export type TDataByTracks = {
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

export type TSongPartInfo = {
    name: string,
    partNio: number,
    rowNio: number,
    partId: string,
    mask: string,
    ref: string,
    rowInPartId: string,
};

export type TFileSettings = {
    import: string[],
    exclude: string[],
    dataByTracks: {[key: string]: string},
    pitchShift: string[],
    boardShift: string[],
    boardInstr: string[],
    bpm: string[],
    //[key: string]: any,
};

export type TRowInfo = {
    first: number,
    last: number,
}
