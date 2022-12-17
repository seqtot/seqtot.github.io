import {Colors} from './types';

export const CSS_STYLE = `
:host {
  position: relative;
  min-width: 200px;
  min-height: 200px;
  width: 100%;
  height: 100%;
  display: inline-block;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
`;

export const MAX_VELOCITY: number = 127;
export const MIN_SEMI_H: number = 4;
export const MAX_SEMI_H: number = 30;
export const PITCH_PATTERN: number[] = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];

export const MIN_PITCH: number = 0;
export const MAX_PITCH: number = 127;

export const defaultColors: Colors = {
    background: '#ffffff',
    backgroundAlternate: '#0000000f',
    backgroundBlackKey: '#00000017', // #00000017
    strokeLight: '#00000020',
    strokeDark: '#00000050', // #00000050
    text: '#000000',
    velocityHandle: '#ff1906',
    velocityHandleSelected: '#00a8ff',
    whiteKey: '#ffffff',
    blackKey: '#5e5e5e', // #5e5e5e
    noteHigh: '#ff1906',
    noteLowBlend: '#d2c263',
    noteOutline: '#ff0000ff', // #60606090'
    noteOutlineSelected: '#00a8ff',
    draggableBorder: '#8f8f8f',
    draggableBorderHover: '#676767',
    lassoBackground: '#00a8ff20',
    lassoOutline: '#00a8ff80',
};
