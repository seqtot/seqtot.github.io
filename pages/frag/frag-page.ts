import { RouteInfo } from '../../src/router';
import {getWithDataAttr} from '../../src/utils';
import { Muse as m, Synthesizer, TKeyInfo, Sound, TWavePreset } from '../../libs/muse';
import {TWaveZone} from '../../libs/muse/font/otypes';
import FileService from '../../libs/common/file-service';
import {WavRecorder} from '../ide/wav-recorder';
import {WidthOrHeightPropertyName} from '../../libs/gl';
import height = WidthOrHeightPropertyName.height;
import {SongStore} from '../song-store';

// 60   75  80  96  100 120 125 150 160 200 240 250 300 375 400
// 1000 800 750 625 600 500 480 400 375 300 250 240 200 160 150

// const synthesizer = new Synthesizer();
// this.synthesizer.connect({ ctx: Sound.ctx });
// this.synthesizer.setSettings(m.defaultSynthSettings);

const NEAR_ZERO = 0.0000001

type WithId = {id: string}

type MainSizes = {
    pageHeaderHeight: number,
    pageHeight: number;
    pageWidth: number;
    boardHeight: number;
    boardWidth: number;
}

type JsonFile = {
    name?: string,
    src?: string,
    zones?: any[],
}

type Stat = {
    minN: number,
    minP: number,
    maxN: number,
    maxP: number,
    zeroCount: number,
    len: number,
    lenMs: number,
}


function getStat(arr: number[]): Stat {
    let minN: number = null
    let minP: number = null
    let maxN: number = null
    let maxP: number = null
    let zeroCount: number = 0

    arr.forEach(val => {
        if (val > 0) {
            if (maxP == null) {
                maxP = val
                minP = val
            }

            maxP = val > maxP ? val : maxP
            minP = val < minP ? val : minP
        } else if (val < 0) {
            val = -val

            if (maxN == null) {
                maxN = val
                minN = val
            }

            maxN = val > maxN ? val : maxN
            minN = val < minN ? val : minN
        } else {
            zeroCount++;
        }
    })

    const result = {
        minN,
        minP,
        maxN,
        maxP,
        zeroCount,
        len: arr.length,
        lenMs: arr.length / Sound.ctx.sampleRate
    }

    return result;
}

function getMainSizes(): MainSizes {
    const headerEl = getWithDataAttr('app-header-container')[0];
    const pageHeaderHeight = headerEl ? Math.ceil(headerEl.clientHeight) : 0;
    const viewport = getViewport();
    let pageHeight = Math.floor(viewport.height - pageHeaderHeight);
    let pageWidth = Math.floor(viewport.width);
    let boardHeight = pageHeight - (32*3);
    let boardWidth = pageWidth - 6;

    return {
        pageHeaderHeight,
        pageHeight,
        pageWidth,
        boardHeight,
        boardWidth,
    }
}

function getViewport(): {width: number; height: number} {
    const win = window;
    const docEl = win.document.documentElement;
    const body = win.document.getElementsByTagName('body')[0];

    return {
        width: win.innerWidth || docEl.clientWidth || body.clientWidth,
        height: win.innerHeight || docEl.clientHeight || body.clientHeight,
    };
}

class Frag {
    fixData: number[][] = [];
    prevData: number[] | null = null;
    rawData: number[] = [];
    unitWidth: number = 1;
    anchorDataX: number = 0;
    dataOffsetX = 0;
    fixDataX: number = null;
    stat: Stat = null;

    bpmFillValue: number = 0;
    bpmFillOffset: number = 0;
    bpmFillArray: number[] = [];

    freqFillValue: number = 0;
    freqFillOffset: number = 0;
    freqFillArray: number[] = [];

    setData(arr: number[]) {
        this.rawData = arr;
        this.setStat();
    }

    cutLeft(x: number) {
        this.prevData = [...this.rawData];
        let rawData = this.rawData.slice(x);
        this.setData(rawData)
    }

    cutRight(x: number) {
        this.prevData = [...this.rawData];
        let rawData = this.rawData.slice(0, x+1);
        this.setData(rawData)
    }

    setPointValue(x: number, val: number) {
        this.prevData = [...this.rawData];
        this.rawData[x] = 0;
    }

    copyPasteSelected() {
        const range = this.getAnchorsRange();
        const leftPart = this.rawData.slice(0, range[0]);
        const rightPart = this.rawData.slice(range[1]+1);
        const midPart = this.rawData.slice(range[0], range[1]+1);
        this.setData([...leftPart, ...midPart, ...midPart, ...rightPart])
    }

    getAnchorsRange(): [number, number] {
        const xRange = [this.fixDataX || 0, this.anchorDataX];
        xRange.sort((a, b) => (a - b));

        xRange[0] = xRange[0] < 0 ? 0 : xRange[0];
        xRange[1] = xRange[1] < 0 ? 0 : xRange[1];

        return xRange as any;
    }

    undo() {
        if (this.prevData) {
            this.setData([...this.prevData])
            this.prevData = null;
        }
    }

    getStat(arr?: number[]): Stat {
        return getStat(arr || this.rawData)
    }

    setStat(): Stat {
        this.stat = this.getStat();

        return this.stat;
    }
}

class Strip {
    type: string; // single,
    id: string;
    isVisible: boolean;
    frags: Frag[] = [];
    //dataOffsetX = 0;
    x: number = 0;
    y: number = 0;
    height: number = 0;
    width: number = 0;
    halfHeight: number;
    xHeight: number;

    constructor(config: {id: string, isVisible: boolean}) {
        this.id = config.id;
        this.isVisible = !!config.isVisible;
    }
}

