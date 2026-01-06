import { Muse as m, Sound, TFreqInfo } from '../../libs/muse';

import { getWithDataAttr } from '../../src/utils';
import { WaveSource2 } from './wave-source';
import { RouteInfo } from '../../src/router';

type WithId = { id: string }

const outVol = 80;
const freqInfoList = m.const.freqInfoList;

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
        .map(item => ({ ...item }));

    list.forEach((item, i) => {
        item.relatives = list.map((iItem, i) => iItem.step === item.step ? i : -1).filter(ind => ind > -1);
        item.index = i;
    });

    return list;
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
    cellCount: number,
}): Sizes {

    //console.log(getPosition(this.bassBoard.canvasEl));

    let headerHeight = getWithDataAttr('app-header-first-row-area')[0].clientHeight;

    let width = x.width; // window.innerWidth;
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
    isSilent = false;
    lastX = -1;
    lastY = -1;
    lastFreqObj: TFreqInfo;
    lastFreqVal = 0;
    lastVolVal = 0;

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
        const gutter = this.gutter;
        const zeroY = gutter;
        const zeroX = gutter;
        const height = this.sizes.height - (gutter * 2);
        const width = this.sizes.width - (gutter * 2);
        const ctx = this.canvasCtxMid;
        const cellSize = this.sizes.cellSize;

        this.clearCanvasMid();
        const defStroke = 'rgb(200, 200, 200)';
        //const midStroke = 'rgb(250, 190, 190)';
        const midStroke = defStroke;

        // линия cверху ячейки
        this.freqList.forEach((item, i) => {
            ctx.strokeStyle = defStroke;
            ctx.lineWidth = 1;

            // if ((i % 6) === 0) {
            //   canvasCtx.lineWidth = 1;
            //   canvasCtx.strokeStyle = 'gray';
            // }

            if (item.step === 'd' || item.step === 'm' || item.step === 'z') { // && this.type === 'freqAndVol'
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.fillRect(gutter / 2, zeroY + (i * cellSize) + cellSize / 2, 2, 2);
                ctx.fillRect(gutter + width + gutter / 2, zeroY + (i * cellSize) + cellSize / 2, 2, 2);
            }

            ctx.strokeStyle = defStroke;
            ctx.lineWidth = .5;
            ctx.beginPath();
            ctx.moveTo(zeroX, zeroY + (i * cellSize));
            ctx.lineTo(zeroX + width, zeroY + (i * cellSize));
            ctx.stroke();

            if (i === (this.freqList.length - 1)) {
                ctx.strokeStyle = defStroke;
                ctx.lineWidth = .5;
                ctx.beginPath();
                ctx.moveTo(zeroX, zeroY + ((i + 1) * cellSize));
                ctx.lineTo(zeroX + width, zeroY + ((i + 1) * cellSize));
                ctx.stroke();
            }
        });

        // volumeList.forEach((item, i) => {
        //     if (item.value === 100 ) {
        //         if (i > 0) {
        //             return;
        //         }
        //
        //         ctx.lineWidth = .5;
        //         ctx.strokeStyle = defStroke;
        //         ctx.beginPath();
        //         ctx.moveTo(zeroX, zeroY);
        //         ctx.lineTo(zeroX + width, zeroY);
        //         ctx.stroke();
        //
        //         return;
        //     }
        //
        //     // if (item.value === 52.5 || item.value === 47.5 ) {
        //     //   ctx.lineWidth = .5;
        //     //   ctx.strokeStyle = 'red';
        //     //   ctx.beginPath();
        //     //   ctx.moveTo(zeroX, (i * cellSize) + zeroY);
        //     //   ctx.lineTo(zeroX + width, (i * cellSize) + zeroY);
        //     //   ctx.stroke();
        //
        //     //   return;
        //     // }
        //
        //     if (item.value === 0) {
        //         ctx.lineWidth = .5;
        //         ctx.strokeStyle = defStroke;
        //
        //         if (i === (volumeList.length - 1)) {
        //             ctx.beginPath();
        //             ctx.moveTo(zeroX, ((i+1) * cellSize) + zeroY);
        //             ctx.lineTo(zeroX + width, ((i+1) * cellSize) + zeroY);
        //             ctx.stroke();
        //
        //             return;
        //         }
        //     }
        //
        //
        //     ctx.strokeStyle = defStroke;
        //
        //     if (item.isMiddle) {
        //         ctx.strokeStyle = midStroke;
        //     }
        //
        //     ctx.lineWidth = .5;
        //
        //     ctx.beginPath();
        //     ctx.moveTo(zeroX, (i * cellSize) + zeroY);
        //     ctx.lineTo(zeroX + width, (i * cellSize) + zeroY);
        //     ctx.stroke();
        //
        //     // if ((i % 6) === 0) {
        //     //   canvasCtx.lineWidth = 1;
        //     //   canvasCtx.strokeStyle = 'gray';
        //     // }
        //
        //     // if (i=== 0 || (i % 12) === 0) {
        //     //   canvasCtx.lineWidth = 2;
        //     //   canvasCtx.strokeStyle = 'red';
        //     // }
        //
        //
        //     // canvasCtx.beginPath();
        //     // canvasCtx.moveTo(0, i * cellSize);
        //     // canvasCtx.lineTo(BOARD_WIDTH, i * cellSize);
        //     // canvasCtx.stroke();
        // });
    } // drawCells

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
        this.canvasBot.width = sizes.width;
        this.canvasBot.height = sizes.height;
        // this.canvasEl.style.border   = "1px solid gray";
        this.canvasEl.appendChild(this.canvasBot);
        this.canvasCtxBot = this.canvasBot.getContext("2d");

        // MID CANVAS
        this.canvasMid = document.createElement('canvas');
        this.canvasMid.style.position = "absolute";
        this.canvasMid.width = sizes.width;
        this.canvasMid.height = sizes.height;
        this.canvasEl.appendChild(this.canvasMid);
        this.canvasCtxMid = this.canvasMid.getContext("2d");

        // TOP CANVAS
        this.canvasTop = document.createElement('canvas');
        this.canvasTop.style.position = "absolute";
        this.canvasTop.width = sizes.width;
        this.canvasTop.height = sizes.height;
        this.canvasEl.appendChild(this.canvasTop);
        this.canvasCtxTop = this.canvasTop.getContext("2d");
    }

    update(e: PointerEvent) {
        const gutter = this.gutter;
        const cellSize = this.sizes.cellSize;
        const halfSize = this.sizes.halfSize;
        const sizes = this.sizes;

        // const offsetX = e.touches[0].clientX - this.sizes.boardLeftOffset;
        // const offsetY = e.touches[0].clientY - this.sizes.boardTopOffset;

        const offsetX = e.offsetX;
        const offsetY = e.offsetY;

        if (offsetX <= gutter ||
            offsetX >= (sizes.width - gutter) ||
            offsetY <= gutter ||
            offsetY >= (sizes.boardHeight - gutter) ||
            this.isSilent
        ) {
            return;
        }

        //console.log(offsetX, offsetY);

        // // if (e.buttons) {
        // //   canvasCtx.fillStyle = "green";
        // //   canvasCtx.fillRect(CurX, CurY , 1, 1);
        // // }

        let curX = Math.round(offsetX);
        let curY = Math.round(offsetY);
        let changed = false;

        if (curY !== this.lastY) {
            this.lastY = curY;
            changed = true;

            const locY = curY - gutter;
            const indFreq = Math.floor(locY / cellSize);

            if (this.freqList[indFreq]) {
                this.lastFreqObj = this.freqList[indFreq];
            }

            let freqVal = this.lastFreqObj.value;

            let type2 = this.wave.type1;

            if (this.isSmoothMode) {
                let botFRange = this.lastFreqObj.midF - this.lastFreqObj.botF;
                let topFRange = this.lastFreqObj.topF - this.lastFreqObj.midF;

                let topY = (cellSize * indFreq);
                let botY = (cellSize * (indFreq + 1)) - 1;
                let midY = topY + halfSize + 1;

                let botFact = botFRange / (botY - midY);
                let topFact = topFRange / (midY - topY);

                if (locY === midY) {
                    type2 = 'sawtooth';
                }
                else if (locY > midY) {
                    // ниже
                    freqVal = freqVal - (botFact * ((locY - midY)));
                }
                else {
                    // выше
                    freqVal = freqVal + (topFact * ((midY - locY)));
                }
            }

            //console.log(this.lastFreqObj);

            this.lastFreqVal = freqVal;
            this.wave.setFreq(freqVal);
            this.wave.setType2(type2);
        }

        if (curX !== this.lastX) {
            this.lastX = curX;
            changed = true;

            let vol = 0;
            let lastVolVal = 0;
            let freqVol = 0;

            if (this.volDirection === 'rightToLeft') {
                if (curX <= (gutter + cellSize + cellSize)) {
                    vol = 100;
                }
                else if (curX >= (sizes.width - gutter - cellSize - cellSize)) {
                    vol = 0;
                }
                else {
                    const width = sizes.width - (gutter * 2) - (cellSize * 4);
                    const locX = curX - gutter - (cellSize * 2);
                    vol = (1 - (locX / width)) * 100;
                }

                //console.log(outVol, vol, getEndPointVolume(vol) * (outVol/100));
                freqVol = this.lastFreqObj ? this.lastFreqObj.volume : 0;
            }

            if (this.volDirection === 'leftToRight') {
                if (curX <= (gutter + cellSize + cellSize)) {
                    vol = 0;
                }
                else if (curX >= (sizes.width - gutter - cellSize - cellSize)) {
                    vol = 100;
                }
                else {
                    const width = sizes.width - (gutter * 2) - (cellSize * 4);
                    const locX = curX - gutter - (cellSize * 2);
                    vol = ((locX / width)) * 100;
                }

                //console.log(outVol, vol, getEndPointVolume(vol) * (outVol/100));
                freqVol = this.lastFreqObj ? this.lastFreqObj.volume : 0;
            }


            lastVolVal = vol * freqVol;
            this.lastVolVal = lastVolVal;

            this.wave.setVol(
                m.utils.getEndPointVolume(lastVolVal * outVol / 100) / 100
            );
        }

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
        let topRight = 0

        function gameLoop() {
            const gamepads = navigator.getGamepads();

            if (!gamepads) {
                requestAnimationFrame(gameLoop);
                return;
            }

            const gp = gamepads[0];
            let value = parseFloat((100*gp.axes[2]).toFixed(1))
            console.log(gp.axes[2])

            if (topRight !== value) {
              topRight = value

              //console.log(value)
            }

            // console.log(gamepads)
            // if (gp.buttons[0].pressed) {
                // b--;
            // }
            // if (gp.buttons[2].pressed) {
                // b++;
            // }
            // if (gp.buttons[1].pressed) {
                // a++;
            // }
            // if (gp.buttons[3].pressed) {
                // a--;
            // }
// 
            // ball.style.left = `${a * 2}px`;
            // ball.style.top = `${b * 2}px`;

            requestAnimationFrame(gameLoop);
        }

        //gameLoop()

        // 2-left 1-right 
        // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
        window.addEventListener("gamepadconnected", (e) => {
            console.log(navigator.getGamepads())
            // console.log(
                // "Gamepad connected at index %d: %s. %d buttons, %d axes.",
                // e.gamepad.index,
                // e.gamepad.id,
                // e.gamepad.buttons.length,
                // e.gamepad.axes.length,
            // );

            if (this.type === 'bass') {
              gameLoop()
            }
        });
// 
        // window.addEventListener("gamepaddisconnected", (e) => {
            // console.log(
                // "Gamepad disconnected from index %d: %s",
                // e.gamepad.index,
                // e.gamepad.id,
            // );
        // });

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

        this.canvasTop.addEventListener('pointerenter', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.pointerId && e.buttons) {
                this.pointerId = e.pointerId;
            }

            if (e.pointerId === this.pointerId && e.buttons) {
                this.update(e);
            }
        });

        this.canvasTop.addEventListener('pointermove', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.pointerId && e.buttons) {
                this.pointerId = e.pointerId;
            }

            if (e.pointerId === this.pointerId && e.buttons) {
                this.update(e);
            }

        });

        this.canvasTop.addEventListener('pointerup', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId) {
                this.pointerId = null;
            }
        });

        this.canvasTop.addEventListener('pointerleave', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId && e.buttons) {
                this.pointerId = null;
            }
        });

        this.canvasTop.addEventListener('pointercancel', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.pointerId === this.pointerId) {
                this.pointerId = null;
            }
        });
    }
}

