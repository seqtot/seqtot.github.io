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

export const MAX_PITCH: number = 127;
export const MAX_VELOCITY: number = 127;
export const MIN_SEMI_H: number = 4;
export const MAX_SEMI_H: number = 30;
export const PITCH_PATTERN: number[] = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
export const MIN_PITCH: number = 0;
