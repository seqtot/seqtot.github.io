import { Range, SequencerDisplayModel } from './types';
import { CanvasComponent, ComponentMouseEvent } from '../common/canvas/canvas-component';
import { NoteGridComponent } from './note-grid-component';
import { clamp } from './utils';

export class TimeRuler extends CanvasComponent {
  private timeAtMouseDown: number;
  private rangeAtMouseDown: Range;
  private zoomAtMouseDown: number;

  constructor(
    private readonly context: {
      model: ()=> SequencerDisplayModel,
      grid: ()=> NoteGridComponent,
    }
  ) {
    super();
  }

  public mousePressed(event: ComponentMouseEvent): void {
    const model = this.context.model();

    this.timeAtMouseDown = this.context.grid().getTimeAt(event.position.x);
    this.rangeAtMouseDown = { ...model.visibleTimeRange };
    this.zoomAtMouseDown =
      (model.maxTimeRange.end - model.maxTimeRange.start) /
      (model.visibleTimeRange.end - model.visibleTimeRange.start);
  }

  public doubleClicked(event: ComponentMouseEvent): void {
    const model = this.context.model();

    model.visibleTimeRange.start = 0;
    model.visibleTimeRange.end = model.maxTimeRange.end;
    this.getParentComponent().repaint();
  }

  public mouseDragged(event: ComponentMouseEvent): void {
    const dragSensitivity = -0.0015;
    const minimalRange = 1;
    const model = this.context.model();

    const dragOffset = event.positionAtMouseDown.y - event.position.y;
    const toAdd =
      (model.maxTimeRange.end - model.maxTimeRange.start) *
      dragOffset *
      dragSensitivity;
    const amountToAdd = toAdd / 2;

    let newStart = this.rangeAtMouseDown.start + amountToAdd;
    let newEnd = this.rangeAtMouseDown.end - amountToAdd;

    // Compute the quantity to remove to ensure the resulting range is above the minimal range
    const excess = Math.max(0, minimalRange - (newEnd - newStart));
    newStart -= excess * 0.5;
    newEnd += excess * 0.5;

    // Pre-apply the new range
    model.visibleTimeRange.start = Math.max(
      model.maxTimeRange.start,
      newStart
    );
    model.visibleTimeRange.end = Math.min(
      model.maxTimeRange.end,
      newEnd
    );

    // Compute the offset to the anchor under the mouse
    let offset = this.timeAtMouseDown - this.context.grid().getTimeAt(event.position.x);

    // Constraint this offset to stay in the maximal range
    const distanceToLeft = model.maxTimeRange.start - model.visibleTimeRange.start;
    const distanceToRight = model.visibleTimeRange.end - model.maxTimeRange.end;
    offset = clamp(offset, distanceToLeft, -distanceToRight);

    // Apply the constrained offset
    model.visibleTimeRange.start = Math.max(
      model.maxTimeRange.start,
      newStart + offset
    );
    model.visibleTimeRange.end = Math.min(model.maxTimeRange.end, newEnd + offset);

    this.getParentComponent().repaint();
  }

  protected resized(): void {}

  protected render(g: CanvasRenderingContext2D): void {
    const bounds = this.getLocalBounds();
    const model = this.context.model();

    g.fillStyle = model.colors.background;
    g.fillRect(0, 0, this.width, this.height);

    const start = model.visibleTimeRange.start;
    const end = model.visibleTimeRange.end;
    const sixteenth = this.context.grid().getAtomWidth();

    if (sixteenth < 0.0001 || sixteenth === Infinity) {
      // escape overly intensive calculation or even potential infinite loop
      return;
    }

    const minLabelSpacing = 50; // jjkl 50
    const minGraduationSpacing = 5;

    let ratio = 1;

    while (sixteenth * ratio < minLabelSpacing) ratio *= 2;

    let incr = 1;

    if (sixteenth * incr < minGraduationSpacing) {
      while (sixteenth * incr < minGraduationSpacing) incr *= 2;
    } else {
      while (sixteenth * incr * 0.5 > minGraduationSpacing) incr *= 0.5;
    }

    for (let i = 0; i < Math.ceil(end); i += incr) {
      const x = (i - start) * sixteenth;

      if (x < 0) continue;

      const gradH = i % (incr * 4) == 0 ? 0.4 : 0.12;

      g.fillStyle = model.colors.strokeLight;
      g.fillRect(x, bounds.height * (1 - gradH), 1, bounds.height * gradH);

      if (i % ratio == 0) {
        g.rect(x + 1, bounds.height * (1 - gradH), 1, 1);

        g.fillStyle = model.colors.text;
        const text = this.context.grid().getStringForTime(i, true);
        g.fillText(text, x + 4, bounds.height - 5, minLabelSpacing);
      }
    }

    // Bottom border
    g.fillStyle = model.colors.strokeDark;
    g.fillRect(0, bounds.height - 1, bounds.width, 1);
  }
}
