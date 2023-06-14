import { Range, SequencerDisplayModel } from './types';
import { CanvasComponent, ComponentMouseEvent } from '../libs/common/canvas/canvas-component';
import { WaveFormComponent } from './a-wave-form-component';
import { clamp } from './utils';

let tempWidth = 0;

export class TimeRulerMy extends CanvasComponent {
  private timeAtMouseDown: number;
  private rangeAtMouseDown: Range;
  private zoomAtMouseDown: number;

  constructor(
      private readonly context: {
        model: ()=> SequencerDisplayModel,
        grid: ()=> WaveFormComponent,
      }
  ) {
    super();
  }

  public mousePressed(event: ComponentMouseEvent): void {
    const m = this.context.model();

    this.timeAtMouseDown = this.context.grid().getTimeAt(event.position.x);
    this.rangeAtMouseDown = { ...m.visibleTimeRange };
    this.zoomAtMouseDown =
      (m.maxTimeRange.end - m.maxTimeRange.start) /
      (m.visibleTimeRange.end - m.visibleTimeRange.start);
  }

  public doubleClicked(event: ComponentMouseEvent): void {
    console.log(this.context.grid().notes);

    // this.model.visibleTimeRange.start = 0;
    // this.model.visibleTimeRange.end = this.model.maxTimeRange.end;
    // this.getParentComponent().repaint();
  }

  public mouseDragged(event: ComponentMouseEvent): void {
    const m = this.context.model();
    const dragSensitivity = -0.0015;
    const minimalRange = 1;
    const dragOffsetY = event.positionAtMouseDown.y - event.position.y;
    const toAdd =
      (m.maxTimeRange.end - m.maxTimeRange.start) *
      dragOffsetY *
      dragSensitivity;

    let amountToAdd = toAdd / 2;

    if (!event.modifiers.option) {
      amountToAdd = 0;
    }

    let newStart = this.rangeAtMouseDown.start + amountToAdd;
    let newEnd = this.rangeAtMouseDown.end - amountToAdd;

    // Compute the quantity to remove to ensure the resulting range is above the minimal range
    const excess = Math.max(0, minimalRange - (newEnd - newStart));
    newStart -= excess * 0.5;
    newEnd += excess * 0.5;

    // Pre-apply the new range
    m.visibleTimeRange.start = Math.max(m.maxTimeRange.start, newStart);
    m.visibleTimeRange.end = Math.min(m.maxTimeRange.end, newEnd);

    // Compute the offset to the anchor under the mouse
    let offset = this.timeAtMouseDown - this.context.grid().getTimeAt(event.position.x);

    // Constraint this offset to stay in the maximal range
    const distanceToLeft =
      m.maxTimeRange.start - m.visibleTimeRange.start;
    const distanceToRight = m.visibleTimeRange.end - m.maxTimeRange.end;
    offset = clamp(offset, distanceToLeft, -distanceToRight);

    // Apply the constrained offset
    m.visibleTimeRange.start = Math.max(m.maxTimeRange.start, newStart + offset);
    m.visibleTimeRange.end = Math.min(m.maxTimeRange.end, newEnd + offset);

    this.getParentComponent().repaint();
  }

  protected resized(): void {}

  protected render(g: CanvasRenderingContext2D): void {
    const m = this.context.model();
    const bounds = this.getLocalBounds();

    g.fillStyle = m.colors.background;
    g.fillRect(0, 0, this.width, this.height);

    const start = m.visibleTimeRange.start;
    const end = m.visibleTimeRange.end;
    const atomWidth = this.context.grid().getAtomWidth();

    if (Math.ceil(atomWidth) !== tempWidth) {
      //console.log('tempWidth, quarterWidth: ', tempWidth, atomWidth);
      tempWidth = Math.ceil(atomWidth);
    }

    if (atomWidth < 0.0001 || atomWidth === Infinity) {
      // escape overly intensive calculation or even potential infinite loop
      return;
    }

    const minLabelSpacing = 50;
    const minGraduationSpacing = 5;

    let ratio = 1;

    while (atomWidth * ratio < minLabelSpacing) ratio *= 2;

    let incr = 1;

    if (atomWidth * incr < minGraduationSpacing) {
      while (atomWidth * incr < minGraduationSpacing) incr *= 2;
    } else {
      while (atomWidth * incr * 0.5 > minGraduationSpacing) incr *= 0.5;
    }

    for (let i = 0; i < Math.ceil(end); i += incr) {
      const x = (i - start) * atomWidth;

      if (x < 0) continue;

      const gradH = i % (incr * 4) == 0 ? 0.4 : 0.12;

      g.fillStyle = m.colors.strokeLight;
      g.fillRect(x, bounds.height * (1 - gradH), 1, bounds.height * gradH);

      if (i % ratio == 0) {
        g.rect(x + 1, bounds.height * (1 - gradH), 1, 1);

        g.fillStyle = m.colors.text;
        const text = this.context.grid().getStringForTime(i, true);
        g.fillText(text, x + 4, bounds.height - 5, minLabelSpacing);
      }
    }

    // Bottom border
    g.fillStyle = m.colors.strokeDark;
    g.fillRect(0, bounds.height - 1, bounds.width, 1);
    // g.fillRect(0, 5, bounds.width, 1); // my
  }
}
