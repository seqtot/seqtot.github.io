import { Muse as m, Sound, TFreqInfo } from '../../libs/muse';

import { getWithDataAttr } from '../../src/utils';
import { WaveSource2 } from './wave-source';
import { RouteInfo } from '../../src/router';

import { colorHash } from './utils';

import { ideService } from '../ide/ide-service';

const bassColors = [colorHash['0'], colorHash['-1'], colorHash['-2'], colorHash['-3'], colorHash['-4'], colorHash['-5'], colorHash['-6'], colorHash['-7'], colorHash['-8'], colorHash['-9'], colorHash['-10'], colorHash['-11'], colorHash['-12']];
const soloColors = [colorHash['0'], colorHash['1'],  colorHash['2'],  colorHash['3'],  colorHash['4'],  colorHash['5'],  colorHash['6'],  colorHash['7'],  colorHash['8'],  colorHash['9'],  colorHash['10'],  colorHash['11'],  colorHash['12']];

type WithId = {id: string}

const outVol = 80;
const freqInfoList = m.const.freqInfoList;

type ColorInfo = {
    mask: string,
    val: number,
    name: string,
    rgb: string,
}

function getPosition(element) {
    let xPosition = 0;
    let yPosition = 0;

    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function getFreqList(freqList: TFreqInfo[], botNote: string, topNote: string): TFreqInfo[] {
    const botCode = freqList.find(item => item.noteLat === botNote).code;
    const topCode = freqList.find(item => item.noteLat === topNote).code;

    let list = freqList
        .filter(item => item.code >= botCode && item.code <= topCode)
        .map(item => ({...item}));

    list.forEach((item, i) => {
        item.relatives = list.map((iItem, i) => iItem.step === item.step ? i : -1).filter(ind => ind > -1);
        item.index = i;
    });

    return  list;
}

type Sizes = {
    width: number,
    height: number,
    boardHeight: number,

    cellSize: number,
    halfSize: number,

    boardSoloWidth: number,
    boardSoloLeft: number,
    boardBassLeft: number,
    boardBassWidth: number,
    boardLeftOffset: number,
    boardTopOffset: number,
};

function getSizes(x: {
    width: number,
    height: number,
    colCount: number,
    rowCount: number,
}): Sizes {
    //console.log(getPosition(this.bassBoard.canvasEl));

    let headerHeight = getWithDataAttr('app-header-first-row-area')[0].clientHeight;

    let width = x.width ; // window.innerWidth;
    let height = x.height - (headerHeight * 2); //window.innerHeight;
    width = width > height? height: width;

    let colWidth = Math.floor(width / (x.colCount + 4));
    colWidth = Math.floor(colWidth / 2) * 2;

    // let boardWidth = pageWidth - 64;
    // let boardHeight = 0;
    let halfSize = colWidth / 2;
    let cellSize = colWidth;

    const boardWidth = width/2;

    let boardSoloWidth = boardWidth;
    let boardBassLeft = 0;
    let boardBassWidth = boardWidth;
    let boardSoloLeft = boardWidth;

    return {
        width: cellSize * (x.colCount + 4),
        height: cellSize * (x.rowCount + 2),
        boardHeight: cellSize * (x.rowCount + 2),
        cellSize,
        halfSize,
        boardSoloWidth,
        boardSoloLeft,
        boardBassLeft,
        boardBassWidth,
        boardLeftOffset: 0,
        boardTopOffset: 0,
    }
}

class Board {
    instrCode = m.DEFAULT_TONE_INSTR;
    isSilent = false;
    lastX = -1;
    lastY = -1;
    lastFreqObj: TFreqInfo;
    lastColorInfo: ColorInfo;
    lastFreqVal = 0;
    lastVolVal = 0;
    lastNote: string = 'do';
    share: {
        note: string,
    };

    sizes: Sizes;
    gutter: number;
    canvasEl: HTMLElement;

    canvasTop: HTMLCanvasElement;
    canvasCtxTop: CanvasRenderingContext2D;

    canvasMid: HTMLCanvasElement;
    canvasCtxMid: CanvasRenderingContext2D;

    canvasBot: HTMLCanvasElement;
    canvasCtxBot: CanvasRenderingContext2D;

    freqList: TFreqInfo[];
    colorList: ColorInfo[];

    wave: WaveSource2;

    isSmoothMode = false;

    constructor(public type: 'bass' | 'solo', public volDirection: 'rightToLeft' | 'leftToRight') {
    }

    clearCanvasTop() {
        this.canvasCtxTop.clearRect(0, 0, this.canvasTop.width, this.canvasTop.height);
    }

    clearCanvasBot() {
        this.canvasCtxBot.clearRect(0, 0, this.canvasBot.width, this.canvasBot.height);
    }

    clearCanvasMid() {
        this.canvasCtxMid.clearRect(0, 0, this.canvasMid.width, this.canvasMid.height);
    }

    drawCells() {
        const cellSize = this.sizes.cellSize;
        const gutter = cellSize;
        const zeroY = cellSize;
        const width = (this.sizes.boardSoloWidth) - cellSize - cellSize;
        const ctx = this.canvasCtxMid;

        this.clearCanvasMid();
        const defStroke = 'rgb(200, 200, 200)';
        //const midStroke = 'rgb(250, 190, 190)';
        const midStroke = defStroke;

        this.colorList.forEach((item, i) => {
            const defFill = `rgb(${item.rgb})`;
            ctx.strokeStyle = defStroke;
            ctx.lineWidth = 1;

            ctx.fillStyle = defFill;
            ctx.fillRect(gutter, zeroY + (i * cellSize), width, cellSize);
        });
    } // drawCells

    setColorList(list: any[]) {
        this.colorList = [...list];
    }

    setFreqList(freqList: TFreqInfo[], botNote: string, topNote: string) {
        freqList = [...freqList];

        const newFreqList = getFreqList(freqList.reverse(), botNote, topNote);

        this.freqList = newFreqList;
    }

    createCanvas(sizes: Sizes, canvasEl: HTMLElement) {
        this.sizes = sizes;
        this.gutter = sizes.cellSize;
        this.canvasEl = canvasEl;

        // BOT TOM
        this.canvasBot = document.createElement('canvas');
        this.canvasBot.style.position = "absolute";
        this.canvasBot.width  = sizes.width;
        this.canvasBot.height = sizes.height;
        // this.canvasEl.style.border   = "1px solid gray";
        this.canvasEl.appendChild(this.canvasBot);
        this.canvasCtxBot = this.canvasBot.getContext("2d");

        // MID CANVAS
        this.canvasMid = document.createElement('canvas');
        this.canvasMid.style.position = "absolute";
        this.canvasMid.width  = sizes.width;
        this.canvasMid.height = sizes.height;
        this.canvasEl.appendChild(this.canvasMid);
        this.canvasCtxMid = this.canvasMid.getContext("2d");

        // TOP CANVAS
        this.canvasTop = document.createElement('canvas');
        this.canvasTop.style.position = "absolute";
        this.canvasTop.width  = sizes.width;
        this.canvasTop.height = sizes.height;
        this.canvasEl.appendChild(this.canvasTop);
        this.canvasCtxTop = this.canvasTop.getContext("2d");
    }

    update(e: PointerEvent, onlyStop = false) {
        if (onlyStop) {
            ideService.synthesizer.playSound({
                id: this.type,
                keyOrNote: this.lastNote,
                instrCode: this.instrCode,
                onlyStop: true,
            });

            this.lastY = -1;
            this.lastX = -1;

            return;
        }

        const sizes = this.sizes;
        const cellSize = sizes.cellSize;
        const gutter = cellSize;
        const halfSize = sizes.halfSize;

        // const offsetX = e.touches[0].clientX - this.sizes.boardLeftOffset;
        // const offsetY = e.touches[0].clientY - this.sizes.boardTopOffset;

        const offsetX = e.offsetX;
        const offsetY = e.offsetY;

        if (offsetX <= gutter ||
            offsetX >= (sizes.boardBassWidth - gutter) ||
            offsetY <= gutter ||
            offsetY >= (sizes.boardHeight - gutter) ||
            this.isSilent
        ) {
            return;
        }

        // // if (e.buttons) {
        // //   canvasCtx.fillStyle = "green";
        // //   canvasCtx.fillRect(CurX, CurY , 1, 1);
        // // }

        let curX = Math.round(offsetX);
        let curY = Math.round(offsetY);
        let changed = false;
        let prevColorInfo = this.lastColorInfo;

        this.lastY = curY;

        const locY = curY - gutter;
        const indY = Math.floor(locY / cellSize);

        if (this.colorList[indY]) {
            this.lastColorInfo = this.colorList[indY];
        }

        //console.log(this.type, indFreq, locY, this.lastColorInfo);
        const note = m.utils.getNoteByOffset(this.share.note, this.lastColorInfo.val);

        if (note) {
            this.lastNote = note;
            this.share.note = note;
            ideService.synthesizer.playSound({
                id: this.type,
                keyOrNote: note,
                instrCode: this.instrCode,
            });
        }

        // if (curX !== this.lastX) {
        //     this.lastX = curX;
        //     changed = true;
        //
        //     let vol = 0;
        //     let lastVolVal = 0;
        //     let freqVol = 0;
        //
        //     if (this.volDirection === 'rightToLeft') {
        //         if (curX <= (gutter + cellSize + cellSize)) {
        //             vol = 100;
        //         }
        //         else if (curX >= (sizes.width - gutter - cellSize - cellSize)) {
        //             vol = 0;
        //         }
        //         else {
        //             const width = sizes.width - (gutter*2) - (cellSize*4);
        //             const locX = curX - gutter - (cellSize*2);
        //             vol = (1 - (locX / width)) * 100;
        //         }
        //
        //         //console.log(outVol, vol, getEndPointVolume(vol) * (outVol/100));
        //         freqVol = this.lastFreqObj ? this.lastFreqObj.volume : 0;
        //     }
        //
        //     if (this.volDirection === 'leftToRight') {
        //         if (curX <= (gutter + cellSize + cellSize)) {
        //             vol = 0;
        //         }
        //         else if (curX >= (sizes.width - gutter - cellSize - cellSize)) {
        //             vol = 100;
        //         }
        //         else {
        //             const width = sizes.width - (gutter * 2) - (cellSize * 4);
        //             const locX = curX - gutter - (cellSize * 2);
        //             vol = ((locX / width)) * 100;
        //         }
        //
        //         //console.log(outVol, vol, getEndPointVolume(vol) * (outVol/100));
        //         freqVol = this.lastFreqObj ? this.lastFreqObj.volume : 0;
        //     }
        //
        //
        //     lastVolVal = vol * freqVol;
        //     this.lastVolVal = lastVolVal;
        //
        //     this.wave.setVol(
        //         m.utils.getEndPointVolume(lastVolVal * outVol / 100) / 100
        //     );
        // }

        // if (changed && this.record) {
        //     if (!this.lastVolVal && !this.record[this.record.length - 1]) {
        //         return;
        //     }
        //
        //     this.record.push(
        //         Date.now(), this.lastFreqVal, this.lastVolVal
        //     );
        // }
    } // update

    pointerId: any;

    subscribe() {
        const pos = getPosition(this.canvasTop);
        this.sizes.boardTopOffset = pos.y;
        this.sizes.boardLeftOffset = pos.x;

        this.canvasTop.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.pointerId) {
                this.pointerId = e.pointerId;
                this.update(e);
            }
        });

        // this.canvasTop.addEventListener('pointerenter', (e) => {
        //     e.preventDefault();
        //     e.stopPropagation();
        //
        //     if (!this.pointerId && e.buttons) {
        //         this.pointerId = e.pointerId;
        //     }
        //
        //     if (e.pointerId === this.pointerId && e.buttons) {
        //         this.update(e);
        //     }
        // });
        //
        // this.canvasTop.addEventListener('pointermove', (e) => {
        //     e.preventDefault();
        //     e.stopPropagation();
        //
        //     if (!this.pointerId && e.buttons) {
        //         this.pointerId = e.pointerId;
        //     }
        //
        //     if (e.pointerId === this.pointerId && e.buttons) {
        //         this.update(e);
        //     }
        //
        // });

        this.canvasTop.addEventListener('pointerup', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId) {
                this.pointerId = null;
                this.update(e, true);
            }
        });

        this.canvasTop.addEventListener('pointerleave', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId && e.buttons) {
                this.pointerId = null;
                this.update(e, true);
            }
        });

        this.canvasTop.addEventListener('pointercancel', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId) {
                this.pointerId = null;
                this.update(e, true);
            }
        });
    }
}

