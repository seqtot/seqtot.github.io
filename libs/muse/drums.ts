export type DrumType =
    | 'hiHatOpened'
    | 'hiHatPedal'
    | 'hiHatClosed'
    | 'snare2'
    | 'snare1'
    | 'sideRimshot'
    | 'bassDrum2'
    | 'bassDrum1'
    | 'handClap'
    | 'lowTom'
    | 'lowTom2'
    | 'lowTom1'
    | 'midTom'
    | 'midTom2'
    | 'midTom1'
    | 'highTom'
    | 'highTom2'
    | 'highTom1'
    | 'crashCymbal1'
    | 'rideCymbal1'
    | 'rideCymbal2'
    | 'chineseCymbal'
    | 'splashCymbal'
    | 'crashCymbal2'
    | 'rideBell'
    | 'tambourine'
    | 'maracas'
    | 'cowbell'
    | 'vibraSlap'
    | 'highBongo'
    | 'lowBongo'
    | 'muteHighConga'
    | 'openHighConga'
    | 'lowConga'
    | 'highTimbale'
    | 'lowTimbale'
    | 'highAgogo'
    | 'lowAgogo'
    | 'cabasa'
    | 'shortWhistle'
    | 'longWhistle'
    | 'shortGuiro'
    | 'longGuiro'
    | 'claves'
    | 'highWoodBlock'
    | 'lowWoodBlock'
    | 'muteCuica'
    | 'openCuica'
    | 'muteTriangle'
    | 'openTriangle'
    | 'nil';


export const Drums: Record<DrumType, number> = {
    'bassDrum2': 35, // bd
    'bassDrum1': 36,
    'sideRimshot': 37,
    'snare1': 38,
    'handClap': 39,
    'snare2': 40, // sn
    'lowTom': 41,
    'lowTom2': 41,
    'hiHatClosed': 42, // hc
    'lowTom1': 43,
    'hiHatPedal': 44,
    'midTom': 45,
    'midTom2': 45,
    'hiHatOpened': 46, // ho
    'midTom1': 47,
    'highTom': 48,
    'highTom2': 48,
    'crashCymbal1': 49,
    'highTom1': 50,
    'rideCymbal1': 51,
    'chineseCymbal': 52,
    'rideBell': 53,
    'tambourine': 54,
    'splashCymbal': 55,
    'cowbell': 56,
    'crashCymbal2': 57,
    'vibraSlap': 58,
    'rideCymbal2': 59,
    'highBongo': 60,
    'lowBongo': 61,
    'muteHighConga': 62,
    'openHighConga': 63,
    'lowConga': 64,
    'highTimbale': 65,
    'lowTimbale': 66,
    'highAgogo': 67,
    'lowAgogo': 68,
    'cabasa': 69,
    'maracas': 70,
    'shortWhistle': 71,
    'longWhistle': 72,
    'shortGuiro': 73,
    'longGuiro': 74,
    'claves': 75,
    'highWoodBlock': 76,
    'lowWoodBlock': 77,
    'muteCuica': 78,
    'openCuica': 79,
    'muteTriangle': 80,
    'openTriangle': 81,
    'nil': 80,
} as const;

// hc ho hp
// bd
// sn
// tl tm th


export const drumMidiCodeByAlias: {[key: string]: number} = {
    'hc': 42,
    'ho': 46,
    'hp': 44,

    'bd': 35,
    'bd1': 36,
    'bd2': 35,

    'sn': 40,
    'sn1': 38,
    'sn2': 40,

    'sideRimshot': 37,
    'sr': 37,

    'handClap': 39,
    'tambourine': 54,
    'vibraSlap': 58,
    'rideBell': 53,
    'cowbell': 56,

    'tl': 41,
    'lowTom2': 41,
    'tl2': 41,
    'lowTom1': 43,
    'tl1': 43,

    'tm': 45,
    'midTom2': 45,
    'tm2': 45,
    'midTom1': 47,
    'tm1': 47,

    'th': 50,
    'highTom2': 48,
    'th2': 48,
    'highTom1': 50,
    'th1': 50,

    'cc': 57,
    'crashCymbal2': 57,
    'cc2': 57,
    'crashCymbal1': 49,
    'cc1': 49,

    'rc': 59,
    'rideCymbal2': 59,
    'rc2': 59,
    'rideCymbal1': 51,
    'rc1': 51,

    'splashCymbal': 55,
    'chineseCymbal': 52,

    'highBongo': 60,
    'lowBongo': 61,

    'muteHighConga': 62,
    'openHighConga': 63,
    'lowConga': 64,

    'highTimbale': 65,
    'lowTimbale': 66,

    'highAgogo': 67,
    'lowAgogo': 68,

    'cabasa': 69,
    'maracas': 70,
    'claves': 75,

    'shortWhistle': 71,
    'longWhistle': 72,

    'shortGuiro': 73,
    'longGuiro': 74,

    'highWoodBlock': 76,
    'lowWoodBlock': 77,

    'muteCuica': 78,
    'openCuica': 79,

    'muteTriangle': 80,
    'openTriangle': 81,
    'nil': 80,
};

