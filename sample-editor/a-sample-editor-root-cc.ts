import { CanvasComponent } from '../common/canvas/canvas-component';
import { EventEmitter } from '../common/event-emitter';

import { SequencerDisplayModel } from './types';
import { DraggableBorder } from './draggable-border';
import { WaveFormComponent } from './a-wave-form-component';
import { PitchRuler } from './pitch-ruler';
import { TimeRuler } from './time-ruler';
import { TimeRulerMy } from './time-ruler-my';
import { VelocityRuler } from './velocity-ruler';
import { VelocityTrack } from './velocity-track';

function getLayout() {
    return {
        type: 'col',
        items: [
            //{ type: 'row', name: '_timeRuler',   h: 'timeRulerHeight', component: TimeRuler },
            { type: 'row', name: '_timeRulerMy', h: 'timeRulerHeight', component: TimeRulerMy },
            { type: 'row', name: null,           h: 'gridNoteHeight',  component: null,
                items: [
                    { type: 'col', name: '_pitchRuler', w: 'leftSideWidth', component: PitchRuler },
                    { type: 'col', name: '_noteGrid',   w: 'rightSideWidth',  component: WaveFormComponent },
                ]
            },
            { type: 'row', name: '_draggableBorder', h: 'dividerHeight',  component: DraggableBorder },
            { type: 'row', name: null ,              h: 'velocityHeight', component: null,
                items: [
                    { type: 'col', name: '_velocityRuler', w: 'leftSideWidth',  component: VelocityRuler },
                    { type: 'col', name: '_velocityTrack', w: 'rightSideWidth', component: VelocityTrack },
                ]
            },
        ],
        refs: {

        },
        vals: {
            timeRulerHeight: 40,
            leftSideWidth: 40,
            rightSideWidth: `- leftSideWidth`,
            gridNoteHeight: '- timeRulerHeight - timeRulerHeight - velocityHeight - dividerHeight',
            velocityHeight: 50,
            dividerHeight: 4,
        }
    }
}

export class SampleEditorRootCc extends CanvasComponent {
    private readonly _noteGrid: WaveFormComponent;
    private readonly _pitchRuler: PitchRuler;
    private readonly _timeRuler: TimeRuler;
    private readonly _timeRulerMy: TimeRulerMy;
    private readonly _velocityRuler: VelocityRuler;
    private readonly _draggableBorder: DraggableBorder;
    private readonly _velocityTrack: VelocityTrack;

    private draggableBorderPosition: number;
    private layout: any;

    constructor(
        public readonly model: SequencerDisplayModel,
        public readonly ee: EventEmitter,
    ) {
        super();
        this.buildLayout();

        ee.on('repaint', null, () => this.repaint());

        // const context = {
        //     model: () => this.model,
        //     borderDragged: (newPosition: number) => this.borderDragged(newPosition),
        //     grid: () => this._noteGrid,
        // }
        //
        // this._noteGrid = new NoteGridComponent(context);
        // this.addAndMakeVisible(this._noteGrid);
        //
        // this._pitchRuler = new PitchRuler(context);
        // this.addAndMakeVisible(this._pitchRuler);
        //
        // this._timeRuler = new TimeRuler(context);
        // this.addAndMakeVisible(this._timeRuler);
        //
        // this._timeRulerMy = new TimeRulerMy(context);
        // this.addAndMakeVisible(this._timeRulerMy);
        //
        // this._velocityRuler = new VelocityRuler(context);
        // this.addAndMakeVisible(this._velocityRuler);
        //
        // this._draggableBorder = new DraggableBorder(context);
        // this.addAndMakeVisible(this._draggableBorder);
        //
        // this._velocityTrack = new VelocityTrack(context);
        // this.addAndMakeVisible(this._velocityTrack);
    }

    public resized(): void {
        if (this.model.velocityTrackHeight == null) {
            this.draggableBorderPosition = this.height - 50;
        } else if (this.model.velocityTrackHeight < 0) {
            this.draggableBorderPosition = this.height - 50;
            // this.draggableBorderPosition =
            //     this.height * (1 + this.model.velocityTrackHeight);
        }

        const rulerWidth = 40;
        const rulerHeight = 40;
        const velocityHeight = this.height - this.draggableBorderPosition;
        const borderHeight = 4;

        const bounds = this.getLocalBounds();

        const velocityBounds = bounds.removeFromBottom(velocityHeight);
        this._velocityRuler.setBounds(velocityBounds.removeFromLeft(rulerWidth));
        this._velocityTrack.setBounds(velocityBounds);

        this._draggableBorder.setBounds(bounds.removeFromBottom(borderHeight));

        //let hRulerBounds = bounds.removeFromTop(rulerHeight);
        //hRulerBounds.removeFromLeft(rulerWidth);
        //this._timeRuler.setBounds(hRulerBounds);

        // jjkl
        let hRulerBoundsMy = bounds.removeFromTop(rulerHeight);
        hRulerBoundsMy.removeFromLeft(rulerWidth);
        this._timeRulerMy.setBounds(hRulerBoundsMy);

        this._pitchRuler.setBounds(bounds.removeFromLeft(rulerWidth));

        this._noteGrid.setBounds(bounds);

        this.repaint();

        this.resized2(); // jjkl
    }

    public render(g: CanvasRenderingContext2D): void {
        g.fillStyle = this.model.colors.background;
        g.fillRect(0, 0, this.width, this.height);
    }