function toArray<T>(val: any): T[] {
    return Array.isArray(val) ? val : [val];
}

class Board {
    canvasEl: HTMLCanvasElement;
    parentEl: HTMLElement;
    canvasCtx: CanvasRenderingContext2D;
    strips: Strip[] = [];
    activeStrip: Strip  | null = null;
    activeFrag: Frag  | null = null;
    sizes: MainSizes;
    stripHalfHeight = 200;

    clearCanvas() {
        this.canvasCtx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }

    createCanvas(sizes: MainSizes, parentEl: HTMLElement) {
        this.parentEl = parentEl;
        this.canvasEl = document.createElement('canvas');
        this.parentEl.appendChild(this.canvasEl);
        this.setSizes(sizes);
    }

    addStrips (p: Strip | Strip[]) {
        const strips = toArray<Strip>(p);
        this.strips = [...this.strips, ...strips]
    }


    drawFragment(strip: Strip, frag: Frag) {
        const ctx = this.canvasCtx;
        const x = strip.x;
        const y = strip.y + strip.halfHeight;
        let zeroY = strip.y + strip.halfHeight + strip.xHeight;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillStyle = `rgba(100, 100, 100, 1)`;

        let leftFragX = 0;
        let rightFragX  = 0;

        const leftDataX = frag.dataOffsetX;
        let rightDataX = leftDataX + strip.width;

        let unitWidth = frag.unitWidth;
        //const length = Math.ceil(frag.rawData.length / unitWidth);
        // draw wave
        if (unitWidth > -2) {
            unitWidth = Math.abs(frag.unitWidth) || 1;
            rightDataX = leftDataX + Math.floor(strip.width / unitWidth);

            for (let i = leftDataX; i < frag.rawData.length; i++) {
                const val = frag.rawData[i];

                if (val == 0) {
                    ctx.fillStyle = `rgba(255, 0, 0, 1)`;
                    ctx.fillRect(x + ((i - frag.dataOffsetX) * unitWidth), zeroY, unitWidth, 1);

                    continue;
                }

                ctx.fillStyle = `rgba(100, 100, 100, 1)`;

                const height = Math.floor(val * strip.halfHeight);
                // ctx.beginPath();
                // ctx.moveTo(x, zeroY);
                // ctx.lineTo(x + i, y - (val * strip.halfHeight));
                // ctx.stroke();
                ctx.fillRect(x + ((i - frag.dataOffsetX) * unitWidth), zeroY - height , unitWidth, height);
            }
        } else if (unitWidth < 0) {
            unitWidth = Math.abs(frag.unitWidth);
            let iData = frag.dataOffsetX;
            let iX = x;
            rightDataX = leftDataX + Math.floor(strip.width * unitWidth);

            while (true) {
                if (iData > (frag.rawData.length - 1)) break;
                let botArr: number[] = [];
                let topArr: number[] = [];

                for (let j=0; j < unitWidth; j++) {
                    const val = frag.rawData[iData+j];

                    if (val == null) {
                        break;
                    }

                    if (val > 0) {
                        topArr.push(val);
                    } else if (val < 0) {
                        botArr.push(-val);
                    }
                }

                let topVal = 0;
                let botVal = 0;

                if (topArr.length) {
                    topVal = Math.max(...topArr);
                }

                if (botArr.length) {
                    botVal = Math.max(...botArr);
                }

                const heightTop = Math.floor(topVal * strip.halfHeight);
                const heightBot = Math.floor(botVal * strip.halfHeight);

                ctx.fillRect(iX, y - heightTop , 1, heightTop + heightBot + 1);

                iX += 1;
                iData += unitWidth;
            }
        } // circle

        //console.log(frag.anchorDataX, leftDataX, rightDataX);

        // ANCHOR
        if (frag.anchorDataX >= leftDataX && frag.anchorDataX <= rightDataX) {
            ctx.fillStyle = `rgba(100, 0, 0, .3)`;
            let anchorX = 0;

            if (frag.unitWidth > -2) {
                anchorX = ((frag.anchorDataX - frag.dataOffsetX) * unitWidth) + strip.x; // strip.x + strip.offsetX + ()
                ctx.fillRect(anchorX, strip.y , unitWidth, strip.y + strip.height);
            } else {
                anchorX = Math.floor((frag.anchorDataX - frag.dataOffsetX) / unitWidth) + strip.x; // strip.x + strip.offsetX + ()
                ctx.fillRect(anchorX, strip.y , 1, strip.y + strip.height);
            }

            //console.log('anchorX', anchorX);
        }

        // FIX
        //console.log('fixDataX', frag.fixDataX);
        const fixDataX = frag.fixDataX || 0;
        if (fixDataX >= leftDataX && fixDataX <= rightDataX) {
            ctx.fillStyle = `rgba(0, 100, 0, .3)`;
            let anchorX = 0;

            if (frag.unitWidth > -2) {
                anchorX = ((fixDataX - frag.dataOffsetX) * unitWidth) + strip.x; // strip.x + strip.offsetX + ()
                ctx.fillRect(anchorX, strip.y , unitWidth, strip.y + strip.height);
            } else {
                anchorX = Math.floor((fixDataX - frag.dataOffsetX) / unitWidth) + strip.x; // strip.x + strip.offsetX + ()
                ctx.fillRect(anchorX, strip.y , 1, strip.y + strip.height);
            }

            //console.log('anchorX', anchorX);
        }

        // zero Y
        ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
        ctx.lineWidth = strip.xHeight;
        ctx.beginPath();
        ctx.moveTo(x, zeroY);
        ctx.lineTo(x + strip.width, zeroY);
        ctx.stroke();
    }

