import { RouteInfo } from '../src/router';
import { getWithDataAttr } from '../src/utils';
import { ideService } from './ide/ide-service';
import { SignatureType } from '../libs/muse/ticker';
import { standardTicks as ticks } from './ticks';

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

// R       G       B       Y      M      C     |
// 12!__   04_!_   03__!   02!!_  07!_!  09_!! |
// 05!:_   01:!.   08:.!                       |
// 11!.:   10.!:   06.:!                       |
//

const colorHash = {
'12':   { mask: '!__', val: 12,   name: 'йа',  rgb: '250,0,0'   },
'-12':  { mask: '!__', val: -12,   name: 'йу',  rgb: '125,0,0'   },

'11':   { mask: '!.:', val: 11,   name: 'га',  rgb: '250,150,200' },
'-11':  { mask: '!.:', val: -11,  name:  'гу', rgb: '125,75,100'  },

'10':  { mask: '.!:', val: 10,  name: 'ра', rgb: '150,250,200'  },
'-10': { mask: '.!:', val: -10,  name: 'ру', rgb: '50,150,100'   },

'9':   { mask: '_!!', val: 9,  name: 'фа', rgb: '0,250,250'   },
'-9':  { mask: '_!!', val: -9,  name: 'фу', rgb: '0,125,125'   },

'8':  { mask: ':.!', val: 8, name: 'ва',  rgb: '200,150,250' },
'-8': { mask: ':.!', val: -8, name:  'ву', rgb: '100,75,125'  },

'7':   { mask: '!_!', val: 7,   name: 'за', rgb: '250,0,250'  },
'-7':  { mask: '!_!', val: -7,   name: 'зу', rgb: '120,0,125'  },

'6':   { mask: '.:!', val: 6,  name: 'ша', rgb: '150,200,250'  },
'-6':  { mask: '.:!', val: -6,   name: 'шу', rgb: '50,100,150'   },

'5':   { mask: '!:_', val: 5,  name: 'ла',  rgb: '250,175,0'   },
'-5':  { mask: '!:_', val: -5,  name: 'лу',  rgb: '125,50,0'    },

'4':   { mask: '_!_', val: 4,   name: 'жа', rgb: '0,250,0'   },
'-4':  { mask: '_!_', val: -4,  name: 'жу', rgb: '0,100,0'   },

'3':   { mask: '__!', val: 3,  name: 'ща',      rgb: '0,0,250'    },
'-3':  { mask: '__!', val: -3,  name: 'щу',      rgb: '0,0,125'   },

'2':   { mask: '!!_', val: 2,   name: 'са', rgb: '250,250,0'   },
'-2':  { mask: '!!_', val: -2,  name: 'су', rgb: '125,125,0'   },

'1':  { mask: '!::', val: 1,  name:  'ха',  rgb: '200,190,190'  },
'-1': { mask: '!::', val: -1, name:  'ху',  rgb: '100,100,110'  },

'0':   { mask: '!!!', val: 0,   name: 'мо', rgb: '150,150,150' },
};

const colorArr = Object.values(colorHash);

function getSizes(x: {
    width: number,
    height: number,
    blockCount: number,
    rowInBlockCount: number;
    paddingTop: number,
    paddingSide: number,
    cellCount: number,
}): Sizes {
    let pageWidth = Math.floor(x.width);
    let pageHeight = Math.floor(x.height);
    let rowWidth = (Math.floor((pageWidth - (x.paddingSide * 2)) / 2) * 2);
    let boardHeight = pageHeight - x.paddingTop;
    let rowHeight = Math.floor((boardHeight / (x.rowInBlockCount * 2)) / 2) * 2;
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
    };

    return result;
}

type ModelType = {
    lines: {
        restQ?: number,
        cells: {
            offsetQ: number,
            durQ: number,
        }[]
    }[]
}

const topTestBlock: ModelType = {
    lines: [
        {
            cells: [
                { offsetQ: 0, durQ: 30 },
                { offsetQ: 60, durQ: 30 },
            ]
        },
        {
            cells: [
                { offsetQ: 0, durQ: 30 },
                { offsetQ: 60, durQ: 30 },
            ]
        },
        {
            cells: [
                { offsetQ: 0, durQ: 30 },
                { offsetQ: 60, durQ: 30 },
            ]
        },
        {
            cells: [
                { offsetQ: 0, durQ: 30 },
                { offsetQ: 60, durQ: 30 },
            ]
        }
    ]
};

