'use babel';

export const rightDownKeys = {
    Period: 'Period', Comma: 'Comma', KeyM: 'KeyM', KeyN: 'KeyN',
};

export const rightTopKeys = {
    Equal: 'Equal',   BracketLeft: 'BracketLeft', Semicolon: 'Semicolon', // Period: 'Period',
    Minus: 'Minus',   KeyP: 'KeyP',               KeyL: 'KeyL',           // Comma: 'Comma',
    Digit0: 'Digit0', KeyO: 'KeyO',               KeyK: 'KeyK',           // KeyM: 'KeyM',
    Digit9: 'Digit9', KeyI: 'KeyI',               KeyJ: 'KeyJ',           // KeyN: 'KeyN',
};

export const leftDownKeys = {
    KeyZ: 'KeyZ', KeyX: 'KeyX', KeyC: 'KeyC', KeyV: 'KeyV',
};

export const leftTopKeys = {
    Digit1: 'Digit1', KeyQ: 'KeyQ', KeyA: 'KeyA', // KeyZ: 'KeyZ',
    Digit2: 'Digit2', KeyW: 'KeyW', KeyS: 'KeyS', // KeyX: 'KeyX',
    Digit3: 'Digit3', KeyE: 'KeyE', KeyD: 'KeyD', // KeyC: 'KeyC',
    Digit4: 'Digit4', KeyR: 'KeyR', KeyF: 'KeyF', // KeyV: 'KeyV',
};

export function getAllMusicKeyCodes (): {[key: string]: string} {
    return {
        ...leftTopKeys,
        ...rightTopKeys,
        ...rightDownKeys,
        ...leftDownKeys,
    }
}

export function getRightKeyCodes (): {[key: string]: string} {
    return {
        ...rightTopKeys,
        ...leftDownKeys,
        ...rightDownKeys,
    }
}

export function getLeftKeyCodes (): {[key: string]: string} {
    return {
        ...leftTopKeys,
    }
}

export function getInstrCodesByKeyCodes(): {[key: string]: string} {
    return {
        // left
        Digit1: 'organ',      KeyQ: 'organ',      KeyA: 'organ',      // KeyZ: 'organ',
        Digit2: 'guitar*EDM', KeyW: 'guitar*EDM', KeyS: 'guitar*EDM', // KeyX: 'guitar*EDM',
        Digit3: 'guitar*ED',  KeyE: 'guitar*ED',  KeyD: 'guitar*ED',  // KeyC: 'guitar*ED',
        Digit4: 'guitar*EC',  KeyR: 'guitar*EC',  KeyF: 'guitar*EC',  // KeyV: 'guitar*EC',
        // right
        Equal: 'organ',     BracketLeft: 'organ', Semicolon: 'organ', Period: 'organ',
        Minus: 'harm',      KeyP: 'harm',         KeyL: 'harm',       Comma: 'organ',
        Digit0: 'xlphn',    KeyO: 'xlphn',        KeyK: 'xlphn',      KeyM: 'organ',
        Digit9: 'organ',    KeyI: 'organ',        KeyJ: 'organ',      KeyN: 'organ',
    }
}

// right to left
// BracketRight Quote Slash (Backslash)
// Equal BracketLeft Semicolon Period
// Minus KeyP KeyL Comma
// Digit0 KeyO KeyK KeyM
// Digit9 KeyI KeyJ KeyN
// Digit8 KeyU KeyH KeyB
// Digit7 KeyY KeyG KeyV
// Digit6 KeyT KeyF KeyC
// Digit5 KeyR KeyD KeyX

// left to right
// Backquote Tab CapsLock ShiftLeft
// Digit1 KeyQ KeyA KeyZ
// Digit2 KeyW KeyS KeyX
// Digit3 KeyE KeyD KeyC
// Digit4 KeyR KeyF KeyV
// Digit5 KeyT KeyG KeyB

// NumLock NumpadDivide  NumpadMultiply NumpadSubtract
// Numpad7 Numpad8       Numpad9        NumpadAdd
// Numpad4 Numpad5       Numpad6        ---------
// Numpad1 Numpad2       Numpad3        NumpadEnter
// Numpad0 <<<<<<<       NumpadDecimal  -----------

export const unplayedKeysHash = {
    ArrowUp: 'ArrowUp',
    ArrowLeft: 'ArrowLeft',
    ArrowRight: 'ArrowRight',
    ArrowDown: 'ArrowDown',
    End: 'End',
    Home: 'Home',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Insert: 'Insert',
    Escape: 'Escape',
};

export function skipEvent (evt: KeyboardEvent, result?: boolean): undefined | boolean {
    evt.preventDefault();
    evt.stopPropagation();

    return result;
}

export const testMidiText = `
<out>
simple1@

<simple44@>
-  : 1   2   3   4   :
@hc: xxxxxxxxxxxxxxxx:
@sn:     2       4   :
@bd: 1       3       :

<simple1@>
#    j ._i .*._j i . j ._i .*._j i j |
#    |               |               |
-  : 1   2   3   4   5   6   7   8   :
@hc: x x x x x x x x x x x x x x x x :
@sn:     x  x    x       x  x    x   :
@bd: x  x     xx     x  x     xx   x :

<simple2@>
#    j ._i j j*. i j j_. i ._.*j i .*|
#    |               |               |
-  : 1   2   3   4   5   6   7   8   :
@hc: x x x x x x x x x x x x x x x x :
@sn:     x    x  x       x    x  x  x:
@bd: x  x  x x     x xx     x  x     :

`.trim();
