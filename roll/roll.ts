import { RootComponentHolder } from './root-component-holder';
import { SequencerRoot } from './sequencer-root';
import { CustomElement } from './custom-element';
import { LookAndFeel } from './look-and-feel.types';
import { LookAndFeel_Default, LookAndFeel_Live } from './look-and-feel';
import { TimeSignature, Range, Colors } from './types';
import { CSS_STYLE } from './const';

export interface SequencerDisplayModel {
  velocityTrackHeight: number;
  zoomSensitivity: number;
  verticalRange: Range;
  visibleTimeRange: Range;
  maxTimeRange: Range;
  quarterCount?: number;

  signature: TimeSignature;
  adaptiveMode: boolean;
  colors: Colors;
  theme: LookAndFeel;
}

const defaultColors: Colors = {
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
  noteOutline: '#60606090',
  noteOutlineSelected: '#00a8ff',
  draggableBorder: '#8f8f8f',
  draggableBorderHover: '#676767',
  lassoBackground: '#00a8ff20',
  lassoOutline: '#00a8ff80',
};

// /**
//  * A canvas-based note sequencer.
//  *
//  * @noInheritDoc
//  */
export class NoteSequencer extends CustomElement {
  public static readonly TIME_START: string = 'time-start';
  public static readonly DURATION: string = 'duration';
  public static readonly THEME: string = 'theme';
  private _shadowRoot: ShadowRoot;
  private _rootHolder: RootComponentHolder<SequencerRoot>;
  private readonly _model: SequencerDisplayModel;
  private readonly _sequencerRoot: SequencerRoot;

  constructor() {
    super();

    const signature: TimeSignature = {
      upper: 3,
      lower: 4,
    };
    const quarterInBar = signature.upper * signature.lower;

    this._model = {
      velocityTrackHeight: -0.3, // -0.3
      verticalRange: { start: 36, end: 72 }, // { start: 60, end: 72 }

      visibleTimeRange: { start: 0, end: quarterInBar }, // { start: 0, end: 16 }
      maxTimeRange: { start: 0, end: quarterInBar * 2 }, // { start: 0, end: 16 }

      // signature: { upper: 3, lower: 4 }, // { upper: 4, lower: 4 } размер
      signature,
      zoomSensitivity: 30, // 30
      adaptiveMode: true, // true
      colors: defaultColors,
      theme: new LookAndFeel_Live(),
    };

    this._shadowRoot = this.attachShadow({ mode: 'closed' });
    this._sequencerRoot = new SequencerRoot(this._model);
    this._rootHolder = new RootComponentHolder<SequencerRoot>(
      100,
      100,
      this._sequencerRoot
    );
    this._shadowRoot.append(this._rootHolder.canvas);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = CSS_STYLE;
    this._shadowRoot.append(styleElement);
    // Events handlers
    const resizeObserver = new ResizeObserver(() => this.resizeAndDraw());
    resizeObserver.observe(this);
    const styleObserver = new MutationObserver(() => {
      this.styleChanged();
    });
    styleObserver.observe(this, { attributes: true });
    Object.keys(this._model.colors).forEach((key) => {
      this.registerCustomColor(key, this._model.colors[key]);
    });
  }
  /**
   * HTML tag name used for this element.
   */
  public static get tag(): string {
    return 'note-sequencer';
  }
  /**
   * Observed HTML attributes (custom element implementation).
   */
  public static get observedAttributes(): string[] {
    return [NoteSequencer.TIME_START, 'duration', 'pitch-start', 'pitch-end'];
  }
  public get colors(): Colors {
    return this._model.colors;
  }
  // Attributes/properties reflection
  /**
   * First time value to show.
   */
  public get timeStart(): number {
    return this._model.maxTimeRange.start;
  }
  public set timeStart(value: number) {
    let numberValue: number = Number(value);
    if (isNaN(numberValue)) {
      throw new Error('Unhandled type error when setting timeStart');
    }
    numberValue = this._sequencerRoot.setTimeStart(numberValue);
    this.setAttribute(NoteSequencer.TIME_START, numberValue.toString());
  }
  /**
   * Maximum visible time range from timeStart.
   */
  public get duration(): number {
    return this._model.maxTimeRange.start + this._model.maxTimeRange.end;
  }
  public set duration(newValue: number) {
    let numberValue: number = Number(newValue);
    if (isNaN(numberValue)) {
      throw new Error('Unhandled type error when setting duration');
    }
    numberValue = this._sequencerRoot.setDuration(numberValue);
    this.setAttribute(NoteSequencer.DURATION, numberValue.toString());
  }
  /**
   * Set the current theme. Defaults to 'default'.
   */
  public get theme(): string {
    return this._model.theme.name;
  }
  /**
   * Set the current theme. Defaults to 'default'.
   */
  public set theme(value: string) {
    switch (value) {
      case 'live':
        this._model.theme = new LookAndFeel_Live();
        break;
      case 'default':
      default:
        this._model.theme = new LookAndFeel_Default();
        value = 'default';
        break;
    }
    this.setAttribute(NoteSequencer.THEME, value);
    this.draw();
  }
  // CustomElement implementation
  /**
   * Called when the HTML node is first connected to the DOM (custom element implementation).
   */
  public connectedCallback(): void {
    this._rootHolder.attachMouseEventListeners();
    this.timeStart = this.timeStart || 0;
    this.duration = this.duration || 16;
    this.resizeAndDraw();
  }
  public disconnectedCallback(): void {
    this._rootHolder.removeMouseEventListeners();
  }
  /**
   * Called whenever an observed HTML attribute changes (custom element implementation). Redraws the component.
   */
  public attributeChangedCallback(/* name, oldValue, newValue */): void {
    this.draw();
  }
  public draw(): void {
    this._rootHolder.repaint();
  }
  protected styleChanged(): void {
    super.styleChanged();
    this.customColors.forEach((color) => {
      this._model.colors[color.name] = color.value;
    });
    this.draw();
  }
  private resizeAndDraw(): void {
    const boundingClientRect = this.getBoundingClientRect();
    this._rootHolder.resize(
      Math.ceil(boundingClientRect.width),
      Math.ceil(boundingClientRect.height)
    );
    this.draw();
  }
}
