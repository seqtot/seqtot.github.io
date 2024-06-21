import { TSignatureType } from '../libs/muse';

import { RouteInfo } from '../src/router';
import { getWithDataAttr } from '../src/utils';
import { ideService } from './ide/ide-service';
import { standardTicks as ticks } from './ticks';
import { colorHash } from './theremin/utils';
import { Muse as m } from '../libs/muse';

type RouteType = {id: string, game: string}

type Sizes = {
    pageWidth: number,
    pageHeight: number,

    boardHeight: number,
    boardWidth: number,

    rowWidth: number,
    rowHeight: number,
    halfRowHeight: number;

    topPadding: number,

    blockCount: number,
    rowInBlockCount: number;
    cellCount: number;
    cellWidth: number;
    gutter: number;
};


const colors1 = {
    red: '255,0,0',
    green: '0,255,0',
    blue: '0,0,255',
}

const colors2 = {
    black: '0,0,0',
    white: '255,255,255',
}

const colorArr = Object.values(colorHash);
const blockCount = 2;
const rowInBlockCount = 4;

function getSizes(x: {
    width: number,
    height: number,
    blockCount: number,
    rowInBlockCount: number;
    paddingTop: number,
    paddingSide: number,
    cellCount: number,
    gutter: number,
}): Sizes {
    let pageWidth = Math.floor(x.width);
    let pageHeight = Math.floor(x.height);
    let rowWidth = (Math.floor((pageWidth - (x.paddingSide * 2)) / 2) * 2);
    let boardHeight = pageHeight - x.paddingTop;
    let rowHeight = Math.floor((boardHeight / (x.rowInBlockCount * x.blockCount)) / 2) * 2;
    let halfRowHeight = rowHeight / 2;
    let cellWidth = rowWidth / x.cellCount;

    const result =  {
        pageWidth,
        pageHeight,
        boardHeight,
        boardWidth: rowWidth,
        rowWidth,
        rowHeight,
        halfRowHeight,
        topPadding: 32,
        blockCount: x.blockCount,
        rowInBlockCount: x.rowInBlockCount,
        cellCount: x.cellCount,
        cellWidth,
        gutter: x.gutter,
    };

    return result;
}

type ModelLine = {
    restQ?: number,
    cells: {
        offsetQ: number,
        durQ: number,
        note?: string,
        prevNoteOffset?: number,
    }[];
}

type ModelType = {
    lines: ModelLine[]
}

function getRandomBlock(rowCount: number): ModelType {
    let lines = new Array(rowCount).fill(null) as ModelType['lines'];
    lines = lines.map(() => ({cells: []}));

    lines.forEach(line => {
        const count = Math.round(Math.random() * 4);
        let indexes: number[] = [];

        if (count === 4) {
            indexes = [0, 1, 2, 3];
        }

        while (count < 4) {
            if (indexes.length === count) break;

            const index = Math.round(Math.random() * 3);

            if (!indexes.includes(index)) {
                indexes.push(index);
            }
        }

        indexes.sort();

        indexes.forEach(ind => {
            line.cells[ind] = {
                durQ: 30,
                offsetQ: ind * 30
            };
        });
    });

    return {
        lines
    }
}

const model = new Array(blockCount).fill(null).map(() => getRandomBlock(rowInBlockCount));

console.log('model', model);

const notesLatArr = [
    'dy', 'ty', 'ry', 'ny', 'my', 'fy', 'vy', 'sy', 'zy', 'ly', 'ky', 'by',
    'do', 'to', 'ro', 'no', 'mo', 'fo', 'vo', 'so', 'zo', 'lo', 'ko', 'bo',
    'da', 'ta', 'ra', 'na', 'ma', 'fa', 'va', 'sa', 'za', 'la', 'ka', 'ba',
    'de', 'te', 're', 'ne', 'me', 'fe', 've', 'se', 'ze', 'le', 'ke', 'be',
];

const notesLatHash = notesLatArr.reduce((acc, note, i) => {
    acc[note] = i;

    return acc;
}, <{[note: string]: number}>{})

const offsetRange = [
    0,
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    -1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12,
];

