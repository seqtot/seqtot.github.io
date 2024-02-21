import {drumKeysRight, drumInfo} from './drums';

export const DEFAULT_TONE_INSTR: number = 162;

// # bass 370
// # Acoustic Bass: 366 - 374
// # Electric Bass 378 (finger): 375 - 383
// # Electric Bass 391 (pick): 384 - 392
// # Fretless Bass: 393 - 400
// # Slap Bass 1: 401 - 408
// # Slap Bass 2: 409 - 417
// # Synth Bass 1: 418 - 433
// # Synth Bass 2: 434 - 446

// 706 - asax
// 728 - bsax
// 697 - ssax
// 714 - tsax

// 630 - trombone


export const keysLeftToRightBrassSection = `
# 0-key 1-note 2-volume 3-instrCode
noteDy      ~ды~0.8~638,
noteTy      ~ты~0.8~638,
noteRy      ~ры~0.8~638,
noteNy      ~ны~0.8~638,
noteMy      ~мы~0.8~638,
noteFy      ~фы~0.8~638,
noteVy      ~вы~0.8~638,
noteSy      ~сы~0.8~638,
noteZy      ~зы~0.8~638,
noteLy      ~лы~0.8~638,
noteKy      ~кы~0.8~638,
noteBy      ~бы~0.8~638,

Backquote   ~ду~0.8~638,
Tab         ~ту~0.8~638,
CapsLock    ~ру~0.8~638,
ShiftLeft   ~ну~0.8~638,
Digit1      ~му~0.8~638,
KeyQ        ~фу~0.8~638,
KeyA        ~ву~0.8~638,
KeyZ        ~су~0.8~638,
Digit2      ~зу~0.8~638,
KeyW        ~лу~0.8~638,
KeyS        ~ку~0.8~638,
KeyX        ~бу~0.8~638,
Digit3      ~до~0.8~638,
KeyE        ~то~0.8~638,
KeyD        ~ро~0.8~638,
KeyC        ~но~0.8~638,

Digit4      ~мо~0.3~697,
KeyR        ~фо~0.3~697,
KeyF        ~во~0.3~697,
KeyV        ~со~0.3~697,
Digit5      ~зо~0.3~697,
KeyT        ~ло~0.3~697,
KeyG        ~ко~0.3~697,
KeyB        ~бо~0.3~697,

Digit6      ~да~0.3~714,
KeyY        ~та~0.3~714,
KeyH        ~ра~0.3~714,
KeyN        ~на~0.3~714,
Digit7      ~ма~0.3~714,
KeyU        ~фа~0.3~714,
KeyJ        ~ва~0.3~714,
KeyM        ~са~0.3~714,
Digit8      ~за~0.3~714,
KeyI        ~ла~0.3~714,
KeyK        ~ка~0.3~714,
Comma       ~ба~0.3~714,

Digit9      ~де~0.2~618,
KeyO        ~те~0.2~618,
KeyL        ~ре~0.2~618,
Period      ~не~0.2~618,
Digit0      ~ме~0.2~618,
KeyP        ~фе~0.2~618,
Semicolon   ~ве~0.2~618,
Slash       ~се~0.2~618,
Minus       ~зе~0.2~618,
BracketLeft ~ле~0.2~618,
Quote       ~ке~0.2~618,
ShiftRight  ~бе~0.2~618,

`;

export const keysLeftToRight = `
# 0-key 1-note 2-volume 3-instrCode
noteDy      ~ды~0.5,
noteTy      ~ты~0.5,
noteRy      ~ры~0.5,
noteNy      ~ны~0.5,
noteMy      ~мы~0.5,
noteFy      ~фы~0.5,
noteVy      ~вы~0.5,
noteSy      ~сы~0.5,
noteZy      ~зы~0.5,
noteLy      ~лы~0.5,
noteKy      ~кы~0.5,
noteBy      ~бы~0.5,
Backquote   ~ду~0.5,
Tab         ~ту~0.5,
CapsLock    ~ру~0.5,
ShiftLeft   ~ну~0.5,
Digit1      ~му~0.5,
KeyQ        ~фу~0.5,
KeyA        ~ву~0.5,
KeyZ        ~су~0.5,
Digit2      ~зу~0.5,
KeyW        ~лу~0.5,
KeyS        ~ку~0.5,
KeyX        ~бу~0.5,
Digit3      ~до~0.5,
KeyE        ~то~0.5,
KeyD        ~ро~0.5,
KeyC        ~но~0.5,
Digit4      ~мо~0.5,
KeyR        ~фо~0.5,
KeyF        ~во~0.5,
KeyV        ~со~0.5,
Digit5      ~зо~0.5,
KeyT        ~ло~0.5,
KeyG        ~ко~0.5,
KeyB        ~бо~0.5,
Digit6      ~да~0.5,
KeyY        ~та~0.5,
KeyH        ~ра~0.5,
KeyN        ~на~0.5,
Digit7      ~ма~0.5,
KeyU        ~фа~0.5,
KeyJ        ~ва~0.5,
KeyM        ~са~0.5,
Digit8      ~за~0.5,
KeyI        ~ла~0.5,
KeyK        ~ка~0.5,
Comma       ~ба~0.5,
Digit9      ~де~0.5,
KeyO        ~те~0.5,
KeyL        ~ре~0.5,
Period      ~не~0.5,
Digit0      ~ме~0.5,
KeyP        ~фе~0.5,
Semicolon   ~ве~0.5,
Slash       ~се~0.5,
Minus       ~зе~0.5,
BracketLeft ~ле~0.5,
Quote       ~ке~0.5,
ShiftRight  ~бе~0.5,

Equal        ~ди~0.5,
BracketRight ~ти~0.5,
noteRi       ~ри~0.5,
noteNi       ~ни~0.5,
noteMi       ~ми~0.5,
noteFi       ~фи~0.5,
noteVi       ~ви~0.5,
noteSi       ~си~0.5,
noteZi       ~зи~0.5,
noteLi       ~ли~0.5,
noteKi       ~ки~0.5,
noteBi       ~би~0.5,

`;

