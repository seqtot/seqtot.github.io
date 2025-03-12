import { Muse as m, Sound, TFreqInfo } from '../../libs/muse';

import { getWithDataAttr } from '../../src/utils';
import { WaveSource2 } from './wave-source';
import { RouteInfo } from '../../src/router';
import { ideService } from '../ide/ide-service';

type WithId = { id: string };

const outVol = 80;
const freqInfoList = m.const.freqInfoList;

function getPosition(element) {
  let xPosition = 0;
  let yPosition = 0;

  while (element) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
    yPosition += element.offsetTop - element.scrollTop + element.clientTop;
    element = element.offsetParent;
  }
  return { x: xPosition, y: yPosition };
}

function getFreqList(
  freqList: TFreqInfo[],
  botNote: string,
  topNote: string
): TFreqInfo[] {
  const botCode = freqList.find((item) => item.noteLat === botNote)!.code;
  const topCode = freqList.find((item) => item.noteLat === topNote)!.code;

  let list = freqList
    .filter((item) => item.code >= botCode && item.code <= topCode)
    .map((item) => ({ ...item }));

  list.forEach((item, i) => {
    item.relatives = list
      .map((iItem, i) => (iItem.step === item.step ? i : -1))
      .filter((ind) => ind > -1);
    item.index = i;
  });

  return list;
}

type Sizes = {
  width: number;
  height: number;
  boardHeight: number;

  cellSize: number;
  halfSize: number;

  colSize: number;
  rowSize: number;
  headerHeight: number;

  boardSoloWidth: number;
  boardSoloLeft: number;
  boardBassLeft: number;
  boardBassWidth: number;
  boardLeftOffset: number;
  boardTopOffset: number;
};

function getSizes(x: {
  width: number;
  height: number;
  cellCount: number;
}): Sizes {
  //console.log(getPosition(this.bassBoard.canvasEl));

  let headerHeight = Math.ceil(
    getWithDataAttr('app-header-first-row-area')[0].clientHeight
  );

  console.log('headerHeight', headerHeight);

  const rowCount = 52;
  const colCount = 14;
  const halfColCount = 7;

  let width = x.width; // window.innerWidth;
  let height = x.height - headerHeight * 2; //window.innerHeight;

  let colSize = Math.floor(width / colCount);
  let rowSize = Math.floor(height / rowCount);

  // let boardWidth = pageWidth - 64;
  // let boardHeight = 0;
  let halfSize = Math.floor(
    (height - (x.cellCount + 2)) / (x.cellCount + 2) / 2
  );
  let cellSize = halfSize * 2 + 1;

  const halfWidth = Math.floor(width / cellSize / 2) * cellSize;

  //let boardSoloWidth = halfWidth; //Math.floor(width / cellSize);
  //boardSoloWidth = boardSoloWidth - 3;
  //boardSoloWidth = boardSoloWidth * cellSize;
  //let boardBassLeft = 0;
  // let boardBassWidth = halfWidth; // cellSize * 3;
  let boardBassLeft = 0;
  let boardBassWidth = colSize * halfColCount;
  let boardSoloLeft = boardBassWidth;
  let boardSoloWidth = colSize * halfColCount;
  let boardHeight = rowSize * rowCount;

  // let boardHeight = x.cellCount * cellSize + cellSize * 2;

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
    colSize,
    rowSize,
    headerHeight,
  };
}

class Board {
  instrCode = m.DEFAULT_TONE_INSTR;
  lastNote: string = '';
  lastCells = [];

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

  constructor(
    public type: 'bass' | 'solo',
    public volDirection: 'rightToLeft' | 'leftToRight'
  ) {}

  clearCanvasTop() {
    this.canvasCtxTop.clearRect(
      0,
      0,
      this.canvasTop.width,
      this.canvasTop.height
    );
  }

  clearCanvasBot() {
    this.canvasCtxBot.clearRect(
      0,
      0,
      this.canvasBot.width,
      this.canvasBot.height
    );
  }

  clearCanvasMid() {
    this.canvasCtxMid.clearRect(
      0,
      0,
      this.canvasMid.width,
      this.canvasMid.height
    );
  }