function setModelColor(blocks: ModelType[])  {
    let firstNote = '';
    let prevNote = '';

    console.log('blocks', blocks);

    blocks.forEach(block => {
        block.lines.forEach(line => {
            line.cells.forEach(cell => {
                if (!firstNote && !cell.note) {
                    cell.note = m.utils.getRandomElement(notesLatArr);
                }

                if (!firstNote) {
                    firstNote = cell.note;
                    prevNote = firstNote;
                }

                if (!cell.note) {
                    let note = '';
                    while (!notesLatHash[note]) {
                        const offset = m.utils.getRandomElement(offsetRange);
                        note = m.utils.getNoteByOffset(prevNote, offset);
                    }
                    cell.note = note;
                }

                cell.prevNoteOffset = notesLatHash[cell.note] - notesLatHash[prevNote];
                prevNote = cell.note;
            });
        })
    })

}

setModelColor(model);

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

const DOWN = 1;
const UP = 0;


function getSlog(): string {
    const a = 'аэиоуы';
    const b = 'бвгджзйклмнпрстфхцчшщ';
    const p = 'кпт';
    const l = 'йлмн';
    const bb = 'бгд';
    const s = 'cфхшщ';
    const z = 'вжзр';
    const j = 'цч';

    const arr = [
        m.utils.getRandomElement(b) + m.utils.getRandomElement(a),
        m.utils.getRandomElement(a) + m.utils.getRandomElement(b),
    ];

    return m.utils.getRandomElement(arr);
}

class Board {
    pointerId: number | null;
    canvasTop: HTMLCanvasElement;
    canvasCtxTop: CanvasRenderingContext2D;

    canvasMid: HTMLCanvasElement;
    canvasCtxMid: CanvasRenderingContext2D;

    canvasBot: HTMLCanvasElement;
    canvasCtxBot: CanvasRenderingContext2D;

    canvasEl: HTMLElement;
    lastNote: string;

    sizes: Sizes;
    blocks: {
        blockCount: number,
        rowInBlockCount: number;
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

    paintTick(tickNio: number) {
        //console.log('paintTick', tickNio);

        this.clearCanvasTop();

        if (tickNio === Infinity) return;

        const ctx = this.canvasCtxTop;
        const tickInd = tickNio - 1;
        const tickInRow = 2;

        const blockInd = Math.floor(tickInd / (this.sizes.rowInBlockCount * tickInRow));
        const cellNio = tickNio - (blockInd * 8);
        const cellInd = cellNio - 1;
        const rowInd = Math.floor(cellInd / tickInRow);
        const cellInRowInd = cellInd - (rowInd * tickInRow);

        //console.log(blockInd, rowInd, cellNio);

        ctx.fillStyle = `rgba(${colors1.red}, 1)`;

        let yOffset = this.sizes.rowHeight * this.sizes.rowInBlockCount;
        yOffset += ((this.sizes.rowHeight * rowInd) + (this.sizes.rowHeight / 2));

        const x = cellInRowInd * (this.sizes.cellWidth * tickInRow) + ((this.sizes.cellWidth - this.sizes.halfRowHeight) / 2); // ???

        ctx.fillRect(x, yOffset , this.sizes.rowHeight , this.sizes.rowHeight);
    }

    paintCellGrid() {
        const ctx = this.canvasCtxMid;
        const defStroke = 'rgb(222, 222, 222)';
        const sizes = this.sizes;
        let lastY = 0;

        const paintSection = (block: ModelType, lastY: number, rowHeight): number => {
            ctx.strokeStyle = defStroke;
            ctx.lineWidth = 1;

            block.lines.forEach((line, iLine) => {

                // ctx.strokeStyle = 'rgb(255, 0, 0)';
                //
                // ctx.beginPath();
                // ctx.moveTo(0, lastY);
                // ctx.lineTo(sizes.boardWidth, lastY);
                // ctx.stroke();
                //
                // ctx.beginPath();
                // ctx.moveTo(0, lastY + rowHeight);
                // ctx.lineTo(sizes.boardWidth, lastY + rowHeight);
                // ctx.stroke();

                ctx.strokeStyle = defStroke;

                for (let i = 0; i < this.sizes.cellCount; i++) {
                    ctx.strokeRect(i * sizes.cellWidth, lastY, sizes.cellWidth, rowHeight);
                }

                lastY += rowHeight;
            });

            // конец блока
            ctx.strokeStyle = 'rgb(0, 0, 0)';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(0, lastY);
            ctx.lineTo(sizes.boardWidth, lastY);
            ctx.stroke();

            return lastY;
        }

        for (let i = 0; i < model.length; i++) {
            lastY = paintSection(model[i], lastY, this.sizes.rowHeight);
        }
    }

    paintCellFill() {
        const ctx = this.canvasCtxMid;
        const defStroke = 'rgb(222, 222, 222)';
        const sizes = this.sizes;
        const w = sizes.boardWidth / 120;

        ctx.strokeStyle = defStroke;
        ctx.lineWidth = 1;
        let lastY = 0;

        const paintSection = (block: ModelType, lastY: number, rowHeight): number => {
            let firstCell = true;
            block.lines.forEach((line, iLine) => {
                line.cells.forEach((cell, iCell) => {
                    const startX = cell.offsetQ * w;
                    const endX = (cell.offsetQ + cell.durQ) * w;
                    let clrItem = colorHash[cell.prevNoteOffset];

                    // if (!clrItem) {
                    //     console.log('cell without color', cell);
                    // }

                    ctx.fillStyle = `rgba(${clrItem.rgb}, 1)`;
                    ctx.fillRect(startX, lastY, endX - startX, rowHeight);

                    // ctx.fillStyle = `rgba(${colors2.black}, 1)`;
                    // ctx.fillRect(startX + 1, lastY + 1, 6 , rowHeight - 2);

                    //const text = clrItem.name;
                    const text = getSlog();

                    const fontSize = Math.floor(rowHeight * 0.8);
                    ctx.fillStyle = clrItem.val >= 0 ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)'
                    //ctx.fillStyle = `rgba(${colorHash[-clrItem.val].rgb}, 1)`;
                    ctx.textBaseline = 'middle'; // 'top';
                    ctx.font = `${fontSize}px serif`;
                    ctx.fillText(text, startX + 4, lastY + (fontSize * 0.55));
                });

                lastY += rowHeight;
            });

            return lastY;
        }


        for (let i = 0; i < model.length; i++) {
            lastY = paintSection(model[i], lastY, this.sizes.rowHeight);
        }
    }

