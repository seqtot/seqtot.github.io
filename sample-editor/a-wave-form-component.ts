import {EventEmitter} from '../common/event-emitter';
import { CanvasComponent, ComponentMouseEvent } from '../common/canvas/canvas-component';
import { Rector, IPoint } from '../common/canvas/types';

import { SequencerDisplayModel } from './types';
import { LassoSelector } from './lasso-selector';
import { SelectedItemSet } from './selected-item-set';
import { Note } from './types';

interface NotePosition {
    atomInd: number;
    pitch: number;
}

type DragAction = 'V_RIGHT' | 'MOVE_NOTE' | 'RIGHT' | 'LEFT' | 'NONE';

export class WaveFormComponent extends CanvasComponent {
    // TODO: move into model or utility
    private get model(): SequencerDisplayModel {
        return this.context.model();
    }

    public readonly adaptiveRatios: number[] = [1, 0.5, 0.25, 0.1, 0.05];
    public adaptiveIndex: number = 3;
    public fixedIncrements: number[] = [128, 64, 32, 16, 8, 4, 2, 1, 0.5];
    public fixedIndex: number = 5;

    private readonly _selectedSet: SelectedItemSet<Note>;
    private readonly _lasso: LassoSelector<Note>;
    private audioBuffer: AudioBuffer;
    private rawData: number[] = [];
    private maxRawDataValue: number = 0;
    private minRawDataValue: number = 0;

    constructor(private readonly context: {
        model: ()=> SequencerDisplayModel,
        ee: EventEmitter,
    }) {
        super();

        this._selectedSet = new SelectedItemSet<Note>();
        this._lasso = new LassoSelector<Note>({
            owner: this,
            selectedSet: () => this._selectedSet,
            colors: () => context.model().colors,
        });

        this._lasso.findAllElementsInLasso = (lassoBounds: Rector) => {
            return this.notes.filter((note) => {
                const noteBounds = {
                    x: this.getPositionForTime(note.atomInd),
                    y: this.getPositionForPitch(note.pitch),
                    width: Math.max(2, note.duration * this.getAtomWidth()),
                    height: this.getSemitoneHeight(),
                };

                return CanvasComponent.boundsIntersect(noteBounds, lassoBounds);
            });
        };

        context.ee.on('data', null, (data) => {
            const rawData = [];
            this.audioBuffer = data.audioBuffer
            const channelData = this.audioBuffer.getChannelData(0);

            for (let i = 0; i<channelData.length; i++) {
                rawData[i] = channelData[i];
            }
            this.rawData = rawData;
            this.maxRawDataValue = Math.max(...rawData);
            this.minRawDataValue = Math.min(...rawData);

            //console.log('rawDAta', rawData);
            //this.rawData = this.audioBuffer.getChannelData(0).map(item => item);
            //console.log('fff', this.rawData.length, this.rawData.filter(item => (item < 0)));
        })
    }

    public get notes(): Note[] {
        return this.model.data.notes;
    }

    public get selectedSet(): SelectedItemSet<Note> {
        return this._selectedSet;
    }

