import { SequencerDisplayModel } from './types';
import { CanvasComponent } from '../libs/common/canvas/canvas-component';

export class VelocityRuler extends CanvasComponent {
  constructor(private readonly context: {model: ()=> SequencerDisplayModel}) {
    super();
  }

  protected render(g: CanvasRenderingContext2D): void {
    const model = this.context.model();

    g.fillStyle = model.colors.background;
    g.fillRect(0, 0, this.width, this.height);

    model.theme.drawVelocityRuler(
      g,
      this.width,
      this.height,
      model.colors
    );
  }

  protected resized(): void {}
}