    paint() {
        this.clearCanvasMid();

        const sizes = this.sizes;
        const ctx = this.canvasCtxMid;
        const defStroke = 'rgb(200, 200, 200)';
        ctx.strokeStyle = defStroke;
        ctx.lineWidth = 1;

        // let lastY = 0;
        // let height = sizes.rowInBlockCount * sizes.halfRowHeight;
        // ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);
        //
        // lastY = lastY + height;
        // height = sizes.rowInBlockCount * sizes.rowHeight;
        // ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);
        //
        // lastY = lastY + height;
        // height = sizes.rowInBlockCount * sizes.halfRowHeight;
        // ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);

        this.paintCellFill();
        this.paintCellGrid();

        // ctx.fillStyle = `rgba(${colors2.black}, .4)`;
        //
        // lastY = 0;
        // height = sizes.rowInBlockCount * sizes.halfRowHeight;
        // ctx.fillRect(0, lastY, sizes.boardWidth , height);
        //
        // lastY = (sizes.rowInBlockCount * sizes.rowHeight) +  (sizes.rowInBlockCount * sizes.halfRowHeight);
        // ctx.fillRect(0, lastY, sizes.boardWidth , height);
    }

    createCanvas(sizes: Sizes, canvasEl: HTMLElement) {
        this.sizes = sizes;
        this.canvasEl = canvasEl;

        function setStyle(el: HTMLCanvasElement) {
            el.style.position = "absolute";
            el.style.userSelect = "none";
            el.style.touchAction = "none";
            el.width  = sizes.boardWidth;
            el.height = sizes.boardHeight;
        }

        // BOT TOM
        this.canvasBot = document.createElement('canvas');
        setStyle(this.canvasBot);
        this.canvasEl.appendChild(this.canvasBot);
        this.canvasCtxBot = this.canvasBot.getContext("2d");

        // MID CANVAS
        this.canvasMid = document.createElement('canvas');
        setStyle(this.canvasMid);
        this.canvasEl.appendChild(this.canvasMid);
        this.canvasCtxMid = this.canvasMid.getContext("2d");

        // TOP CANVAS
        this.canvasTop = document.createElement('canvas');
        setStyle(this.canvasTop);
        this.canvasEl.appendChild(this.canvasTop);
        this.canvasCtxTop = this.canvasTop.getContext("2d");
    }

