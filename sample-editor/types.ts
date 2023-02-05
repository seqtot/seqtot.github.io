import {LookAndFeel} from './look-and-feel.types';

declare class ResizeObserver {
  constructor(...args: any[]);

  public observe(element: HTMLElement, options?: any): any;
}

export interface MeasureInfo {
  upper: number;
  lower: number;
  atomInQuarter?: number;
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
  atomInd: number;
  pitch: number;
  duration: number;
  velocity: number;

  tempDuration: number;
  hidden: boolean;
  selected: boolean;

  initialStart: number;
  initialVelocity: number;
}

type Quarter = {
  /**
   * 1    1/2   1/4   1/8   1/16   1/32
   * 480  240   120   60    30     15
   */
  duration: number;
  index: number;
  divider: number;
}

export type NoteData = {
  notes: Note[],
  quarters: Quarter[],
  layers: any[],
  topLayer: any,
  backLayer: any,
}

export interface SequencerDisplayModel {
  velocityTrackHeight: number;
  zoomSensitivity: number;
  verticalRange: Range;

  /**
   * Видимый на текущий момент диапазон, изменяется в процессе масштабирования
   */
  visibleTimeRange: Range;

  /**
   * Задаётся один раз при инициализации
   */
  maxTimeRange: Range;

  quarterCount?: number;

  measure: MeasureInfo;
  adaptiveMode: boolean;
  colors: Colors;
  theme: LookAndFeel;
  data: NoteData;
}
