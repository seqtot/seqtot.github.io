import { MAX_PITCH } from './const';
import {
  CanvasComponent,
  ComponentMouseEvent,
  IPoint,
  squaredDistance,
} from '../common/canvas';
import { LassoSelector } from './lasso-selector';
import { WaveFormComponent } from './a-wave-form-component';
import { Note, SequencerDisplayModel } from './types';

export class VelocityTrack extends CanvasComponent {
  private readonly handleRadius: number = 3;

  private _draggingHandle: boolean;
  private _mouseDownResult: boolean;
  private _initialVelocity: number;

  private readonly lasso: LassoSelector<Note>;

  constructor(
    private readonly context: {
      model: ()=> SequencerDisplayModel,
      grid: ()=> WaveFormComponent,
    }
  ) {
    super();

    this.lasso = new LassoSelector<Note>({
        owner: this,
        selectedSet: () => context.grid().selectedSet,
        colors: () => context.model().colors,
    });

    this.lasso.findAllElementsInLasso = (lassoBounds) => {
      const vScale = this.height / MAX_PITCH;
      const grid = this.context.grid();

      return grid.notes.filter((note) => {
        const noteBounds = {
          x: grid.getPositionForTime(note.atomInd) - this.handleRadius,
          y: this.height - note.velocity * vScale - this.handleRadius,
          width: this.handleRadius * 2,
          height: this.handleRadius * 2,
        };

        return CanvasComponent.boundsIntersect(noteBounds, lassoBounds);
      });
    };
  }

  public mousePressed(event: ComponentMouseEvent): void {
    const pos = this.getPosition();
    const grid = this.context.grid();

    const local = {
      x: event.position.x - pos.x,
      y: event.position.y - pos.y,
    };

    this._draggingHandle = false;

    const handle = this.findHandleAt(local);

    if (handle == null) {
      if (!event.modifiers.shift) {
        grid.selectedSet.deselectAll();
      }

      this.lasso.beginLasso(event);
      this._mouseDownResult = true;

      return;
    }

    this._initialVelocity = handle.velocity;

    grid.selectedSet.getItems().forEach((note) => {
      note.initialVelocity = note.velocity;
    });

    // handle is actually a reference to the note
    grid.moveNoteToFront(handle);
    this._draggingHandle = true;

    this._mouseDownResult = grid.selectedSet.addToSelectionMouseDown(
      handle,
      event.modifiers.shift
    );
  }

  public mouseDragged(event: ComponentMouseEvent): void {
    if (!event.wasDragged) return;

    if (this._draggingHandle) {
      this.dragSelectedHandles(event);
    } else {
      this.lasso.dragLasso(event);
    }

    this.getParentComponent().repaint();
  }

  public mouseReleased(event: ComponentMouseEvent): void {
    this.lasso.endLasso();
    const grid = this.context.grid();

    grid.selectedSet.addToSelectionMouseUp(
      event.wasDragged,
      event.modifiers.shift,
      this._mouseDownResult
    );

    grid.notes.forEach((note) => {
      note.initialVelocity = note.velocity;
    });

    this.getParentComponent().repaint();
  }

  protected render(g: CanvasRenderingContext2D): void {
    // Background
    const m = this.context.model();
    g.fillStyle = m.colors.background;
    g.fillRect(0, 0, this.width, this.height);

    // Horizontal
    const start = m.visibleTimeRange.start;
    const end = m.visibleTimeRange.end;
    const sixteenth = this.context.grid().getAtomWidth();

    this.drawHorizontalBackground(g, sixteenth, start, end);

    this.lasso.drawLasso(g);

    this.drawVelocityHandles(g);
  }

  protected resized(): void {}

  private drawHorizontalBackground(
    g: CanvasRenderingContext2D,
    sixteenth: number,
    start: number,
    end: number
  ): void {
    const m = this.context.model();
    const incr = this.context.grid().getTimeIncrement();

    if (incr <= 0) {
      return;
    }

    m.theme.drawTimeBackground(
      g,
      this.height,
      sixteenth,
      incr,
      start,
      end,
      m.measure,
      m.colors
    );
  }

  private drawVelocityHandles(g: CanvasRenderingContext2D): void {
    const m = this.context.model();
    const grid = this.context.grid();
    const vScale = this.height / MAX_PITCH;
    const hScale = grid.getAtomWidth();

    for (const note of grid.notes) {
      const x = grid.getPositionForTime(note.atomInd);
      //console.log(note.duration);
      const w = Math.max(0, hScale * (note.tempDuration || note.duration));

      //console.log(x, w);

      if (x + w < -5 || x > this.width + 5) continue;

      m.theme.drawVelocityHandle(
        g,
        x,
        note,
        this.width,
        this.height,
        vScale,
        hScale,
        this.handleRadius,
        m.colors
      );
    }
  }

  private dragSelectedHandles(event: ComponentMouseEvent): void {
    const vScale = this.height / MAX_PITCH;
    const dragOffset = event.position.y - event.positionAtMouseDown.y;

    const scaled = dragOffset / vScale;

    for (const selected of this.context.grid().selectedSet.getItems()) {
      selected.velocity = selected.initialVelocity - scaled;
      selected.velocity = Math.min(MAX_PITCH, Math.max(1, selected.velocity));
    }
  }

  private findHandleAt(pos: IPoint): Note {
    const grid = this.context.grid();
    let vScale = this.height / MAX_PITCH;
    const squaredHitDistance = 64;

    // We need to iterate from end to start to have front most notes first
    for (const note of grid.notes) {
      const x = grid.getPositionForTime(note.atomInd);
      const y = this.height - note.velocity * vScale;

      if (squaredDistance(pos.x, pos.y, x, y) < squaredHitDistance) return note;
    }

    return null;
  }
}