    drawStrip (strip: Strip, sizes: {
        x: number, y: number, height: number, width: number, halfHeight: number, xHeight: number, isFirst: boolean, isLast: boolean}) {

        //console.log('sizes', sizes);

        strip.x = sizes.x;
        strip.y = sizes.y;
        strip.height = sizes.height;
        strip.width = sizes.width; // canvas.width - x
        strip.halfHeight = sizes.halfHeight;
        strip.xHeight = sizes.xHeight;

        strip.frags.forEach(frag => {
           this.drawFragment(strip, frag);
        });

        const ctx = this.canvasCtx;
        //ctx.fillStyle = `rgba(100, 0, 0, 1)`;

        // top line
        ctx.strokeStyle = `rgba(100, 100, 100, 1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sizes.x, sizes.y);
        ctx.lineTo(sizes.x + sizes.width, sizes.y);
        ctx.stroke();

        // zero Y
        // ctx.strokeStyle = 'rgba(200, 200, 200, 1)';
        // ctx.lineWidth = 1;
        // ctx.beginPath();
        // ctx.moveTo(sizes.x, sizes.y + sizes.halfHeight + sizes.xHeight);
        // ctx.lineTo(sizes.width + sizes.x, sizes.y + sizes.halfHeight + sizes.xHeight);
        // ctx.stroke();

        if (sizes.isLast) {
            ctx.strokeStyle = `rgba(100, 100, 100, 1)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sizes.x, sizes.y + sizes.height - 1);
            ctx.lineTo(sizes.x + sizes.width, sizes.y + sizes.height - 1);
            ctx.stroke();
        }

        //ctx.strokeRect(sizes.x, sizes.y, sizes.width, sizes.height);
        //ctx.fillRect(0, yOffset , stripWidth, stripHeight);
    }

    drawBoard() {
        this.clearCanvas();

        //const stripHeight = Math.floor(this.canvasEl.height / this.strips.length);
        const halfHeight = this.stripHalfHeight;
        const xHeight = 1;
        const stripHeight = (halfHeight * 2) + xHeight;
        let y = 0;
        let x = 16;

        const strips = this.strips.filter(strip => strip.isVisible);

        strips.forEach((strip, i) => {
            //if ((y + stripHeight) > this.sizes.boardHeight) return;

            this.drawStrip(strip, {
                x,
                y,
                height: stripHeight,
                width: this.canvasEl.width - x,
                xHeight,
                halfHeight,
                isFirst: i === 0,
                isLast: i === (strips.length - 1)
            });
            y += stripHeight;
        });
    }

    setSizes(sizes: MainSizes) {
        function setParentStyle(el: HTMLElement) {
            //el.style.position = "absolute";
            el.style.userSelect = "none";
            el.style.touchAction = "none";
            el.style.width = `${sizes.boardWidth}px`;
            el.style.height = `${sizes.boardHeight}px`;
        }

        function setCanvasStyle(el: HTMLCanvasElement) {
            //el.style.position = "absolute";
            el.style.userSelect = "none";
            el.style.touchAction = "none";
            el.width  = sizes.boardWidth;
            el.height = sizes.boardHeight;
        }

        this.sizes = sizes;
        setParentStyle(this.parentEl);
        setCanvasStyle(this.canvasEl);
        this.canvasCtx = this.canvasEl.getContext("2d");
    }
}

export class FragPage {
    mainSizes: MainSizes = getMainSizes();
    board: Board;
    synthesizer = new Synthesizer();
    recorder: WavRecorder;

    get pageId(): string {
        return this.props.data.id;
    }

    get pageEl(): HTMLElement {
        return document.getElementById('app-route');
    }

    constructor(
        public props: RouteInfo<WithId>,
    ) {
        this.synthesizer.connect({ ctx: Sound.ctx });
        this.synthesizer.setSettings(m.defaultSynthSettings);
    }

    onMounted() {
        window.addEventListener('resize', this.onWindowResize);
        this.subscribeWindowKeyListeners();

        this.setContent();
        this.createBoard();
        this.subscribeEvents();
    }

    onUnmounted() {
        window.removeEventListener('resize', this.onWindowResize);
        this.unsubscribeWindowKeyListeners();
    }

    unsubscribeWindowKeyListeners() {
        window.removeEventListener('keydown', this.onKeyDown, {capture: true});
        window.removeEventListener('keyup', this.onKeyUp, {capture: true});
    }

    subscribeWindowKeyListeners() {
        window.addEventListener('keydown', this.onKeyDown, {capture: true});
        window.addEventListener('keyup', this.onKeyUp, {capture: true});
    }

    setContent() {
        this.pageEl.innerHTML = `
            <div data-top-toolbar style="height: 64px;">
                <div data-top-toolbar-1 style="height: 32px;">
                    <button data-load>load</button>
                    <button data-save-project>save</button>
                    <button data-play-save-ogg>ogg</button>                    
                    <button data-play-fragment-all>playAll</button>
                    <button data-play-fragment-from>playF</button>
                    <button data-play-fragment-to>playT</button>
                    <button data-play-fragment-from-to>playFT</button>                                        
                    <button data-play-fragment-from-to-plus>playFT+</button>
                    <button data-rec-action>rec</button>
                    <button data-stop-rec-action>stop rec</button>
                    <button data-strip-label>src</button>
                    <button data-strip-label>free</button>
                    
                    <input hidden type="file" data-file-input multiple />                                
                </div>
                <div data-top-toolbar-2 style="height: 32px;">              
                </div>                                          
            </div>
            <div data-board></div>
            <div data-bot-toolbar style="height: 32px;">
              <input type="text" data-command-input style="margin-left: 16px; width: 50%;"/>
            </div>            
        `;
    }

