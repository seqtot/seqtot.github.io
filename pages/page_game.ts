import { RouteInfo } from '../src/router';
import {getWithDataAttr} from '../src/utils';

type RouteType = {id: string, game: string}


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
    cellCount: number,
}): Sizes {

    //console.log(getPosition(this.bassBoard.canvasEl));

    let headerHeight = getWithDataAttr('app-header-first-row-area')[0].clientHeight;

    let width = x.width ; // window.innerWidth;
    let height = x.height - (headerHeight * 2); //window.innerHeight;
    // let boardWidth = pageWidth - 64;
    // let boardHeight = 0;
    let halfSize = Math.floor((((height - (x.cellCount + 2)) / (x.cellCount + 2))) / 2);
    let cellSize = (halfSize * 2) + 1;

    const halfWidth = Math.floor(width / cellSize / 2) * cellSize;

    let boardSoloWidth = halfWidth; //Math.floor(width / cellSize);
    //boardSoloWidth = boardSoloWidth - 3;
    //boardSoloWidth = boardSoloWidth * cellSize;
    let boardBassLeft = 0;
    let boardBassWidth = halfWidth; // cellSize * 3;
    let boardSoloLeft = width - 1 - halfWidth; // cellSize * 3;

    let boardHeight = (x.cellCount * cellSize) + (cellSize * 2);

    return {
        width,
        height,
        boardHeight,
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
    canvasTop: HTMLCanvasElement;
    canvasCtxTop: CanvasRenderingContext2D;

    canvasMid: HTMLCanvasElement;
    canvasCtxMid: CanvasRenderingContext2D;

    canvasBot: HTMLCanvasElement;
    canvasCtxBot: CanvasRenderingContext2D;

    gutter: number;
    canvasEl: HTMLElement;

    sizes: Sizes;

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
}


export class GamePage {
    width = 0;
    height = 0;
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

        this.pageEl.innerHTML = `
            <div style="display: flex; justify-content: center;">
                <div style="
                    border: 1px solid gray;
                    width: ${this.width * 0.7}px;"
                >
                    GamePage
                </div>            
            </div>
    
        `;
    }
}