export const drumIdByAlias = Object.keys(drumMidiCodeByAlias).reduce((acc, key) => {
    acc[key] = `drum_${drumMidiCodeByAlias[key]}`;

    return acc;
}, {})  as {[key: string]: string};

export const drumInfo: Record<
    DrumType,
    {
        octave: string;
        volume: number;
        instrCode?: number;
        noteLat: string;
        noteRus: string;
    }
    > = {
    'hiHatOpened': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.hiHatOpened,
        noteLat: 'ho',
        noteRus: 'хо',
    },
    'hiHatClosed': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.hiHatClosed,
        noteLat: 'hc',
        noteRus: 'хз',
    },
    'hiHatPedal': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.hiHatPedal,
        noteLat: 'hp',
        noteRus: 'хп',
    },

    'snare2': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.snare2,
        noteLat: 'sn',
        noteRus: 'мб',
    },
    'snare1': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.snare1,
        noteLat: 'sn1',
        noteRus: 'мб1',
    },
    'sideRimshot': {
        // удар по ободу
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.sideRimshot,
        noteLat: 'sr',
        noteRus: 'sr',
    },

    'bassDrum2': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.bassDrum2, // 36
        noteLat: 'bd',
        noteRus: 'бб',
    },
    'bassDrum1': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.bassDrum1, // 35
        noteLat: 'bd1',
        noteRus: 'бб1',
    },
    'lowTom': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowTom2,
        noteLat: 'tl',
        noteRus: 'тл',
    },
    'lowTom2': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowTom2,
        noteLat: 'tl2',
        noteRus: 'тл2',
    },
    'lowTom1': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowTom1,
        noteLat: 'tl1',
        noteRus: 'тл1',
    },
    'midTom': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.midTom2,
        noteLat: 'tm',
        noteRus: 'тм',
    },
    'midTom2': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.midTom2,
        noteLat: 'tm2',
        noteRus: 'тм2',
    },
    'midTom1': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.midTom1,
        noteLat: 'tm1',
        noteRus: 'тм1',
    },
    'highTom': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highTom2,
        noteLat: 'th',
        noteRus: 'тх',
    },
    'highTom2': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highTom2,
        noteLat: 'th2',
        noteRus: 'тх2',
    },
    'highTom1': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highTom1,
        noteLat: 'th1',
        noteRus: 'тх1',
    },

    'crashCymbal2': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.crashCymbal2,
        noteLat: 'cc',
        noteRus: 'cc',
    },

    'crashCymbal1': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.crashCymbal1,
        noteLat: 'cc1',
        noteRus: 'cc1',
    },

    'splashCymbal': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.splashCymbal,
        noteLat: 'splashCymbal',
        noteRus: 'splashCymbal',
    },

    'rideCymbal2': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.rideCymbal2,
        noteLat: 'rc',
        noteRus: 'rc',
    },

    'rideCymbal1': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.rideCymbal1,
        noteLat: 'rc1',
        noteRus: 'rc1',
    },

    'chineseCymbal': {
        // тарелка
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.chineseCymbal,
        noteLat: 'chineseCymbal',
        noteRus: 'chineseCymbal',
    },

    'handClap': {
        // хлопок в ладоши
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.handClap,
        noteLat: 'handClap',
        noteRus: 'handClap',
    },

    'rideBell': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.rideBell,
        noteLat: 'rideBell',
        noteRus: 'rideBell',
    },

    'cowbell': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.cowbell,
        noteLat: 'cowbell',
        noteRus: 'cowbell',
    },

    'tambourine': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.tambourine,
        noteLat: 'tambourine',
        noteRus: 'tambourine',
    },

    'vibraSlap': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.vibraSlap,
        noteLat: 'vibraSlap',
        noteRus: 'vibraSlap',
    },

    'highBongo': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highBongo,
        noteLat: 'highBongo',
        noteRus: 'highBongo',
    },

    'lowBongo': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowBongo,
        noteLat: 'lowBongo',
        noteRus: 'lowBongo',
    },
    'muteHighConga': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.muteHighConga,
        noteLat: 'muteHighConga',
        noteRus: 'muteHighConga',
    },
    'openHighConga': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.openHighConga,
        noteLat: 'openHighConga',
        noteRus: 'openHighConga',
    },

    'lowConga': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowConga,
        noteLat: 'lowConga',
        noteRus: 'lowConga',
    },

    'highTimbale': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highTimbale,
        noteLat: 'highTimbale',
        noteRus: 'highTimbale',
    },
    'lowTimbale': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowTimbale,
        noteLat: 'lowTimbale',
        noteRus: 'lowTimbale',
    },

    'highAgogo': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highAgogo,
        noteLat: 'highAgogo',
        noteRus: 'highAgogo',
    },
    'lowAgogo': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowAgogo,
        noteLat: 'lowAgogo',
        noteRus: 'lowAgogo',
    },

    'cabasa': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.cabasa,
        noteLat: 'cabasa',
        noteRus: 'cabasa',
    },
    'maracas': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.maracas,
        noteLat: 'maracas',
        noteRus: 'maracas',
    },
    'claves': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.claves,
        noteLat: 'claves',
        noteRus: 'claves',
    },

    'shortWhistle': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.shortWhistle,
        noteLat: 'shortWhistle',
        noteRus: 'shortWhistle',
    },
    'longWhistle': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.longWhistle,
        noteLat: 'longWhistle',
        noteRus: 'longWhistle',
    },

    'shortGuiro': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.shortGuiro,
        noteLat: 'shortGuiro',
        noteRus: 'shortGuiro',
    },
    'longGuiro': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.longGuiro,
        noteLat: 'longGuiro',
        noteRus: 'longGuiro',
    },

    'highWoodBlock': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.highWoodBlock,
        noteLat: 'highWoodBlock',
        noteRus: 'highWoodBlock',
    },
    'lowWoodBlock': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.lowWoodBlock,
        noteLat: 'lowWoodBlock',
        noteRus: 'lowWoodBlock',
    },

    'muteCuica': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.muteCuica,
        noteLat: 'muteCuica',
        noteRus: 'muteCuica',
    },
    'openCuica': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.openCuica,
        noteLat: 'openCuica',
        noteRus: 'openCuica',
    },
    'muteTriangle': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.muteTriangle,
        noteLat: 'muteTriangle',
        noteRus: 'muteTriangle',
    },
    'openTriangle': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.openTriangle,
        noteLat: 'openTriangle',
        noteRus: 'openCuica',
    },
    'nil': {
        octave: 'drum',
        volume: 0.5,
        instrCode: Drums.nil,
        noteLat: 'nil',
        noteRus: 'nil',
    },
};