    getStripByY(y: number): Strip | null {
        for (let strip of this.board.strips) {
            if (strip.isVisible &&  y >= strip.y && y <= (strip.y + strip.height) ) {
                return strip;
            }
        }

        return null;
    }

    createBoard() {
        this.mainSizes = getMainSizes();
        const boardEl = getWithDataAttr('board', this.pageEl)[0];
        this.board = new Board();
        this.board.createCanvas(this.mainSizes, boardEl);

        const strip1 = new Strip({id: 'src', isVisible: true});
        const strip2 = new Strip({id: 'free', isVisible: true});
        strip1.frags = [new Frag()];
        strip2.frags = [new Frag()];

        this.board.addStrips([strip1, strip2]);
        this.board.drawBoard();

        this.board.canvasEl.addEventListener('mousedown', (e: MouseEvent) => {
           // e.clientX, e.x, e.offsetX, e.pageX, e.movementX
           // console.log(e, e.clientY, e.offsetY);
           this.board.activeFrag = null;
           this.board.activeStrip = this.getStripByY(e.offsetY);

           if (!this.board.activeStrip) return;

           const frag = this.board.activeStrip.frags[0];

           if (!frag) return;

           this.board.activeFrag = frag;

           const unitWidth = frag.unitWidth;
           const offsetX = frag.dataOffsetX;
           const stripX = this.board.activeStrip.x;
           let anchorX = 0;

           if (unitWidth === 1 || unitWidth === -1) {
               const clientX = Math.round(e.clientX);
               anchorX = clientX - stripX + offsetX;
           } else if (unitWidth > 0) {
               anchorX = Math.floor((e.clientX - stripX) / unitWidth) + offsetX;
           } else if (unitWidth < 0) {
               anchorX = ((e.clientX - stripX) * (-unitWidth)) + offsetX;
           }

           console.log('anchorDataX', anchorX);
           frag.anchorDataX = anchorX;
           //console.log('frag', e.clientX, anchorX, this.board.activeStrip);
           this.board.drawBoard();
           this.setInfo(frag);
        });
    }

    setInfo(frag: Frag) {
        getWithDataAttr('top-toolbar-2', this.pageEl).forEach(el => {
            let info = '';
            const infoArr: any[] = [];
            const dataLength = frag.rawData.length;
            const xRange = this.getAnchorsRange(frag);
            const xDiff = xRange[1] - xRange[0];

            infoArr.push(dataLength, ', ');
            infoArr.push(Math.ceil(dataLength/Sound.ctx.sampleRate*1000), ' | ');
            infoArr.push(frag.anchorDataX, ', ');
            infoArr.push(Math.ceil(frag.anchorDataX/Sound.ctx.sampleRate*1000), ' | ');
            infoArr.push(frag.rawData[frag.anchorDataX], ' | ');
            infoArr.push(`${frag.unitWidth}x`, ' | ');
            infoArr.push(`${xDiff}`, ', ');
            infoArr.push(`${Math.ceil(xDiff / Sound.ctx.sampleRate * 1000)}ms`, ', ');



            el.innerHTML = infoArr.join('');
        });
        //top-toolbar-2
    }