const midTestBlock: ModelType = {
    lines: [
        {
            restQ: 0,
            cells: [{
                offsetQ: 0,
                durQ: 30,
            }]
        },
        {
            restQ: 0,
            cells: [{
                offsetQ: 30,
                durQ: 30,
            }]
        },
        {
            restQ: 0,
            cells: [{
                offsetQ: 60,
                durQ: 30,
            }]
        },
        {
            restQ: 0,
            cells: [{
                offsetQ: 90,
                durQ: 30,
            }]
        }
    ]
};

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

const model: {top: ModelType, mid: ModelType, bot: ModelType} = {
    top: topTestBlock,
    mid: getRandomBlock(4),
    bot: getRandomBlock(4),
}

class Board {
    canvasTop: HTMLCanvasElement;
    canvasCtxTop: CanvasRenderingContext2D;

    canvasMid: HTMLCanvasElement;
    canvasCtxMid: CanvasRenderingContext2D;

    canvasBot: HTMLCanvasElement;
    canvasCtxBot: CanvasRenderingContext2D;

    canvasEl: HTMLElement;

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

        let yOffset = this.sizes.halfRowHeight * this.sizes.rowInBlockCount;
        yOffset += ((this.sizes.rowHeight * rowInd) + (this.sizes.halfRowHeight / 2));

        const x = cellInRowInd * (this.sizes.cellWidth * tickInRow) + ((this.sizes.cellWidth - this.sizes.halfRowHeight) / 2);

