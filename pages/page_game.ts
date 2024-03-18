import { RouteInfo } from '../src/router';
import {getWithDataAttr} from '../src/utils';

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
};

function getSizes(x: {
    width: number,
    height: number,
    blockCount: number,
    rowInBlockCount: number;
    paddingTop: number,
    paddingSide: number,
}): Sizes {
    let pageWidth = Math.floor(x.width);
    let pageHeight = Math.floor(x.height);
    let rowWidth = (Math.floor((pageWidth - (x.paddingSide * 2)) / 2) * 2);
    let boardHeight = pageHeight - x.paddingTop;
    let rowHeight = Math.floor((boardHeight / (x.rowInBlockCount * 2)) / 2) * 2;
    let halfRowHeight = rowHeight / 2;

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
    };

    console.log('getSizes', result);

    return result;
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
    }

    createCanvas(sizes: Sizes, canvasEl: HTMLElement) {
        this.sizes = sizes;
        this.canvasEl = canvasEl;

        // BOT TOM
        this.canvasBot = document.createElement('canvas');
        this.canvasBot.style.position = "absolute";
        this.canvasBot.width  = sizes.boardWidth;
        this.canvasBot.height = sizes.boardHeight;
        // this.canvasEl.style.border   = "1px solid gray";
        this.canvasEl.appendChild(this.canvasBot);
        this.canvasCtxBot = this.canvasBot.getContext("2d");

        // MID CANVAS
        this.canvasMid = document.createElement('canvas');
        this.canvasMid.style.position = "absolute";
        this.canvasMid.width  = sizes.boardWidth;
        this.canvasMid.height = sizes.boardHeight;
        this.canvasEl.appendChild(this.canvasMid);
        this.canvasCtxMid = this.canvasMid.getContext("2d");

        // TOP CANVAS
        this.canvasTop = document.createElement('canvas');
        this.canvasTop.style.position = "absolute";
        this.canvasTop.width  = sizes.boardWidth;
        this.canvasTop.height = sizes.boardHeight;
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
        })

        console.log('sizes', this.sizes);

        this.pageEl.innerHTML = `
            <div>
                <div style="padding: 8px;">
                    <button data-start-game-action>start</button>
                    <button data-stop-game-action>stop</button>                    
                </div>
                <div
                    style="width: ${sizes.boardWidth}px; height: ${sizes.boardHeight}px; padding-left: 8px;" 
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