export class ThereminPage {
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
    ) { }

    onMounted() {
        this.setContent();
    }

    onUnmounted() {

    }

    setContent() {
        const stl = 'position: absolute; box-sizing: border-box; user-select: none; touch-action: none;'
        const stl2 = 'style="box-sizing: border-box; user-select: none; touch-action: none;"';

        this.pageEl.innerHTML = `
            <div data-boards-container style="${stl2}">
                <div data-board-bass-container style="${stl}">
                    <div data-board-bass-canvas-container style="${stl}"></div>                
                </div>
                
                <div data-board-solo-container style="${stl}">
                    <div data-board-solo-canvas-container style="${stl}"></div>                
                </div>
            </div>
            <div style="${stl2}">
                <span style="${stl2}">Д</span>
                <span style="${stl2}">т</span>
                <span style="${stl2}">Р</span>
                <span style="${stl2}">н</span>
                <span style="${stl2}">М</span>
                <span style="${stl2}">Ф</span>                
                <span style="${stl2}">в</span>
                <span style="${stl2}">С</span>
                <span style="${stl2}">з</span>                
                <span style="${stl2}">Л</span>                
                <span style="${stl2}">к</span>
                <span style="${stl2}">Б</span>                                
            </div>
        `.trim();

        const sizes = getSizes({
            width: this.pageEl.clientWidth, // this.pageEl.getBoundingClientRect().width,
            height: this.pageEl.clientHeight, // this.pageEl.getBoundingClientRect().height,
            cellCount: 36
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

        // BASS BOARD
        this.bassBoard = new Board('bass', 'leftToRight');
        this.bassBoard.setFreqList(freqInfoList, 'do', 'be');
        this.bassBoard.createCanvas({
            ...sizes,
            width: sizes.boardBassWidth
        },
            canvasBassEl
        );
        this.bassBoard.drawCells();
        this.bassBoard.wave = new WaveSource2();
        this.bassBoard.wave.connect(Sound.ctx.destination);
        this.bassBoard.wave.start();
        this.bassBoard.subscribe();

        // SOLO BOARD
        this.soloBoard = new Board('solo', 'rightToLeft');
        this.soloBoard.setFreqList(freqInfoList, 'da', 'bi');
        this.soloBoard.createCanvas({
            ...sizes,
            width: sizes.boardSoloWidth
        },
            canvasSoloEl
        );
        this.soloBoard.drawCells();
        this.soloBoard.wave = new WaveSource2();
        this.soloBoard.wave.connect(Sound.ctx.destination);
        this.soloBoard.wave.start();
        this.soloBoard.subscribe();
    }
}

// дтрнмфвсзлкбдтрнмфвсзлкбдтрнмфвсзлкб