    update(e: PointerEvent, type: number) {
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;
        const lines: ModelLine[] = model.reduce((acc, block) => {
            return [...acc, ...block.lines];
        }, <ModelLine[]>[]);

        const lineInd = Math.floor(offsetY / this.sizes.rowHeight);
        const cellInd = Math.floor(offsetX / this.sizes.cellWidth);
        const cellOffset = cellInd * 30;
        const pointerId = e.pointerId;
        const line = lines[lineInd];
        const cell = line.cells.find(cell => cell && (cellOffset >= cell.offsetQ && cellOffset < (cell.offsetQ + cell.durQ )));

        //if (cell && type === UP) {
        ideService.synthesizer.playSound({
            id: 'page-game',
            keyOrNote: this.lastNote,
            instrCode: 136, //m.const.DEFAULT_TONE_INSTR,
            onlyStop: true,
        });
        //}

        if (cell && type === DOWN) {
            ideService.synthesizer.playSound({
                id: 'page-game',
                keyOrNote: cell.note,
                instrCode: 136, // m.const.DEFAULT_TONE_INSTR,
            });

            this.lastNote = cell.note;
        }
    }

    subscribe() {
        this.canvasTop.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.pointerId) {
                this.pointerId = e.pointerId;
                this.update(e, DOWN);
            }
        });

        this.canvasTop.addEventListener('pointerup', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId) {
                this.pointerId = null;
                this.update(e, UP);
            }
        });
    }
}


type TickInfo = {
    tickNode: AudioBufferSourceNode | null,
    tickStartTimeMs: number,
    tickEndTimeMs: number,
    tickQms: number,
    prevFrameMs: number,
    requestAnimationFrameId: number,
    repeat: number,
    lastTickNio: number,
}

function getTickInfo(): TickInfo {
    return {
        tickNode: null,
        tickStartTimeMs: 0,
        tickEndTimeMs: 0,
        tickQms: 0,
        prevFrameMs: 0,
        requestAnimationFrameId: 0,
        repeat: 0,
        lastTickNio: 0,
    }
}

export class GamePage {
    width = 0;
    height = 0;
    sizes: Sizes;
    board: Board;
    bpmValue: number = 90;
    tickInfo = getTickInfo();

    get pageId(): string {
        return this.props.data.id;
    }

    get gameId(): string {
        return this.props.data.game;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
        public props: RouteInfo<RouteType>,
    ) {}

    onMounted() {
        this.width = this.pageEl.getBoundingClientRect().width;
        this.height = this.pageEl.getBoundingClientRect().height;

        this.setContent();
        this.subscribeEvents();

        //console.log(this.width);
        //console.log(this.height);
    }

    onUnmounted() {

    }

    setContent() {
        //this.pageEl.style.border = `1px solid gray`;
        const sizes = this.sizes = getSizes({
            width: this.width,
            height: this.height,
            blockCount,
            rowInBlockCount,
            paddingTop: 8 + 32 + 32 + 8, // 80
            paddingSide: 8,
            gutter: 16,
            cellCount: 4,
        });

        this.pageEl.innerHTML = `
            <div>
                <div style="padding: 8px 8px 0 8px; height: 32px; box-sizing: border-box;">
                    <button data-start-game-action>start</button>
                    <button data-stop-game-action>stop</button>                    
                    <button data-next-game-action>next</button>
                </div>
                
                <div style="padding: 8px 8px 0 8px; height: 32px; box-sizing: border-box;">
                    <number-stepper-cc data-game-bpm-input value="90" min="1" max="500"></number-stepper-cc>
                </div>
                                
                <div
                    style="
                        width: ${sizes.boardWidth}px;
                        height: ${sizes.boardHeight}px;
                        padding: 8px 0 8px 8px;
                        user-select: none;
                        touch-action: none;
                    " 
                    data-game-board
                >
                </div>
                
                <div></div>            
            </div>
            
            <div style="padding: 1rem;">                                       
            </div>
        `;

        const gameBoardEl = getWithDataAttr('game-board', this.pageEl)[0];
        this.board = new Board();
        this.board.createCanvas(this.sizes, gameBoardEl);
        this.board.paint();
        this.board.subscribe();
    }

    subscribeEvents() {
        getWithDataAttr('next-game-action', this.pageEl).forEach(el => {
            el.addEventListener('pointerup', (e: MouseEvent) => {
                for (let i = 0; i < model.length; i++) {
                    if (i === model.length - 1) {
                        model[i] = getRandomBlock(this.board.sizes.rowInBlockCount);
                    } else {
                        model[i] = model[i+1];
                    }
                }

                setModelColor(model);

                console.log('MODEL', model);

                this.board.paint();
            });
        });

        getWithDataAttr('start-game-action', this.pageEl).forEach(el => {
            el.addEventListener('pointerup', (e: MouseEvent) => {
                this.playTick3();
            });
        });

        getWithDataAttr('stop-game-action', this.pageEl).forEach(el => {
            el.addEventListener('pointerup', (e: MouseEvent) => {
                this.stopTicker();
            });
        });

        getWithDataAttr('game-bpm-input', this.pageEl).forEach((el) => {
            el.addEventListener('valuechanged', (e: any) => {
                getWithDataAttr('game-bpm-input', this.pageEl).forEach((el) => {
                    el.setAttribute('value', e.detail.value);
                });

                if (this.bpmValue !== e.detail.value) {
                    this.bpmValue = e.detail.value;

                    // if (this.playingTick) {
                    //     this.playTick(this.playingTick);
                    // }
                }
            });
        });
    }

