import { RouteInfo } from '../src/router';
import { getWithDataAttr } from '../src/utils';

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


const colors = {
    red: '255,0,0',
    green: '0,255,0',
    blue: '0,0,255',
}

const colors2 = {
    black: '0,0,0',
    white: '255,255,255',
}


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

    console.log('getSizes', result);

    return result;
}


type ModelType = {
    lines: {
        restQ: number,
        cells: {
            offsetQ: number,
            durQ: number,
        }[]
    }[]
}


const testBlock: ModelType = {
    lines: [
        {
            restQ: 0,
            cells: [{
                offsetQ: 0,
                durQ: 120,
            }]
        },
        {
            restQ: 0,
            cells: [{
                offsetQ: 30,
                durQ: 90,
            }]
        },
        {
            restQ: 0,
            cells: [{
                offsetQ: 60,
                durQ: 60,
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

const model: {top: ModelType, mid: ModelType, bot: ModelType} = {
    top: testBlock,
    mid: testBlock,
    bot: testBlock,
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
            block.lines.forEach((line, iLine) => {
                line.cells.forEach((cell, iCell) => {
                    const startX = cell.offsetQ * w;
                    const endX = (cell.offsetQ + cell.durQ) * w;

                    ctx.fillStyle = `rgba(${colors.blue}, 1)`;
                    ctx.fillRect(startX, lastY, endX - startX, rowHeight);
                    ctx.fillStyle = `rgba(${colors2.black}, .7)`;
                    ctx.fillRect(startX + 1, lastY + 1, 4 , rowHeight - 2);
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

        lastY = sizes.boardHeight - (sizes.rowInBlockCount * sizes.halfRowHeight);
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


export class GamePage {
    width = 0;
    height = 0;
    sizes: Sizes;
    board: Board;

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

        console.log(this.width);
        console.log(this.height);
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
            paddingTop: 48,
            paddingSide: 8,
            cellCount: 4,
        })

        console.log('sizes', this.sizes);

        this.pageEl.innerHTML = `
            <div>
                <div style="padding: 8px 8px 0 8px;">
                    <button data-start-game-action>start</button>
                    <button data-stop-game-action>stop</button>                    
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
            <!--div style="border: 1px solid gray;">
                <span style="background-color: lightgray;">lightgray</span>
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
                <span style="background-color: white;">unkonow</span>                                        
            </div-->
        `;

        const gameBoardEl = getWithDataAttr('game-board', this.pageEl)[0];
        this.board = new Board();
        this.board.createCanvas(this.sizes, gameBoardEl);
        this.board.paint();
    }
}
