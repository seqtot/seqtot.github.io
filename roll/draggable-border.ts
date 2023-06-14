import { SequencerDisplayModel } from './types';
import { CanvasComponent, ComponentMouseEvent } from '../libs/common/canvas/canvas-component';

export class DraggableBorder extends CanvasComponent {
  private initialPosition: number;

  constructor(
    private readonly context: {
      model: ()=> SequencerDisplayModel,
      borderDragged(position: number)
    }
  ) {
    super();
    this.mouseCursor = 'ns-resize';
  }

  public mousePressed(event: ComponentMouseEvent): void {
    this.initialPosition = event.position.y;
  }

  public mouseDragged(event: ComponentMouseEvent): void {
    const newPosition =
      this.initialPosition + (event.position.y - event.positionAtMouseDown.y);
    this.context.borderDragged(newPosition);
  }

  public mouseEnter(event: ComponentMouseEvent): void {
    super.mouseEnter(event);
    this.repaint();
  }

  public mouseExit(event: ComponentMouseEvent): void {
    super.mouseExit(event);
    this.repaint();
  }

  protected render(g: CanvasRenderingContext2D): void {
    const m = this.context.model();

    g.fillStyle = this.hovered
      ? m.colors.draggableBorderHover
      : m.colors.draggableBorder;
    g.fillRect(0, 0, this.width, this.height);
  }

  protected resized(): void {}
}