export const keysRightToLeft = `
# 0-key 1-note 2-volume 3-instrCode
KeyX        ~де~0.5,
KeyS        ~те~0.5,
KeyW        ~ре~0.5,
Digit2      ~не~0.5,
KeyZ        ~ме~0.5,
KeyA        ~фе~0.5,
KeyQ        ~ве~0.5,
Digit1      ~се~0.5,
ShiftLeft   ~зе~0.5,
CapsLock    ~ле~0.5,
Tab         ~ке~0.5,
Backquote   ~бе~0.5,
KeyB        ~да~0.5,
KeyG        ~та~0.5,
KeyT        ~ра~0.5,
Digit5      ~на~0.5,
KeyV        ~ма~0.5,
KeyF        ~фа~0.5,
KeyR        ~ва~0.5,
Digit4      ~са~0.5,
KeyC        ~за~0.5,
KeyD        ~ла~0.5,
KeyE        ~ка~0.5,
Digit3      ~ба~0.5,
Comma       ~до~0.5,
KeyK        ~то~0.5,
KeyI        ~ро~0.5,
Digit8      ~но~0.5,
KeyM        ~мо~0.5,
KeyJ        ~фо~0.5,
KeyU        ~во~0.5,
Digit7      ~со~0.5,
KeyN        ~зо~0.5,
KeyH        ~ло~0.5,
KeyY        ~ко~0.5,
Digit6      ~бо~0.5,
ShiftRight  ~ду~0.5,
Quote       ~ту~0.5,
BracketLeft ~ру~0.5,
Minus       ~ну~0.5,
Slash       ~му~0.5,
Semicolon   ~фу~0.5,
KeyP        ~ву~0.5,
Digit0      ~су~0.5,
Period      ~зу~0.5,
KeyL        ~лу~0.5,
KeyO        ~ку~0.5,
Digit9      ~бу~0.5,
noteDy      ~ды~0.5,
noteTy      ~ты~0.5,
noteRy      ~ры~0.5,
noteNy      ~ны~0.5,
noteMy      ~мы~0.5,
noteFy      ~фы~0.5,
noteVy      ~вы~0.5,
noteSy      ~сы~0.5,
noteZy      ~зы~0.5,
noteLy      ~лы~0.5,
noteKy      ~кы~0.5,
noteBy      ~бы~0.5,
`;

export function setInstrument(data: string, instrCode?: number): string {
    const arr: string[] = data
        .trim()
        .split('\n')
        .filter((item) => item && !item.startsWith('#'))
        .map((item) => item.trim())
        .map((item) => item.trim().replace(/,$/, ''))
        .map((item) => item + `~${instrCode || DEFAULT_TONE_INSTR}` + ',')
        .join('')
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item && !item.startsWith('#'));

    return arr.join(',');
}

export const drumSettings = {
    keys: keysLeftToRight,
    drums: drumKeysRight,
};

export const defaultSynthSettings = {
    keys: setInstrument(keysLeftToRight, DEFAULT_TONE_INSTR),
    // drums: {
    //     Space: {...drumInfo.bassDrum2}
    // },
};

export const toneAndDrumPlayerSettings = {
    keys: setInstrument(keysLeftToRight, DEFAULT_TONE_INSTR),
    drums: {...drumInfo},
};

export const leftToRightBrassSection = {
    keys: keysLeftToRightBrassSection
}
