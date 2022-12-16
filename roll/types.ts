declare class ResizeObserver {
  constructor(...args: any[]);

  public observe(element: HTMLElement, options?: any): any;
}

export interface TimeSignature {
  upper: number;
  lower: number;
}

export interface Range {
  start: number;
  end: number;
}

export interface Colors {
  background: string;
  backgroundAlternate: string;
  backgroundBlackKey: string;
  strokeLight: string;
  strokeDark: string;
  text: string;
  velocityHandle: string;
  velocityHandleSelected: string;
  whiteKey: string;
  blackKey: string;
  noteHigh: string;
  noteLowBlend: string;
  noteOutline: string;
  noteOutlineSelected: string;
  draggableBorder: string;
  draggableBorderHover: string;
  lassoBackground: string;
  lassoOutline: string;
}

export interface Note {
  time: number;
  pitch: number;
  duration: number;
  velocity: number;

  tempDuration: number;
  hidden: boolean;
  selected: boolean;

  initialStart: number;
  initialVelocity: number;
}