export const drumKeysLeft = {
    /**/
    KeyX: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 35, // бочка
        noteLat: 'bd',
        noteRus: 'бб',
    },
    KeyZ: {},
    ShiftLeft: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 40, // малый барабан
        noteLat: 'sn',
        noteRus: 'мб',
    },
    /**/
    KeyS: {},
    KeyA: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 43, // том низкий 41 43 lowTom
        noteLat: 'tl',
        noteRus: 'тн',
    },
    CapsLock: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 44, // хэт закрытый
        noteLat: 'hp',
        noteRus: 'хп',
    },
    /**/
    KeyW: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 40, // малый барабан
        noteLat: 'sn',
        noteRus: 'мб',
    },
    KeyQ: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 47, // том средний   midTom1: 45 47
        noteLat: 'tm',
        noteRus: 'тс',
    },
    Tab: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 42, // хэт закрытый
        noteLat: 'hc',
        noteRus: 'хз',
    },
    /**/
    Digit2: {},
    // 1qaz
    // lowTom 41 43 midTom1: 45 47 highTom: 50 48
    Digit1: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 48, // том высокий highTom: 50 48
        noteLat: 'th',
        noteRus: 'тв',
    },
    Backquote: {
        octave: 'drum',
        volume: 0.5,
        instrCode: 46, // хэт открытый
        noteLat: 'ho',
        noteRus: 'хо',
    },
};

export const drumKeysRight = {
    ShiftRight: {...drumInfo.snare2},
    Slash: { ...drumInfo.hiHatClosed },
    Period: {...drumInfo.bassDrum2},
    // old
    // ShiftRight: {...drumInfo.bassDrum2}, // Бочка
    // Semicolon: {...drumInfo.snare2},     // Малый барабан
    // Quote: {...drumInfo.lowTom2},        // Том низкий
    // BracketLeft: {...drumInfo.midTom2},  // Том средний
    // KeyP: {...drumInfo.highTom2},        // Том высокий
    // KeyO: { ...drumInfo.hiHatOpened },   // Хэт октрытый
    // KeyL: { ...drumInfo.hiHatClosed },   // Хэт закрытый
    // Period: { ...drumInfo.hiHatPedal },  // Хэт педаль
    // Minus: { ...drumInfo.rideCymbal2 }, // Тарелка малая ???
    // Digit0: { ...drumInfo.crashCymbal2 }, // Тарелка большая ???
};

export const offsetFotNoteStep = {
    s: -5,
    z: -4,
    l: -3,
    k: -2,
    b: -1,
    d: 0,
    t: 1,
    r: 2,
    n: 3,
    m: 4,
    f: 5,
    v: 6,
}