  drawCells() {
    const sizes = this.sizes;
    const ctx = this.canvasCtxMid;
    const defStroke = 'rgb(0, 0, 0)';

    ctx.lineWidth = 1;
    ctx.strokeStyle = defStroke;
    ctx.fillStyle = `rgba(100, 100, 100, 1)`;

    const halfRow = sizes.rowSize / 2;
    const halfCol = sizes.colSize / 2;
    const twoRow = sizes.rowSize * 2;
    const fourRow = sizes.rowSize * 4;

    ctx.strokeRect(
      sizes.colSize * 5 + halfCol,
      twoRow,
      sizes.colSize * 2 - halfCol,
      sizes.height - fourRow
    );

    const fs = 4;
    const hs = 2;

    for (let j = 0; j < 48; j++) {
      const restJ = j % 4;

      ctx.strokeStyle = 'rgb(200, 200, 200)';
      ctx.lineWidth = 0.5;
      if (restJ === 3) {
        ctx.beginPath();
        ctx.moveTo(
          sizes.colSize + halfCol,
          j * sizes.rowSize + twoRow + halfRow
        );
        ctx.lineTo(sizes.boardBassWidth, j * sizes.rowSize + twoRow + halfRow);
        ctx.stroke();
      }

      for (let i = 0; i < 4; i++) {
        const restI = i % 4;
        console.log(i, i % 4);

        const x = sizes.colSize + i * sizes.colSize + sizes.colSize / 2 - hs;
        const y = twoRow + j * sizes.rowSize + sizes.rowSize / 2 - hs;

        if (
          (restI === 0 && restJ === 3) ||
          (restI === 1 && restJ === 2) ||
          (restI === 2 && restJ === 1) ||
          (restI === 3 && restJ === 0)
        )
          ctx.fillRect(x, y, fs, fs);
      }
    }
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
    this.canvasBot.style.position = 'absolute';
    this.canvasBot.width = sizes.width;
    this.canvasBot.height = sizes.height;
    // this.canvasEl.style.border   = "1px solid gray";
    this.canvasEl.appendChild(this.canvasBot);
    this.canvasCtxBot = this.canvasBot.getContext('2d')!;

    // MID CANVAS
    this.canvasMid = document.createElement('canvas');
    this.canvasMid.style.position = 'absolute';
    this.canvasMid.width = sizes.width;
    this.canvasMid.height = sizes.height;
    this.canvasEl.appendChild(this.canvasMid);
    this.canvasCtxMid = this.canvasMid.getContext('2d')!;

    // TOP CANVAS
    this.canvasTop = document.createElement('canvas');
    this.canvasTop.style.position = 'absolute';
    this.canvasTop.width = sizes.width;
    this.canvasTop.height = sizes.height;
    this.canvasEl.appendChild(this.canvasTop);
    this.canvasCtxTop = this.canvasTop.getContext('2d')!;
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
    const colSize = sizes.colSize;
    const rowSize = sizes.rowSize;
    const halfColSize = colSize / 2;
    const halfRowSize = rowSize / 2;
    const twoRowSize = rowSize * 2;
    const fourRowSize = rowSize * 4;
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;
    const fillStyle = `rgba(250, 0, 0, .5)`;
    const ctx = this.canvasCtxTop;

    this.clearCanvasTop();
    ctx.fillStyle = fillStyle;

    const cell = {
      x: 0,
      i: 0,
      y: 0,
      j: 0,
      note: '',
    };

    // определение колонки
    if (offsetX < colSize * 2) {
      cell.x = colSize;
      cell.i = 0;
    } else if (offsetX >= colSize * 2 && offsetX < colSize * 3) {
      cell.x = colSize * 2;
      cell.i = 1;
    } else if (offsetX >= colSize * 3 && offsetX < colSize * 4) {
      cell.x = colSize * 3;
      cell.i = 2;
    } else {
      cell.x = colSize * 4;
      cell.i = 3;
    }

    // определение строки
    let row = Math.max(Math.floor(offsetY / rowSize) - 2, 0);
    row = Math.min(row, 47);
    const boxInd = Math.max(
      Math.floor((offsetY - twoRowSize) / (rowSize * 4)),
      0
    );
    const rowInBox = Math.abs(row - boxInd * 4);
    const boxRow = boxInd * 4;

    if (cell.i === 0) {
      if (rowInBox === 2 || rowInBox === 3) {
        row = boxRow + 3;
      } else {
        row = boxRow - 4 + 3;
      }
    }

    if (cell.i === 1) {
      if (rowInBox === 1 || rowInBox === 2 || rowInBox === 3) {
        row = boxRow + 2;
      } else {
        row = boxRow - 4 + 2;
      }
    }

    if (cell.i === 2) {
      row = boxRow + 1;
    }

    if (cell.i === 3) {
      if (rowInBox === 0 || rowInBox === 1) {
        row = boxRow;
      } else {
        row = boxRow + 4;
      }
    }

    console.log('rowInBox', row, rowInBox);

    cell.j = row;
    cell.y = rowSize * 2 + halfRowSize + row * rowSize - rowSize * 2;

    const note = this.freqList[row];
    ctx.fillRect(cell.x, cell.y, sizes.colSize, fourRowSize);
    ctx.fillRect(
      colSize * 5 + halfColSize,
      cell.j * rowSize + twoRowSize + halfRowSize - 3,
      colSize + halfColSize,
      6
    );

    if (note) {
      this.lastNote = note.noteLat;
      cell.note = note.noteLat;
      ideService.synthesizer.playSound({
        id: this.type,
        keyOrNote: note.noteLat,
        instrCode: this.instrCode,
      });
    }
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

    // this.canvasTop.addEventListener("pointerenter", (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();

    //   if (!this.pointerId && e.buttons) {
    //     this.pointerId = e.pointerId;
    //   }

    //   if (e.pointerId === this.pointerId && e.buttons) {
    //     this.update(e);
    //   }
    // });

    // this.canvasTop.addEventListener("pointermove", (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();

    //   if (!this.pointerId && e.buttons) {
    //     this.pointerId = e.pointerId;
    //   }

    //   if (e.pointerId === this.pointerId && e.buttons) {
    //     this.update(e);
    //   }
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

export class ThereminPage2 {
  bassBoard: Board;
  soloBoard: Board;

  get pageId(): string {
    return this.props.data.id;
  }

  get pageEl(): HTMLElement {
    return document.getElementById('app-route')!;
  }

  constructor(public props: RouteInfo<WithId>) {}

  onMounted() {
    this.setContent();
  }

  onUnmounted() {}

  setContent() {
    const stl =
      'position: absolute; box-sizing: border-box; user-select: none; touch-action: none;';
    const stl2 =
      'style="box-sizing: border-box; user-select: none; touch-action: none;"';

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
      cellCount: 36,
    });

    console.log('sizes', sizes);

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
    // du dy do da
    this.bassBoard.setFreqList(freqInfoList, 'du', 'ba');
    this.bassBoard.createCanvas(
      {
        ...sizes,
        width: sizes.boardBassWidth,
        height: sizes.boardHeight,
      },
      canvasBassEl
    );
    this.bassBoard.drawCells();
    // this.bassBoard.wave = new WaveSource2();
    // this.bassBoard.wave.connect(Sound.ctx.destination);
    // this.bassBoard.wave.start();
    this.bassBoard.subscribe();

    // // SOLO BOARD
    // this.soloBoard = new Board("solo", "rightToLeft");
    // this.soloBoard.setFreqList(freqInfoList, "da", "bi");
    // this.soloBoard.createCanvas(
    //   {
    //     ...sizes,
    //     width: sizes.boardSoloWidth,
    //   },
    //   canvasSoloEl
    // );
    // this.soloBoard.drawCells();
    // this.soloBoard.wave = new WaveSource2();
    // this.soloBoard.wave.connect(Sound.ctx.destination);
    // this.soloBoard.wave.start();
    // this.soloBoard.subscribe();
  } // setContent
}

// дтрнмфвсзлкбдтрнмфвсзлкбдтрнмфвсзлкб