export class RelativeKeysPage {
    bassBoard: Board;
    soloBoard: Board;

    get pageId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
        public props: RouteInfo<WithId>,
    ) {}

    onMounted() {
        this.setContent();
        this.subscribeEvents();
    }

    onUnmounted() {

    }

    subscribeEvents() {
        getWithDataAttr('set-note', this.pageEl).forEach(el => {
            el.addEventListener('pointerdown', (e: MouseEvent) => {
                const note = el.dataset.setNote || 'do';
                ideService.synthesizer.playSound({
                    id: 'note-line',
                    keyOrNote: note,
                    instrCode: this.bassBoard.instrCode,
                });
                this.soloBoard.share.note = note;
            });
            el.addEventListener('pointerup', (e: MouseEvent) => {
                const note = el.dataset.setNote || 'do';
                ideService.synthesizer.playSound({
                    id: 'note-line',
                    keyOrNote: note,
                    instrCode: this.bassBoard.instrCode,
                    onlyStop: true,
                });
            });
        });
    }


    getNoteLine(octave: string): string {
        const noteStl = 'margin: 0; padding: 0; box-sizing: border-box; user-select: none; touch-action: none;'
        const notesTpl = `
            <p style="${noteStl}" data-set-note="d${octave}">Д</p>
            <p style="${noteStl}" data-set-note="t${octave}">т</p>
            <p style="${noteStl}" data-set-note="r${octave}">Р</p>                                
            <p style="${noteStl}" data-set-note="n${octave}">н</p>
            <p style="${noteStl}" data-set-note="m${octave}">М</p>
            <p style="${noteStl}" data-set-note="f${octave}">Ф</p>
            <p style="${noteStl}" data-set-note="v${octave}">в</p>
            <p style="${noteStl}" data-set-note="s${octave}">С</p>                
            <p style="${noteStl}" data-set-note="z${octave}">з</p>
            <p style="${noteStl}" data-set-note="l${octave}">Л</p>
            <p style="${noteStl}" data-set-note="k${octave}">к</p>                                
            <p style="${noteStl}" data-set-note="b${octave}">Б</p>        
        `.trim();

        return notesTpl;
    }

    setContent() {
        const stl = 'position: absolute; box-sizing: border-box; user-select: none; touch-action: none;'
        const stl2 = 'box-sizing: border-box; user-select: none; touch-action: none; position: relative;';

        this.pageEl.innerHTML = `
            <!--div style="padding: 8px 8px 16px 8px; height: 32px; box-sizing: border-box;">
                <button data-set-do>DO</button>
            </div-->
            <div style="padding: 16px; margin: 0; user-select: none; touch-action: none;">
                <div style="padding: 4px; display: flex; justify-content: space-between;">
                    ${this.getNoteLine('y')}
                </div>
                <div style="padding: 4px; display: flex; justify-content: space-between;">
                    ${this.getNoteLine('o')}
                </div>            
                <div style="padding: 4px; display: flex; justify-content: space-between;">
                    ${this.getNoteLine('a')}
                </div>
                <div style="padding: 4px; display: flex; justify-content: space-between;">
                    ${this.getNoteLine('e')}
                </div>            
            </div>
            
            <div data-boards-container style="${stl2}">
                <div data-board-bass-container style="${stl}">
                    <div data-board-bass-canvas-container style="${stl}"></div>                
                </div>
                
                <div data-board-solo-container style="${stl}">
                    <div data-board-solo-canvas-container style="${stl}"></div>                
                </div>
            </div>
        `.trim();

        const sizes = getSizes({
            width: this.pageEl.clientWidth, // this.pageEl.getBoundingClientRect().width,
            height: this.pageEl.clientHeight, // this.pageEl.getBoundingClientRect().height,
            colCount: 12,
            rowCount: 13,
        });

        //console.log('sizes', sizes);

        let boardsEl = getWithDataAttr('boards-container')[0];
        boardsEl.style.width = `${sizes.width}px`;
        boardsEl.style.height = `${sizes.boardHeight}px`;

        let boardBassEl = getWithDataAttr('board-bass-container')[0];
        boardBassEl.style.top = `0px`;
        boardBassEl.style.left = `${sizes.boardBassLeft}px`;
        boardBassEl.style.width = `${sizes.boardBassWidth}px`;
        boardBassEl.style.height = `${sizes.boardHeight}px`;

        let canvasBassEl = getWithDataAttr('board-bass-canvas-container')[0];
        canvasBassEl.style.top = `0px`;
        canvasBassEl.style.left = `0px`;
        canvasBassEl.style.width = `${sizes.boardBassWidth}px`;
        canvasBassEl.style.height = `${sizes.boardHeight}px`;

        let boardSoloEl = getWithDataAttr('board-solo-container')[0];
        boardSoloEl.style.top = `0px`;
        boardSoloEl.style.left = `${sizes.boardSoloLeft}px`;
        boardSoloEl.style.width = `${sizes.boardSoloWidth}px`;
        boardSoloEl.style.height = `${sizes.boardHeight}px`;

        let canvasSoloEl = getWithDataAttr('board-solo-canvas-container')[0];
        canvasSoloEl.style.top = `0px`;
        canvasSoloEl.style.left = `0px`;
        canvasSoloEl.style.width = `${sizes.boardSoloWidth}px`;
        canvasSoloEl.style.height = `${sizes.boardHeight}px`;

        const share = {
            note: 'do',
        }

        // BASS BOARD
        this.bassBoard = new Board('bass', 'leftToRight');
        this.bassBoard.setFreqList(freqInfoList, 'do', 'be');
        this.bassBoard.setColorList(bassColors);
        this.bassBoard.createCanvas({
                ...sizes,
                width: sizes.boardBassWidth
            },
            canvasBassEl
        );
        this.bassBoard.drawCells();
        this.bassBoard.share = share;
        // this.bassBoard.wave = new WaveSource2();
        // this.bassBoard.wave.connect(Sound.ctx.destination);
        // this.bassBoard.wave.start();
        this.bassBoard.subscribe();


        // SOLO BOARD
        this.soloBoard = new Board('solo', 'rightToLeft');
        this.soloBoard.setFreqList(freqInfoList, 'da', 'bi');
        this.soloBoard.setColorList([...soloColors].reverse());
        this.soloBoard.createCanvas({
                ...sizes,
                width: sizes.boardSoloWidth
            },
            canvasSoloEl
        );
        this.soloBoard.drawCells();
        this.soloBoard.share = share;
        // this.soloBoard.wave = new WaveSource2();
        // this.soloBoard.wave.connect(Sound.ctx.destination);
        // this.soloBoard.wave.start();
        this.soloBoard.subscribe();
    }
}

// дтрнмфвсзлкбдтрнмфвсзлкбдтрнмфвсзлкб