    public filterAudioDataPos(rawData: number[], blockSize = 48): number[] {
        //const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
        //console.log('rawData.length', rawData.length, 'audioBuffer.length');

        //const samples = Math.round(audioBuffer.duration * 1000 * 5);
        //const samples = 48; // Number of samples we want to have in our final data set
        //const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision

        const samples = Math.floor(rawData.length / blockSize);
        //console.log('blockSize', blockSize);

        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i; // the location of the first sample in the block
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
                //sum += rawData[blockStart + j]; // find the sum of all the samples in the block
            }
            filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
        }

        return filteredData;
    }

    public filterAudioDataNeg(rawData: number[], blockSize = 48): number[] {
        const samples = Math.floor(rawData.length / blockSize);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            let blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum += rawData[blockStart + j];
            }
            filteredData.push(sum / blockSize);
        }

        return filteredData;
    }

    midData = {
        areaWidth: 0,
        maxBlockCount: 0,
        rightSideBlockCount: 0,
        topDataInd: 0,
        leftDataInd: 0,
        highlightStart: 0,
        data: [] as number[],
    };

    public renderMid(g: CanvasRenderingContext2D, pHeight = 150, pOffsetY = 150 ) {
        const sidePadding = this.sidePadding;
        const topBlockSize = this.topBlockSize;

        let areaWidth = this.width - (sidePadding * 2);
        let maxBlockCount = Math.floor(areaWidth / topBlockSize);
        let rightSideBlockCount = Math.floor(maxBlockCount/2);
        const topDataInd = this.xInTopArea * this.topBlockSize;
        let leftDataInd = topDataInd - (rightSideBlockCount * topBlockSize); // - topBlockSize
        let highlightStart = 0;

        leftDataInd = leftDataInd > 0 ? leftDataInd : 0;

        if (leftDataInd) {
            highlightStart = sidePadding + (rightSideBlockCount * topBlockSize);
        } else {
            highlightStart = sidePadding + topDataInd;
        }

        let filteredAudioData = this.rawData.slice(leftDataInd, leftDataInd+areaWidth+1);
        filteredAudioData = this.filterAudioDataNeg(filteredAudioData, 1);
        const data = this.normalizeAudioData(filteredAudioData, this.maxRawDataValue, this.minRawDataValue);
        const height = pHeight - (sidePadding * 2);
        const zeroY = pOffsetY + height + sidePadding;
        const zeroX = sidePadding + 1;

        g.lineWidth = 1;
        let y = zeroY;

        for (let i = 0; i<data.length; i++) {
            let val = data[i];

            g.strokeStyle = 'rgba(0, 255, 0, 1)';

            if (val < 0) {
                g.strokeStyle = 'rgba(255, 0, 0, 1)';
                val = val * -1;
            }

            g.beginPath();
            g.moveTo(zeroX+i, zeroY);
            y = zeroY - (val * height);
            g.lineTo(zeroX+i, y);
            g.stroke();

            // if (val < 0.02) {
            //     g.beginPath();
            //     g.moveTo(zeroX+i, zeroY+(sidePadding/2));
            //     g.lineTo(zeroX+i, zeroY+sidePadding);
            //     g.stroke();
            // }
        }

        // y0
        g.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        g.beginPath();
        g.moveTo(10, pOffsetY);
        g.lineTo(10, pOffsetY + pHeight);
        g.stroke();

        // середина
        // if (leftInd) {
        //     g.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        //     g.beginPath();
        //     g.moveTo(half + this.sidePadding, pOffsetY);
        //     g.lineTo(half + this.sidePadding, pOffsetY + pHeight);
        //     g.stroke();
        // }

        for (let i = 0; i< maxBlockCount; i++) {
            g.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            if (i%2) {
                g.strokeStyle = 'rgba(0, 0, 0, 0.7)';
            }
            g.beginPath();
            g.moveTo(sidePadding + (i*topBlockSize), zeroY);
            g.lineTo(sidePadding + (i*topBlockSize) + topBlockSize, zeroY);
            g.stroke();
        }

        g.fillStyle = 'rgba(0, 0, 0, 0.1)';
        g.fillRect(highlightStart, pOffsetY + this.sidePadding, this.topBlockSize, height );

        this.midData = {
            areaWidth,
            maxBlockCount,
            rightSideBlockCount,
            topDataInd,
            leftDataInd,
            highlightStart,
            data,
        }
    }


    public normalizeAudioData(arr: number[], max: number, min: number): number[] {
        const rate = 1 / Math.max(Math.abs(max), Math.abs(min));;
        return arr.map(item => item * rate);
    }

    topBlockSize = 48;
    sidePadding = 10;
    topData: number[] = [];

    public renderTop(g: CanvasRenderingContext2D, pHeight = 150, pOffsetY = 0 ) {
        const sidePadding = this.sidePadding;

        this.topBlockSize = Math.ceil(this.audioBuffer.length / (this.width - (sidePadding * 2)));
        const data = this.normalizeAudioData(
            this.filterAudioDataNeg(this.rawData, this.topBlockSize), this.maxRawDataValue, this.minRawDataValue
        );
        this.topData = data;

        const height = pHeight - (sidePadding * 2);
        const zeroY = pHeight - sidePadding; //const zeroY = Math.ceil(pHeight / 2);
        const zeroX = sidePadding + 1;
        let y = zeroY;

        g.lineWidth = 1;

        const positiveStyle = 'rgba(0, 255, 0, 1)';
        const negativeStyle = 'rgba(255, 0, 0, 1)';

        for (let i = 0; i<data.length; i++) {
            let val = data[i];
            let style = positiveStyle;

            if (val < 0) {
                style = negativeStyle;
                val = val * -1;
            }

            g.strokeStyle = style;
            g.beginPath();
            g.moveTo(zeroX+i, zeroY);
            y = zeroY - (val * height);
            g.lineTo(zeroX+i, y);
            g.stroke();

            // y = zeroY - (val * height);
            // g.fillStyle = style;
            // g.fillRect(zeroX+i, y, 1, zeroY - y);

            // if (val < 0.02) {
            //     g.beginPath();
            //     g.moveTo(zeroX+i, zeroY+(sidePadding/2));
            //     g.lineTo(zeroX+i, zeroY+sidePadding);
            //     g.stroke();
            // }
        }

        // ось x
        g.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        g.beginPath();
        g.moveTo(0, zeroY);
        g.lineTo(this.width, zeroY);
        g.stroke();

        // x0
        g.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        g.beginPath();
        g.moveTo(zeroX-1, pOffsetY);
        g.lineTo(zeroX-1, pOffsetY + pHeight);
        g.stroke();

        g.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        g.beginPath();
        g.moveTo(zeroX + this.xInTopArea, zeroY);
        g.lineTo(zeroX + this.xInTopArea, zeroY - height);
        g.stroke();

        // //console.log('BOUNDS', this.getLocalBounds());
        // // https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/
        //
        // console.log('chaneldata', Math.max(...audioBuffer.getChannelData(0)));
        // console.log('chaneldata', Math.min(...audioBuffer.getChannelData(0)));
        //
        // //getChannelData(0);
        //var source = ctx.createBufferSource();
        // // устанавливает буфер в AudioBufferSourceNode
        //source.buffer = audioBuffer;
        // // присоединяет AudioBufferSourceNode к
        // // destination, чтобы мы могли слышать звук
        //source.connect(ctx.destination);
        // // Начать воспроизведение с источника
        //source.start();
    }

    private topHeight = 150;
    private midHeight = 150;

    public render(g: CanvasRenderingContext2D): void {
        if (!this.audioBuffer) {
            return;
        }

        this.renderTop(g, this.topHeight);
        this.renderMid(g, this.midHeight, this.topHeight);

        // Background
        // g.fillStyle = this.model.colors.background;
        // g.fillRect(0, 0, this.width, this.height);
        //
        // // Horizontal
        // const hMin = this.model.visibleTimeRange.start;
        // const hMax = this.model.visibleTimeRange.end;
        // const atomWidth = this.getAtomWidth();
        //
        // this.drawHorizontalBackground(g, atomWidth, hMin, hMax);
        //
        // // Vertical
        // const start = this.model.verticalRange.start;
        // const end = this.model.verticalRange.end;
        // const semiHeight = this.getSemitoneHeight();
        //
        // if (semiHeight > MIN_SEMI_H) {
        //   this.model.theme.drawSemiTonePattern(
        //     g,
        //     this.width,
        //     this.height,
        //     start,
        //     end,
        //     semiHeight,
        //     this.model.colors
        //   );
        // } else {
        //   this.model.theme.drawOctaveLines(
        //     g,
        //     this.width,
        //     this.height,
        //     start,
        //     end,
        //     semiHeight,
        //     this.model.colors
        //   );
        // }
        //
        // this._lasso.drawLasso(g);
        //
        // this.drawNotes(g, semiHeight, atomWidth);
    }

    public resized(): void {
        this.repaint();
    }

    //===============================================================================
    public moveNoteToFront(note: Note): void {
        const idx = this.notes.indexOf(note);

        if (idx >= 0) {
            this.notes.splice(idx, 1);
            this.notes.push(note);
            this.getParentComponent().repaint();
        }
    }

    //===============================================================================

    public getAtomWidth(): number {
        return (
            this.width /
            (this.model.visibleTimeRange.end - this.model.visibleTimeRange.start)
        );
    }

    public getTimeAt(aPos: number, log?: any): number {
        const start = this.model.visibleTimeRange.start;
        const sixteenth = this.getAtomWidth();
        const x = this.getPosition().x;
        let pos = aPos;

        pos -= x; // Local pos
        pos += start * sixteenth; // visible area offset

        if (log) {
            //console.log(this.model.visibleTimeRange.end);
            //console.log('aPos', aPos);
            //console.log('start', start);
            //console.log('x', x);
            //console.log('pos', pos);
            //console.log('sixteenth', sixteenth);
            //console.log('pos/sixteenth', pos/sixteenth);
        }

        return pos / sixteenth;
    }

    public getPitchAt(pos: number): number {
        const start = this.model.verticalRange.start;
        const semi = this.getSemitoneHeight();
        const y = this.getPosition().y;

        pos -= y; // Local position
        pos -= start * semi; // offset for visible area
        pos = this.height - pos; // Inversion
        pos += semi * 0.5; // offset to have the 'note' centred
        return Math.round(pos / semi); // Scaling
    }

    public getPositionForTime(time: number): number {
        const start = this.model.visibleTimeRange.start;
        const end = this.model.visibleTimeRange.end;
        const vRange = end - start;
        const sixteenth = this.width / vRange;

        return (time - start) * sixteenth;
    }

    public getPositionForPitch(pitch: number): number {
        const semiHeight = this.getSemitoneHeight();
        return this.height - (pitch - this.model.verticalRange.start) * semiHeight;
    }

    public getSemitoneHeight(): number {
        return (
            this.height /
            (this.model.verticalRange.end - this.model.verticalRange.start)
        );
    }

    //===============================================================================
    // Mouse event handlers

    xInTopArea: number = 0;

    public topDblClicked(local: IPoint, event: ComponentMouseEvent) {
        //console.log('topDblClicked');

        const x = local.x - this.sidePadding;

        if (x <= 0) {
            return;
        }

        this.xInTopArea = x - 1;
        console.log(this.xInTopArea);
    }

    public midDblClicked(local: IPoint, event: ComponentMouseEvent) {
        const x = local.x - this.sidePadding;

        if (x <= 0) {
            return;
        }

        let dataInd = this.midData.leftDataInd + x - 1;

        const getNearMin = (): number => {
            let startInd = dataInd - 5;
            startInd = startInd > 0 ? startInd: 0;
            const arr = this.rawData.slice(startInd, startInd+10)
            let min = Math.abs(arr[0]);
            let tempIndex = 0;
            for (let i = 0; i<arr.length; i++) {
                const val = Math.abs(arr[i]);
                if (val < min) {
                    min = val;
                    tempIndex = i;
                }
            }

            return startInd + tempIndex;
        }

        const getNearMax = (): number => {
            let startInd = dataInd - 5;
            startInd = startInd > 0 ? startInd: 0;
            const arr = this.rawData.slice(startInd, startInd+10)
            let max = Math.abs(arr[0]);
            let tempIndex = 0;
            for (let i = 0; i<arr.length; i++) {
                const val = Math.abs(arr[i]);
                if (val > max) {
                    max = val;
                    tempIndex = i;
                }
            }
            return startInd + tempIndex;
        }

        // щелчок под осью
        if (local.y > (this.midHeight - this.sidePadding)) {
            this.xInTopArea = Math.floor((dataInd/this.topBlockSize));
            console.log('topMdlClick', this.xInTopArea);
        } else {
            let clickMs = Math.round(dataInd/this.audioBuffer.sampleRate*1000000)/1000000;
            let minMs = Math.round((getNearMin()/this.audioBuffer.sampleRate*1000000))/1000000;
            let maxMs = Math.round((getNearMax()/this.audioBuffer.sampleRate*1000000))/1000000;

            console.log(`click: ${clickMs}  min: ${minMs}  max: ${maxMs}`);

            this.context.ee.emit('clickMinMax', {clickMs, minMs, maxMs});
        }
    }

    public doublePressed(event: ComponentMouseEvent): void {
        //console.log('doublePressed');
        const pos = this.getPosition();

        const local = {
          x: event.position.x - pos.x,
          y: event.position.y - pos.y,
        };

        if (local.y < this.topHeight ) {
            return this.topDblClicked(local, event);
        }

        if (local.y > this.topHeight && local.y < this.topHeight + this.midHeight) {
            local.y = local.y - this.topHeight;
            return this.midDblClicked(local, event);
        }

        // ORIGINAL
        // const pos = this.getPosition();
        //
        // const local = {
        //   x: event.position.x - pos.x,
        //   y: event.position.y - pos.y,
        // };

        // const existingNote = this.findNoteAt(local);
        //
        // if (existingNote != null) {
        //   this.removeNote(existingNote);
        //   return;
        // }
        //
        // const t = this.snapToGrid(this.getTimeAt(event.position.x, 'jjkl'));
        // const p = Math.round(this.getPitchAt(event.position.y));
        // const d = this.getTimeIncrement();
        //
        // //console.log(this.getTimeAt(event.position.x), t);
        //
        // const newNote: Note = {
        //   atomInd: t,
        //   pitch: p,
        //   duration: d,
        //   velocity: this._currentVelocity,
        //   hidden: false,
        //   selected: true,
        //   tempDuration: 0,
        //   initialStart: t,
        //   initialVelocity: this._currentVelocity,
        // };
        //
        // this.notes.push(newNote);
        // this._selectedSet.setUniqueSelection(newNote);
        //
        // this.removeOverlaps(true);
        //
        // // We start dragging the end point of this note and its velocity
        // this._dragAction = 'V_RIGHT';
        // this._draggedItem = newNote;
        //
        // // Trigger callback method
        // // TODO
        // // this.onNoteAdded(newNote);
        //
        // this.getParentComponent().repaint();
        //
        // this.mouseCursor = 'w-resize';
    }

    public mouseMoved(event: ComponentMouseEvent): void {
        // ORIGINAL
        // super.mouseMoved(event);
        //
        // if (event.isDragging) return;
        //
        // const pos = this.getPosition();
        //
        // const local = {
        //     x: event.position.x - pos.x,
        //     y: event.position.y - pos.y,
        // };
        //
        // const existingNote = this.findNoteAt(local);
        //
        // if (existingNote == null) {
        //     this.mouseCursor = 'default';
        //     return;
        // }
        //
        // const action = this.getDragActionForNoteAt(local, existingNote);
        //
        // if (action == 'MOVE_NOTE') {
        //     this.mouseCursor = 'move';
        // } else if (action == 'LEFT') {
        //     this.mouseCursor = 'w-resize';
        // } else if (action == 'RIGHT') {
        //     this.mouseCursor = 'e-resize';
        // } else {
        //     this.mouseCursor = 'default';
        // }
    }

    public mousePressed(event: ComponentMouseEvent): void {
        console.log('mousePressed');

        // ORIGINAL
        // const pos = this.getPosition();
        //
        // const local = {
        //     x: event.position.x - pos.x,
        //     y: event.position.y - pos.y,
        // };
        //
        // const existingNote = this.findNoteAt(local);
        //
        // if (existingNote == null) {
        //     if (!event.modifiers.shift) {
        //         this._selectedSet.deselectAll();
        //     }
        //
        //     this._lasso.beginLasso(event);
        //
        //     this._mouseDownResult = true;
        //
        //     return;
        // }
        //
        // this._mouseDownResult = this._selectedSet.addToSelectionMouseDown(
        //     existingNote,
        //     event.modifiers.shift
        // );
        // this._dragAction = this.getDragActionForNoteAt(local, existingNote);
        // this.setMouseCursor(this._dragAction);
        //
        // this._draggedItem = existingNote;
        // this.moveNoteToFront(existingNote);
    }

    public mouseReleased(event: ComponentMouseEvent): void {
        // this._dragAction = 'NONE';
        // this.setMouseCursor(this._dragAction);
        //
        // this._initialPosition = null;
        // this._initialDuration = null;
        // this._initialStart = null;
        // this._initialVelocity = null;
        //
        // this._lasso.endLasso();
        //
        // // in case a drag would have caused negative durations
        // for (const selected of this._selectedSet.getItems()) {
        //     selected.duration = Math.max(0, selected.duration);
        // }
        //
        // this._selectedSet.addToSelectionMouseUp(
        //     event.wasDragged,
        //     event.modifiers.shift,
        //     this._mouseDownResult
        // );
        //
        // this.removeOverlaps(true);
        //
        // this.notes.forEach((note) => {
        //     note.initialVelocity = note.velocity;
        // });
        //
        // this._draggedItem = null;
    }

    public mouseDragged(event: ComponentMouseEvent): void {
        // if (this._dragAction == 'NONE') {
        //     this._lasso.dragLasso(event);
        // }
        //
        // if (!event.wasDragged || this._dragAction == 'NONE') {
        //     this.getParentComponent().repaint();
        //     return;
        // }
        //
        // if (this._dragAction == 'MOVE_NOTE') {
        //     this.moveSelection(event);
        // } else if (this._dragAction == 'RIGHT' || this._dragAction == 'V_RIGHT') {
        //     this.dragEndPoints(event);
        // } else if (this._dragAction == 'LEFT') {
        //     this.dragStartPoints(event);
        // }
        //
        // if (this._dragAction == 'V_RIGHT') {
        //     this.dragVelocity(event);
        // }
        //
        // this.removeOverlaps(false);
        //
        // this.getParentComponent().repaint();
    }

    //===============================================================================

    public getTimeAsMBS(t: number): number[] {
        const denominator = this.model.measure.atomInQuarter / this.model.measure.lower;
        let b = Math.floor(t / denominator);

        const s = t - b * denominator;
        const m = Math.floor(b / this.model.measure.upper);
        b -= m * this.model.measure.upper;

        return [m, b, s];
    }

    public getStringForTime(time: number, withOriginOne: boolean): string {
        const mbs = this.getTimeAsMBS(time);
        let m = mbs[0];
        let b = mbs[1];
        let s = mbs[2];

        if (withOriginOne) {
            m++;
            b++;
            s++;
        }

        const useSixteenth = s != 1;
        const useBeats = useSixteenth || b != 1;

        return (
            m + (useBeats ? '.' + b : '') + (useSixteenth ? '.' + Math.floor(s) : '')
        );
    }

    // часть четверти
    public getTimeIncrement(): number {
        const sixteenthWidth = this.getAtomWidth();
        let ratio: number;

        if (sixteenthWidth < 0.00001) {
            return null;
        }

        if (this.model.adaptiveMode) {
            const desiredSpacing =
                this.adaptiveRatios[this.adaptiveIndex] * this.width;

            ratio = (this.model.measure.atomInQuarter * this.model.measure.upper) / this.model.measure.lower;

            if (ratio * sixteenthWidth > desiredSpacing) {
                ratio /= this.model.measure.upper;

                while (sixteenthWidth * ratio > desiredSpacing) ratio /= 2;
            } else {
                while (sixteenthWidth * ratio * 2 < desiredSpacing) ratio *= 2;
            }
        } else {
            ratio = this.fixedIncrements[this.fixedIndex];
        }

        //console.log('ration', ratio);

        return 1; // ratio; // 4
    }
}