        ctx.fillRect(x, yOffset , this.sizes.halfRowHeight , this.sizes.halfRowHeight);
    }

    paintCellGrid() {
        const ctx = this.canvasCtxMid;
        const defStroke = 'rgb(222, 222, 222)';
        const sizes = this.sizes;

        ctx.strokeStyle = defStroke;
        ctx.lineWidth = 1;
        let lastY = 0;

        const paintSection = (block: ModelType, lastY: number, rowHeight): number => {
            block.lines.forEach((line, iLine) => {
                ctx.beginPath();
                ctx.moveTo(0, lastY);
                ctx.lineTo(sizes.boardWidth, lastY);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, lastY + rowHeight);
                ctx.lineTo(sizes.boardWidth, lastY + rowHeight);
                ctx.stroke();

                for (let i = 0; i < this.sizes.cellCount; i++) {
                    ctx.strokeRect(i * sizes.cellWidth, lastY, sizes.cellWidth, rowHeight);
                }

                lastY += rowHeight;
            });

            return lastY;
        }

        lastY = paintSection(model.top, lastY, this.sizes.halfRowHeight);
        lastY = paintSection(model.mid, lastY, this.sizes.rowHeight);
        lastY = paintSection(model.bot, lastY, this.sizes.halfRowHeight);
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
                    const realClr = colorArr.filter(item => item.val !== null);
                    let clrItem = realClr[Math.round(Math.random() * (realClr.length - 1))];

                    if (firstCell) {
                        clrItem = colorHash['0'];
                        firstCell = false;
                    }

                    ctx.fillStyle = `rgba(${clrItem.rgb}, 1)`;
                    ctx.fillRect(startX, lastY, endX - startX, rowHeight);

                    ctx.fillStyle = `rgba(${colors2.black}, 1)`;
                    ctx.fillRect(startX + 1, lastY + 1, 6 , rowHeight - 2);

                    const fontSize = Math.floor(rowHeight/3);
                    ctx.fillStyle = `rgba(${colorHash[-clrItem.val].rgb}, 1)`;
                    ctx.textBaseline = 'middle'; // 'top';
                    ctx.font = `${Math.floor(rowHeight/2)}px serif`;
                    ctx.fillText(clrItem.mask, startX + fontSize, lastY + (rowHeight /2));
                });

                lastY += rowHeight;
            });

            return lastY;
        }

        lastY = paintSection(model.top, lastY, this.sizes.halfRowHeight);
        lastY = paintSection(model.mid, lastY, this.sizes.rowHeight);
        lastY = paintSection(model.bot, lastY, this.sizes.halfRowHeight);
    }


    paint() {
        this.clearCanvasMid();

        const sizes = this.sizes;
        const ctx = this.canvasCtxMid;
        const defStroke = 'rgb(200, 200, 200)';
        ctx.strokeStyle = defStroke;
        ctx.lineWidth = 1;

        let lastY = 0;
        let height = sizes.rowInBlockCount * sizes.halfRowHeight;
        ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);

        lastY = lastY + height;
        height = sizes.rowInBlockCount * sizes.rowHeight;
        ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);

        lastY = lastY + height;
        height = sizes.rowInBlockCount * sizes.halfRowHeight;
        ctx.strokeRect(0, 0, sizes.boardWidth, lastY + height);

        const w = sizes.boardWidth / 120;

        this.paintCellFill();
        this.paintCellGrid();

        ctx.fillStyle = `rgba(${colors2.black}, .4)`;

        lastY = 0;
        height = sizes.rowInBlockCount * sizes.halfRowHeight;
        ctx.fillRect(0, lastY, sizes.boardWidth , height);

        lastY = (sizes.rowInBlockCount * sizes.rowHeight) +  (sizes.rowInBlockCount * sizes.halfRowHeight);
        ctx.fillRect(0, lastY, sizes.boardWidth , height);
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
            blockCount: 3,
            rowInBlockCount: 4,
            paddingTop: 8 + 32 + 32 + 8, // 80
            paddingSide: 8,
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
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['0'].rgb});">+0</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['0'].rgb});">-0</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-1'].rgb});">-1</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['1'].rgb});">+1</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-2'].rgb});">-2</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['2'].rgb});">+2</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-3'].rgb});">-3</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['3'].rgb});">+3</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-4'].rgb});">-4</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['4'].rgb});">+4</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-5'].rgb});">-5</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['5'].rgb});">+5</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-6'].rgb});">-6</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['6'].rgb});">+6</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-7'].rgb});">-7</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['7'].rgb});">+7</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-8'].rgb});">-8</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['8'].rgb});">+8</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-9'].rgb});">-9</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['9'].rgb});">+9</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-10'].rgb});">-10</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['10'].rgb});">+10</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-11'].rgb});">-11</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['11'].rgb});">+11</span><br/>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['-12'].rgb});">-12</span>
                <span style="display: inline-block; width: 2rem; background-color: rgb(${colorHash['12'].rgb});">+12</span>                                
                <!--
                span style="background-color: lightgray;">lightgray</span>
                <span style="background-color: gray;">gray</span><br/>
                <span style="background-color: deepskyblue;">deepskyblue</span>
                <span style="background-color: blue;">blue</span><br/>
                <span style="background-color: aquamarine;">aquamarine</span>
                <span style="background-color: darkcyan;">darkcyan</span><br/>                    
                <span style="background-color: lime;">lime</span>                    
                <span style="background-color: green;">green</span><br/>
                <span style="background-color: orange;">orange</span>
                <span style="background-color: saddlebrown;">saddlebrown</span><br/>                    
                <span style="background-color: lightcoral;">lightcoral</span>
                <span style="background-color: red;">red</span><br/>
                <span style="background-color: cyan;">cyan</span>
                <span style="background-color: violet;">violet</span><br/>                    
                <span style="background-color: yellow;">yellow</span>
                <span style="background-color: bisque;">bisque</span><br/>
                <span style="background-color: darkkhaki;">darkkhaki</span>
                <span style="background-color: white;">unkonow</span
                -->                                        
            </div>
        `;

        const gameBoardEl = getWithDataAttr('game-board', this.pageEl)[0];
        this.board = new Board();
        this.board.createCanvas(this.sizes, gameBoardEl);
        this.board.paint();
    }

    subscribeEvents() {
        getWithDataAttr('next-game-action', this.pageEl).forEach(el => {
            el.addEventListener('pointerup', (e: MouseEvent) => {
                model.top = model.mid;
                model.mid = model.bot;
                model.bot = getRandomBlock(this.board.sizes.rowInBlockCount);
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

    playTick3(signature?: SignatureType) {
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

/*
00:Gray:   |                 | DarkGray  |                |
01:ColorG  | SlateGray       |           | LightSteelBlue |
02:Yellow: | Gold            |           | Yellow         |
03:Blue:   | RoyalBlue       |           | LightSkyBlue   |
04:Green:  | Green           |           | Lime           |
05:Orange: | Chocolate       |           | Orange         |
06:Pink:   | MediumVioletRed |           | Pink           |
07:Red:    | Red             |           | Salmon         |
08:Brown:  | SaddleBrown     |           | Peru           |
09:Cyan:   | DarkCyan        |           | Cyan           |
10:Purple  | MediumPurple    |           | Thistle        |
11:Purple: | Purple          |           | Plum           |
12:        | DimGray         |           | LightGray      |

https://en.wikipedia.org/wiki/Web_colors#Color_selection

*/