    public borderDragged(newPosition: number): void {
        this.draggableBorderPosition = Math.max(
            200,
            Math.min(newPosition - this.getPosition().y, this.height)
        );

        const snapThreshold = 50;

        if (this.draggableBorderPosition > this.height - snapThreshold) {
            this.draggableBorderPosition =
                this.draggableBorderPosition > this.height - snapThreshold / 2
                    ? this.height
                    : this.height - snapThreshold;
        }

        this.model.velocityTrackHeight = this.height - this.draggableBorderPosition;
        this.layout.vals.velocityHeight = this.model.velocityTrackHeight;

        //console.log('velocityTrackHeight', this.model.velocityTrackHeight);
        //console.log(this.layout.vals);

        this.resized();
    }

    public setTimeStart(numberValue: number): number {
        //console.log('setTimerStart', numberValue);

        const newValue = Math.max(0, numberValue);

        const offset = newValue - this.model.maxTimeRange.start;

        if (offset === 0) {
            return 0;
        }

        this.model.maxTimeRange.start += offset;
        this.model.maxTimeRange.end += offset;

        // Adapt visible range by translating to the left or to the right if needed

        const leftExcess =
            this.model.maxTimeRange.start - this.model.visibleTimeRange.start;

        if (leftExcess > 0) {
            this.model.visibleTimeRange.start += leftExcess;
            this.model.visibleTimeRange.end += leftExcess;
        }

        const rightExcess =
            this.model.maxTimeRange.end - this.model.visibleTimeRange.end;

        if (rightExcess < 0) {
            this.model.visibleTimeRange.start += rightExcess;
            this.model.visibleTimeRange.end += rightExcess;
        }

        this.repaint();

        return newValue;
    }

    public setDuration(numberValue: number): number {
        //console.log('setDuration', numberValue);
        const m = this.model;
        numberValue = Math.max(0, numberValue);

        m.maxTimeRange.end = m.maxTimeRange.start + numberValue;
        m.visibleTimeRange.end = Math.min(m.visibleTimeRange.end, m.maxTimeRange.end);
        this.repaint();

        return numberValue;
    }

    public setAtomInQuarter(val: number = 12): number {
        this.model.measure.atomInQuarter = val;
        this.repaint();
        return val;
    }

    buildLayout() {
        const context = {
            model: () => this.model,
            borderDragged: (newPosition: number) => this.borderDragged(newPosition),
            grid: () => this._noteGrid,
            ee: this.ee,
        }

        this.layout = getLayout();

        const handleItems = (items: any[]) => {
            items.forEach(item => {
                if (item.component && item.name) {
                    const component = new item.component(context);
                    //layout.refs[item.name] = new item.component(context);
                    this.addAndMakeVisible(component);
                    this[item.name] = component;
                }

                if (Array.isArray(item.items)) {
                    handleItems(item.items);
                }
            })
        }

        handleItems(this.layout.items);
    }

    resized2() {
        // const bounds = this.getLocalBounds();
        // const layout = getLayout();
        // const vals = layout?.vals || {};
        //
        // let heightRest = bounds.height;
        // let widthRest = bounds.width;
        //
        // function getValue(val: any): number {
        //     if (typeof val === 'number') {
        //         return val;
        //     }
        //
        //     val = vals[val];
        //
        //     if (typeof val === 'number') {
        //         return val;
        //     }
        //
        //     return 0;
        // }
        //
        // const handleItems = (items: any[]) => {
        //     items.forEach(item => {
        //         if (item.type === 'row' && item.h) {
        //             heightRest = heightRest - getValue(item.h);
        //             //console.log('ROW',getValue(item.h), item);
        //         }
        //
        //         if (item.type === 'col' && item.w) {
        //             widthRest = widthRest - getValue(item.w);
        //             //console.log('COL',getValue(item.w), item);
        //         }
        //
        //
        //         // if (item.component && item.name) {
        //         //     const component = new item.component(context);
        //         //     layout.refs[item.name] = new item.component(context);
        //         //     this.addAndMakeVisible(component);
        //         //     this[item.name] = component;
        //         // }
        //
        //         if (Array.isArray(item.items)) {
        //             handleItems(item.items);
        //         }
        //     })
        // }
        //
        // handleItems(layout.items);
        //
        // console.log('W', widthRest, 'H', heightRest);
        // console.log('bounds', bounds);
        //
        // // if (this.model.velocityTrackHeight == null) {
        // //     this.draggableBorderPosition = this.height - 80;
        // // } else if (this.model.velocityTrackHeight < 0) {
        // //     this.draggableBorderPosition =
        // //         this.height * (1 + this.model.velocityTrackHeight);
        // // }
        // //
        // // const rulerWidth = 40;
        // // const rulerHeight = 40;
        // // const velocityHeight = this.height - this.draggableBorderPosition;
        // // const borderHeight = 4;
        // //
        // // const velocityBounds = bounds.removeFromBottom(velocityHeight);
        // // this._velocityRuler.setBounds(velocityBounds.removeFromLeft(rulerWidth));
        // // this._velocityTrack.setBounds(velocityBounds);
        // //
        // // this._draggableBorder.setBounds(bounds.removeFromBottom(borderHeight));
        // //
        // // let hRulerBounds = bounds.removeFromTop(rulerHeight);
        // // hRulerBounds.removeFromLeft(rulerWidth);
        // // this._timeRuler.setBounds(hRulerBounds);
        // //
        // // // jjkl
        // // let hRulerBoundsMy = bounds.removeFromTop(rulerHeight);
        // // hRulerBoundsMy.removeFromLeft(rulerWidth);
        // // this._timeRulerMy.setBounds(hRulerBoundsMy);
        // //
        // // this._pitchRuler.setBounds(bounds.removeFromLeft(rulerWidth));
        // //
        // // this._noteGrid.setBounds(bounds);
        // //
        // // this.repaint();
    }
}
