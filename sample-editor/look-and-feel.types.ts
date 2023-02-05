import { Colors, Note, MeasureInfo } from './types';

export interface LookAndFeel {
  name: string;

  minSemitoneHeight: number;

  drawTimeBackground(
    g: CanvasRenderingContext2D,
    height: number,
    sixteenth: number,
    incr: number,
    startInd: number,
    endInd: number,
    measure: MeasureInfo,
    colors: Colors
  ): void;

  drawNote(
    g: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    velocity: number,
    selected: boolean,
    colors: Colors
  ): void;

  drawVelocityHandle(
    g: CanvasRenderingContext2D,
    x: number,
    note: Note,
    width: number,
    height: number,
    vScale: number,
    hScale: number,
    handleRadius: number,
    colors: Colors
  ): void;

  drawOctaveLines(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    start: number,
    end: number,
    semiHeight: number,
    colors: Colors
  ): void;

  drawSemiTonePattern(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    start: number,
    end: number,
    semiHeight: number,
    colors: Colors
  ): void;

  drawPianoRoll(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    start: number,
    end: number,
    semiHeight: number,
    colors: Colors
  ): void;

  drawPitchLabels(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    start: number,
    end: number,
    semiHeight: number,
    hoveredPitch: number,
    colors: Colors
  ): void;

  drawPitchRuler(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    start: number,
    end: number,
    semiHeight: number,
    hoveredPitch: number,
    colors: Colors
  ): void;

  isOnPianoRoll(
    x: number,
    y: number,
    width: number,
    height: number,
    semitoneHeight: number
  ): boolean;

  drawVelocityRuler(
    g: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: Colors
  ): void;
}