    animationFrame = () => {
        const time = Date.now();

        const tickInfo = this.tickInfo;
        const diffMs = time - tickInfo.tickStartTimeMs;
        const tickNio = Math.floor(diffMs / tickInfo.tickQms) + 1;
        const tickInd = tickNio - 1;
        const prevFrameMs = tickInfo.prevFrameMs;

        tickInfo.prevFrameMs = time;

        if (diffMs > -1 && tickInfo.lastTickNio !== tickNio) {
            //console.log(
            //     tickNio,
            //     tickInfo.tickStartTimeMs + (tickInd * tickInfo.tickQms),
            //     time - (tickInfo.tickStartTimeMs + (tickInd * tickInfo.tickQms)),
            //     time
            // );
            tickInfo.lastTickNio = tickNio;
            this.board.paintTick(tickNio);
        }

        if (time < tickInfo.tickEndTimeMs) {
            this.tickInfo.requestAnimationFrameId = requestAnimationFrame(this.animationFrame);
        } else {
            this.board.paintTick(Infinity);
        }
    }

    async playTick1(name?: string) {
        this.stopMetronome();

        name = name || '';
        //this.playingTick = name;

        const tick = ticks[name];
        const body = ticks['_x___XX_xx___x__'];

        console.log(body);

        if (!tick) {
            //this.playingTick = '';

            return;
        }

        const blocks = `
        <out r1>
        tick %tick
        body %body

        ${tick}
        ${body}
        
        `;

        const loopsPlayer = await ideService.metronome.getLoopsPlayer({
            blocks,
            bpm: this.bpmValue,
            cb: (type, data) => {
                console.log(type, data);
            }
        });

        loopsPlayer.play(1000);
    }

    playTick3(signature?: TSignatureType) {
        //return this.playTick1('8:8');

        this.stopTicker();
        signature =  signature || '2:8';

        const tickInfo = this.tickInfo;
        const repeat = 100; // 8

        const cb = (x: {
            ab: AudioBufferSourceNode,
            startTimeMs: number,
            qMs: number,
        }) => {
            //console.log(x);

            tickInfo.tickNode = x.ab;
            tickInfo.repeat = repeat * 2;
            tickInfo.tickQms = x.qMs / 2;
            tickInfo.tickStartTimeMs = x.startTimeMs;
            tickInfo.tickEndTimeMs = x.startTimeMs + (tickInfo.repeat * tickInfo.tickQms);
            tickInfo.requestAnimationFrameId = requestAnimationFrame(this.animationFrame);
        }

        const qMs = Math.round(60000/ this.bpmValue); // quoter in ms

        ideService.ticker.createTickSource({
            qMs, // quoter in ms
            //preset1: ideService.synthesizer.instruments['drum_56'],
            preset1: ideService.synthesizer.instruments['drum_80'],
            preset2: ideService.synthesizer.instruments['drum_80'],
            repeat,
            signature,
            cb,
            startOffsetMs: qMs,
        });
    }

    stopTicker() {
        //console.log('stopTicker');
        // ideService.ticker.stop();
        // ideService.synthesizer.playSound({
        //     keyOrNote: 'cowbell',
        //     id: 'ticker',
        //     onlyStop: true,
        // });

        const tickInfo = this.tickInfo;

        if (tickInfo.requestAnimationFrameId) {
            window.cancelAnimationFrame(this.tickInfo.requestAnimationFrameId)
        }

        if (tickInfo.tickNode) {
            tickInfo.tickNode.stop();
            tickInfo.tickNode = null;
        }

        this.tickInfo = getTickInfo();

        this.stopMetronome();
    }

    stopMetronome() {
        ideService.metronome.stopAndClearMidiPlayer();
    }

    stopMultiplayer() {
        ideService.multiPlayer.stopAndClearMidiPlayer();
    }
}