    subscribeEvents() {
        getWithDataAttr('file-input', this.pageEl).forEach(el => {
            el.addEventListener('change', (evt: Event) => this.loadFile(evt));
        });

        getWithDataAttr('play-fragment-all', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.playFragmentAll());
        });

        getWithDataAttr('play-fragment-from', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.playFragmentFrom());
        });

        getWithDataAttr('play-fragment-to', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.playFragmentTo());
        });

        getWithDataAttr('play-fragment-from-to', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.playFragmentFromTo());
        });

        getWithDataAttr('play-fragment-from-to-plus', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.playFragmentFromTo(1000));
        });

        getWithDataAttr('play-save-ogg', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => this.saveOgg());
        });

        getWithDataAttr('load', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => {
                getWithDataAttr('file-input', this.pageEl)[0].click();
            });
        });

        getWithDataAttr('save-project', this.pageEl).forEach(el => {
            el.addEventListener('click', (evt: Event) => {
                this.saveProject();
            });
        });

        getWithDataAttr('rec-action', this.pageEl).forEach(el => {
            el.addEventListener('click', async (evt: Event) => {
                this.stopRec();
                this.recorder = new WavRecorder(m.Sound.ctx);
                await this.recorder.initMic();
                this.recorder.prepareMicRecord();
                await this.recorder.startMic();
            });
        });

        getWithDataAttr('stop-rec-action', this.pageEl).forEach(el => {
            el.addEventListener('click', async (evt: Event) => {
                const asBlob = await this.recorder.stopMic();
                const blob = new Blob(<any>asBlob, { type: 'audio/ogg; codecs=opus' });
                const audioBuffer = await m.utils.getAudioBufferFromBlob(blob);
                const rawData = this.rawDataFromAudioBuffer(audioBuffer);

                //console.log('stop', arrayBuffer);
                this.setData(this.board.activeStrip?.id, rawData);
            });
        });

        getWithDataAttr('command-input', this.pageEl).forEach(el => {
            el.addEventListener('focusin', (evt: Event) => {
                this.unsubscribeWindowKeyListeners();
            });
            el.addEventListener('focusout', (evt: Event) => {
                this.subscribeWindowKeyListeners();
            });
            el.addEventListener('keypress', (evt: KeyboardEvent) => {
                if (evt.code === 'Enter') {
                   this.runCommand((evt.target as HTMLInputElement).value);
                }
            });
        });
    }

    runCommand(text: string) {
        const strip = this.board.activeStrip;
        const frag = this.board.activeFrag;

        text = (text || '').trim();
        let arr = text.split(' ').filter(Boolean);

        if (!arr.length) return;
        const cmd = arr[0];

        const update = (frag: Frag) => {
            this.board.drawBoard();
            this.setInfo(frag);
        }

        // set height ids print cutl cutr hide show
        // print ids, print strip, print frag
        if (cmd === 'set' ) {
            if (!this.board.activeStrip) return;

            arr = arr[1].split('=').filter(Boolean);
            if (arr[0] === 'id' && arr[1]) {
                const oldId = this.board.activeStrip.id;
                const newId = arr[1];
                this.board.activeStrip.id = newId;
                this.project.json.zones.forEach(zone => {
                    if (zone.id === oldId) {
                        zone.id = newId;
                    }
                });
            }
            else if (arr[0] === 'height' && arr[1]) {
                const newHeight = m.utils.parseInteger(arr[1]);

                if (newHeight) {
                    this.board.stripHalfHeight = newHeight;
                    this.board.drawBoard();
                }
            }
        }
        else if (cmd === 'ids') {
            const ids = this.board.strips.map(strip => strip.id);
            console.log(ids.join(', '));
        }
        else if (cmd === 'print') {
            if (this.board.activeStrip) {
                console.log(this.board.activeStrip);
            }
        }
        else if (cmd === 'cutl' && frag) {
            frag.cutLeft(this.board.activeFrag.anchorDataX);
            frag.anchorDataX = 0;
            update(frag);
        }
        else if (cmd === 'cutr' && frag) {
            frag.cutRight(this.board.activeFrag.anchorDataX);
            update(frag);
        }
        else if (cmd === 'zero' && frag) {
            frag.setPointValue(frag.anchorDataX, 0);
            update(frag);
        }
        else if (cmd === 'unzero' && frag) {
            const val = parseFloat(arr[1]);

            if (isNaN(val)) return;

            const rawData = frag.rawData;

            rawData.forEach((currVal, i) => {
                currVal = rawData[i] || 0;
                const prevVal = rawData[frag.anchorDataX -1] || 0;
                const nextVal = rawData[frag.anchorDataX + 1] || 0;
                if (currVal < 0 && currVal > -val) {
                    rawData[i] = -val;
                }
                if (currVal > 0 && currVal < val) {
                    rawData[i] = val;
                }
                if (currVal === 0) {
                    if (prevVal >= 0 && nextVal >= 0) {
                        rawData[i] = val;
                    }
                    if (prevVal <= 0 && nextVal <= 0) {
                        rawData[i] = -val;
                    }
                }
            })

            update(frag);

            // const arr = frag.rawData;
            // const prevVal = arr[frag.anchorDataX -1] || 0;
            // const currVal = arr[frag.anchorDataX] || 0;
            // const nextVal = arr[frag.anchorDataX + 1] || 0;
            //
            // if (currVal !== 0) return;
            //
            // if (currVal > 0) {
            //     if (prevVal > 0 && nextVal > 0) {
            //         arr[frag.anchorDataX] = NEAR_ZERO;
            //     }
            // } else {
            //     if (prevVal < 0 && nextVal < 0) {
            //         arr[frag.anchorDataX] = -NEAR_ZERO;
            //     }
            // }
            //
            // update(frag);
        }
        else if (cmd === 'cps') { // copy paste selected
            frag.copyPasteSelected();
            update(frag);
        }
        else if (cmd === 'undo' && frag) {
            frag.undo();
            update(frag);
        }
        else if (cmd === 'stat' && frag) {
            console.log(frag.getStat())
        }
        else if (cmd === 'hide') {
            const id = arr[1];

            this.board.strips.forEach(strip => {
                if (!id) {
                    strip.isVisible = false;

                    return;
                }

                strip.isVisible = strip.id != id ? strip.isVisible : false;
            })
            this.board.drawBoard();
        }
        else if (cmd === 'show') {
            const id = arr[1];

            this.board.strips.forEach(strip => {
                if (!id) {
                    strip.isVisible = true;

                    return;
                }

                strip.isVisible = strip.id != id ? strip.isVisible : true;
            })
            this.board.drawBoard();
        }
        else if (cmd === 'showone') {
            const id = arr[1];

            this.board.strips.forEach(strip => {
                strip.isVisible = strip.id == id ? true : false;
            })
            this.board.drawBoard();
        }

    }

    setData(stripId: string, rawData: number[]) {
        const strip = this.getStripById(stripId);

        if (!strip) return;

        const frag = strip.frags[0];

        if (!frag) return;

        const unitWidth = Math.ceil(rawData.length / strip.width);
        frag.unitWidth = -unitWidth;
        frag.setData(rawData);

        this.board.drawBoard();
    }

    rawDataFromAudioBuffer(audioBuffer: AudioBuffer): number[] {
        const channelData = audioBuffer.getChannelData(0);
        const rawData = [];
        //let currVal = 0;
        // let min = 0;
        // let max = 0;
        // let nextVal = 0;

        for (let i = 0; i < channelData.length; i++) {
            // currVal = channelData[i];
            // nextVal = channelData[i+1] || 0;
            // min = currVal < min ? currVal : min;
            // max = currVal > max ? currVal : max;
            //
            // зануление
            // if (currVal > 0 && nextVal < 0) {
            //     currVal = 0;
            // } else if (currVal < 0 && nextVal > 0) {
            //     currVal = 0;
            // }
            //
            //rawData[i] = currVal;

            rawData[i] = channelData[i];
        }

        return rawData;
    }

    clear() {
        this.board.activeStrip = null;
        this.board.activeFrag = null;
        this.board.strips = [];
        this.project = {} as any;
    }

    getRawDataFromAudioBuffer(audioBuffer: AudioBuffer): number[] {
        const channelData = audioBuffer.getChannelData(0);
        const rawData = [];
        let min = 0;
        let max = 0;
        let currVal = 0;
        let nextVal = 0;

        for (let i = 0; i<channelData.length; i++) {
            // if (i > 999) {
            //     break;
            // }

            currVal = channelData[i];
            nextVal = channelData[i+1] || 0;
            min = currVal < min ? currVal : min;
            max = currVal > max ? currVal : max;

            // зануление
            // if (currVal > 0 && nextVal < 0) {
            //     currVal = 0;
            // } else if (currVal < 0 && nextVal > 0) {
            //     currVal = 0;
            // }

            rawData[i] = currVal;
        }

        return rawData;
    }

    project: {
        json: JsonFile,
        fileName: string,
        type: 'font'
    } = {} as any;

    async setAudioFontFile(data: JsonFile, fileName: string) {
        console.log('setAudioFontFile', fileName);
        this.clear();
        this.project.json = data;
        this.project.fileName = fileName;
        this.project.type = 'font';
        let nio = 0;
        for (let item of data.zones) {
            nio++;
            let id = (item.id || '').toString().trim();
            id = id || nio;
            item.id = id.toString();

            let strip = new Strip({id: id, isVisible: true});
            let audioBuffer: AudioBuffer;

            if (item.sample) {
                audioBuffer = await m.utils.getAudioBufferFromSample(item.sample, item.sampleRate);
            } else {
                audioBuffer = await m.utils.getAudioBufferFromString(item.file);
            }

            this.board.strips.push(strip);
            const rawData = this.getRawDataFromAudioBuffer(audioBuffer)
            let frag = new Frag();

            frag.setData(rawData)
            strip.frags.push(frag);
            // const unitWidth = Math.ceil(frag.rawData.length / strip.width);
            // frag.unitWidth = -unitWidth;
        }

        this.board.drawBoard();
    }

    // https://web.dev/read-files/#read-content
    async loadFile(event: Event) {
        // name
        const fileList = event.target['files'];

        const clearFileInput = () => {
            getWithDataAttr('file-input', this.pageEl).forEach(el => {
                (el as any).value = null
            });
        }

        const setAudioBuffer = (audioBuffer: AudioBuffer) => {
            const rawData = this.getRawDataFromAudioBuffer(audioBuffer);
            this.setData('src', rawData);
        }

        const loadWav = async (file: File) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.addEventListener('load', async (event) => {
                const result = event.target.result as string;
                let audioBuffer = await m.utils.getAudioBufferFromBlobString(result);
                setAudioBuffer(audioBuffer);
                clearFileInput();
            });
        }

        const loadJson = async (file: File) => {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', async (event) => {
                const result = JSON.parse(event.target.result as string) as JsonFile;

                if (result.src) {
                    let audioBuffer = await m.utils.getAudioBufferFromString(result.src);
                    setAudioBuffer(audioBuffer);
                } if (Array.isArray(result.zones)) {
                    await this.setAudioFontFile(result, file.name);
                }

                clearFileInput();
            });
        }

        // const loadText = async (file: File) => {
        //     const reader = new FileReader();
        //     // reader.readAsDataURL(file);
        //     reader.readAsText(file);
        //
        //     reader.addEventListener('load', async (event) => {
        //         //console.log('ON LOAD TEXT 1', event);
        //
        //         const result = event.target.result as string;
        //
        //         //console.log('ON LOAD TEXT 2', result);
        //     });
        // }
        //
        // const loadJS = async (file: File) => {
        //     const reader = new FileReader();
        //     // reader.readAsDataURL(file);
        //     reader.readAsText(file);
        //
        //     reader.addEventListener('load', async (event) => {
        //         const result = event.target.result as string;
        //         const arr = result.split('\n');
        //         let evalResult: any;
        //
        //         for (let i = 0; i < arr.length; i++) {
        //             let str = arr[i].trim();
        //             if (str.startsWith('console')) str = '';
        //             if (str.startsWith('var ')) str = 'evalResult = {';
        //             if (str.startsWith('};')) str = '}';
        //             arr[i] = str;
        //         }
        //         //console.log('ON LOAD JS 1', arr.filter(item => !!item).join('\n'));
        //         //console.log('ON LOAD JS 1', JSON.parse(arr.filter(item => !!item).join('\n')));
        //         eval(arr.filter(item => !!item).join('\n'));
        //
        //         this.fontSource = cloneWavePreset(evalResult);
        //
        //         await this.buildFont(0, false);
        //
        //         this.ee.emit(ids.repaint);
        //     });
        // }
        //
        // //console.log('FILE', fileList[0]);
        // // text/plain
        // //text/javascript
        // // application/json

        if (fileList && fileList[0]) {
            console.log('fileList[0]', fileList[0]);
        }

        if (fileList && fileList[0] && fileList[0].type === 'audio/wav') {
            loadWav(fileList[0]);
        }

        if (fileList[0] && fileList[0].type === 'application/json') {
            loadJson(fileList[0]);
        }

        // if (fileList[0] && fileList[0].type === 'text/plain') {
        //     loadText(fileList[0]);
        // }
        //
        // if (fileList[0] && fileList[0].type === 'text/javascript') {
        //     loadJS(fileList[0]);
        // }
    }

    onWindowResize = () => {
        this.mainSizes = getMainSizes();
        this.board.setSizes(this.mainSizes);
        this.board.drawBoard();
    }

    getStripOffsetDataXByVisibleAnchorX(strip: Strip, frag: Frag, anchorX: number) {
        let unitWidth = Math.abs(frag.unitWidth) || 1;
        let leftDataWidth = frag.unitWidth > 0 ? Math.round(anchorX / unitWidth) : Math.round(anchorX * unitWidth);
        let offsetDataWidth = frag.anchorDataX - leftDataWidth;

        return offsetDataWidth;
    }

    getVisibleAnchorX(strip: Strip, frag: Frag): number | null {
        if (!frag.anchorDataX) return null;

        const leftDataX = frag.dataOffsetX;
        let unitWidth = Math.abs(frag.unitWidth) || 1;
        let rightDataX: number;

        if (frag.unitWidth > -2) {
            rightDataX = leftDataX + Math.ceil(strip.width / unitWidth);
        } else {
            rightDataX = leftDataX + Math.ceil(strip.width * unitWidth);
        }

        if (frag.anchorDataX < leftDataX || frag.anchorDataX > rightDataX) return null;

        let anchorX = frag.anchorDataX;

        if (frag.unitWidth > -2) {
            anchorX = Math.round((frag.anchorDataX - frag.dataOffsetX) * unitWidth);
        } else {
            anchorX = Math.round((frag.anchorDataX - frag.dataOffsetX) / unitWidth);
        }

        return anchorX;
    }

    onKeyDown = (e: KeyboardEvent) => {
        if (['F12'].includes(e.code)) return;

        // ArrowLeft ArrowRight

        e.stopImmediatePropagation();
        e.preventDefault();

        const activeStrip = this.board.activeStrip;
        const oneMs = Math.round(Sound.ctx.sampleRate / 1000);
        const frag = this.board.activeFrag;

        const updateBoard = () => {
            this.board.drawBoard();
            this.setInfo(frag);
        }

        if (e.code === 'ArrowRight' && frag)  {
            if (e.ctrlKey) {
                frag.anchorDataX = frag.anchorDataX + (e.shiftKey ? 48 : 1);
            } else {
                const offsetX = frag.dataOffsetX + (e.shiftKey ? 1: oneMs);
                frag.dataOffsetX = offsetX > frag.rawData.length ? frag.rawData.length : offsetX;
                //frag.dataOffsetX = offsetX;
            }

            return updateBoard();
        }

        if (e.code === 'PageDown' && frag)  {
            const offsetX = frag.dataOffsetX + Math.floor(activeStrip.width / 2);
            frag.dataOffsetX = offsetX > frag.rawData.length ? frag.rawData.length : offsetX;
            //frag.dataOffsetX = offsetX;

            return updateBoard();
        }

        if (e.code === 'ArrowLeft' && frag)  {
            if (e.ctrlKey) {
                frag.anchorDataX = frag.anchorDataX - (e.shiftKey ? 48 : 1);
            } else {
                const offsetX = frag.dataOffsetX - (e.shiftKey ? 1 : oneMs);
                //frag.dataOffsetX = offsetX < 0 ? 0 : offsetX;
                frag.dataOffsetX = offsetX;
            }

            return updateBoard();
        }

        if (e.code === 'PageUp' && frag)  {
            const offsetX = frag.dataOffsetX - Math.floor(activeStrip.width / 2);
            //frag.dataOffsetX = offsetX < 0 ? 0 : offsetX;
            frag.dataOffsetX = offsetX;

            return updateBoard();
        }

        // ArrowUp ArrowDown
        if (e.code === 'ArrowUp' && frag)  {
            const anchorX = this.getVisibleAnchorX(activeStrip, frag);
            const unitWidth = frag.unitWidth + (e.shiftKey ? 1 : 4);
            frag.unitWidth = !unitWidth ? 1: unitWidth;

            if (anchorX != null) {
                frag.dataOffsetX = this.getStripOffsetDataXByVisibleAnchorX(activeStrip, frag, anchorX);
            }

            return updateBoard();
        }

        if (e.code === 'ArrowDown' && frag)  {
            const anchorX = this.getVisibleAnchorX(activeStrip, frag);
            const unitWidth = frag.unitWidth - (e.shiftKey ? 1 : 4);
            frag.unitWidth = !unitWidth ? -2: unitWidth;

            if (anchorX != null) {
                frag.dataOffsetX = this.getStripOffsetDataXByVisibleAnchorX(activeStrip, frag, anchorX);
            }

            return updateBoard();
        }

        if (e.code === 'Home' && frag)  {
            frag.dataOffsetX = 0;

            return updateBoard();
        }

        if (e.code === 'End' && frag)  {
            frag.dataOffsetX = frag.rawData.length;

            return updateBoard();
        }

        //console.log('onKeyDown', e);
    }

    onKeyUp = (e: KeyboardEvent) => {
        if (['F12'].includes(e.code)) return;

        e.stopImmediatePropagation();
        e.preventDefault();

        const updateBoard = () => {
            this.board.drawBoard();
            this.setInfo(frag);
        }
        const activeStrip = this.board.activeStrip;
        const frag = this.board.activeFrag;

        // Period
        if (e.code === 'Period' && e.ctrlKey && frag)  {
            if (frag.fixDataX === frag.anchorDataX) {
                frag.fixDataX = null;
            } else {
                frag.fixDataX = frag.anchorDataX;
            }

            return updateBoard();
        }

        //console.log('onKeyUp', e);
    }

    getStripById(stripId: string): Strip | null {
        return this.board.strips.find(strimp => strimp.id === stripId) || null;
    }

    async saveProjectJson(fileName?: string) {
        // console.log('project.json', this.project.json)
        // console.log('this.strips', this.board.strips)

        fileName = fileName || this.project.fileName;
        const getZoneById = (id: string): TWaveZone | null => {
            return this.project.json.zones.find(zone => zone.id == id) || null;
        }

        for (let strip of this.board.strips) {
            const zone = getZoneById(strip.id);

            if (!zone) continue;

            const rawData = strip.frags[0].rawData;
            let audioBuffer = m.Sound.ctx.createBuffer(1, rawData.length, m.Sound.ctx.sampleRate);
            const view = audioBuffer.getChannelData(0);

            for (let i=0; i<rawData.length; i++) {
                view[i] = rawData[i];
            }

            const audioString = await m.utils.getStringFromAudioBuffer(audioBuffer, audioBuffer.sampleRate);
            zone.sampleRate = audioBuffer.sampleRate;
            zone.file = audioString;
        }

        const dataForSave = this.project.json;

        await FileService.writeTextFile(
          JSON.stringify(dataForSave, null, 4),
          {
              path: 'D:\\a_json_sound\\' + fileName,
          }
        );
    }

    async saveProject() {
        if (this.project.json && this.project.fileName && this.project.type === 'font') {
            await this.saveProjectJson();

            return;
        }

        const strip = this.getStripById('src');

        if (!strip) return;

        const rawData = strip.frags[0].rawData;

        if (!rawData.length) return;

        let audioBuffer = m.Sound.ctx.createBuffer(1, rawData.length, m.Sound.ctx.sampleRate);
        const view = audioBuffer.getChannelData(0);

        for (let i=0; i<rawData.length; i++) {
            view[i] = rawData[i];
        }

        const src = await m.utils.getStringFromAudioBuffer(audioBuffer);

        const data = {
            name: 'hello.json',
            src,
        };

        await FileService.writeTextFile(
          JSON.stringify(data, null, 4),
          {
              path: 'D:\\a_json_sound\\hello.json',
          }
        );
    }

    async playRawData(rawData: number[]) {
        let audioBuffer = m.Sound.ctx.createBuffer(1, rawData.length, m.Sound.ctx.sampleRate);
        const view = audioBuffer.getChannelData(0);

        for (let i=0; i<rawData.length; i++) {
            view[i] = rawData[i];
        }

        const audioBufferSourceNode = Sound.ctx.createBufferSource();
        audioBufferSourceNode.buffer = audioBuffer;
        audioBufferSourceNode.connect(Sound.ctx.destination); // Sound.masterGain

        audioBufferSourceNode.onended = () => {
            //audioBufferSourceNode.disconnect(Sound.masterGain);
            //Sound.masterGain.disconnect(audioBufferSourceNode);
            console.log('onend');
            audioBufferSourceNode.disconnect(Sound.ctx.destination);
        }

        audioBufferSourceNode.start(0);
    }

    getAnchorsRange(frag?: Frag): [number, number] {
        frag = frag || this.board.activeFrag;

        if (!frag) return [0, 0];

        const xRange = [frag.fixDataX || 0, frag.anchorDataX];
        xRange.sort((a, b) => (a - b));

        xRange[0] = xRange[0] < 0 ? 0 : xRange[0];
        xRange[1] = xRange[1] < 0 ? 0 : xRange[1];

        return xRange as any;
    }

    async playFragmentFromTo(minMsDur?: number) {
        const frag = this.board.activeFrag;

        if (!frag) return;

        const xRange = this.getAnchorsRange(frag);

        if (xRange[0] == xRange[1]) return;

        let fragData = frag.rawData.slice(xRange[0], xRange[1]+1);
        let rawData = [...fragData];

        if (minMsDur) {
            const length = Sound.ctx.sampleRate / 1000 * minMsDur;

            while (rawData.length < length) {
                rawData = [...rawData, ...fragData];
            }
        }

        await this.playRawData(rawData);
    }

    async playFragmentTo(from?: number, to?: number, count: number = 1) {
        const frag = this.board.activeFrag;

        if (!frag) return;

        let rawData = frag.rawData;

        to = to == null ? frag.anchorDataX + 1 : rawData.length - 1;

        rawData = rawData.slice(0, to);

        await this.playRawData(rawData);
    }

    async playFragmentFrom(from?: number, to?: number, count: number = 1) {
        const frag = this.board.activeFrag;

        if (!frag) return;

        let rawData = frag.rawData;

        from = from == null ? frag.anchorDataX : from;

        rawData = rawData.slice(from);

        await this.playRawData(rawData);
    }

    async playFragmentAll() {
        const frag = this.board.activeFrag;

        if (!frag) return;

        const rawData = frag.rawData;

        await this.playRawData(rawData);
    }

    stopRec() {
        if (this.recorder) {
            this.recorder.break();
            this.recorder = null;
        }
    }

    saveOgg () {
        const strip = this.board.activeStrip;

        if (!strip) return;

        const rawData = strip.frags[0].rawData;

        let audioBuffer = m.Sound.ctx.createBuffer(1, rawData.length, m.Sound.ctx.sampleRate);
        const view = audioBuffer.getChannelData(0);

        for (let i=0; i<rawData.length; i++) {
            view[i] = rawData[i];
        }

        const blob = m.utils.getBlobOggFromAudioBuffer(audioBuffer);

        WavRecorder.DownloadBlob('record', blob);

        // if (this.recorder) {
        //     this.recorder.break();
        //     this.recorder = null;
        // }
        //
        // this.recorder = new WavRecorder(m.Sound.ctx);
        // this.recorder.start();
        //
        // this.playFragment(() => {
        //     console.log('stop');
        //     this.recorder.stopAndSave();
        // });
    }
}
