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

  const rowCount = 52;
  const colCount = 13;
  const halfColCount = colCount / 2

  let width = x.width; // window.innerWidth;
  let height = x.height - headerHeight * 2; //window.innerHeight;

  let colSize = Math.floor(width / colCount);
  let rowSize = Math.floor(height / rowCount);

  let boardBassLeft = 0;
  let boardBassWidth = colSize * halfColCount;
  let boardSoloLeft = boardBassWidth;
  let boardSoloWidth = colSize * halfColCount;
  let boardHeight = rowSize * rowCount;

  return {
    width,
    height,
    boardHeight,
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

  freqListLeft: TFreqInfo[];
  freqListRight: TFreqInfo[];

  wave: WaveSource2;

  isSmoothMode = false;

  pointerIds: any = {

  }

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


  drawSide(type: string) {
    const sizes = this.sizes;
    const colSize = sizes.colSize
    const rowSize = sizes.rowSize
    const halfRow = rowSize / 2;
    const halfCol = colSize / 2;
    const twoRow = rowSize * 2;
    const fourRow = rowSize * 4;

    const leftX = type === 'left' ? colSize : colSize * 9

    const ctx = this.canvasCtxMid;
    const defStroke = 'rgb(0, 0, 0)';

    ctx.lineWidth = 1;
    ctx.strokeStyle = defStroke;
    ctx.fillStyle = `rgba(100, 100, 100, 1)`;
    
    ctx.beginPath();
    ctx.moveTo(leftX, twoRow);
    ctx.lineTo(leftX, sizes.boardHeight);
    ctx.stroke();    

    ctx.beginPath();
    ctx.moveTo(leftX + colSize*3, twoRow);
    ctx.lineTo(leftX + colSize*3, sizes.boardHeight);
    ctx.stroke();    

    const fs = 6;
    const hs = 3;

    for (let j = 0; j < 48; j++) {
      const restJ = j % 4;

      // горизонтальные разделители блоков
      ctx.strokeStyle = 'rgb(150, 150, 150)';
      ctx.lineWidth = 0.5;
      if (restJ === 3) {
        ctx.beginPath();
        ctx.moveTo(
          leftX,
          j * rowSize + twoRow + halfRow
        );
        ctx.lineTo(sizes.boardBassWidth, j * rowSize + twoRow + halfRow);
        ctx.stroke();
      }

      for (let i = 0; i < 4; i++) {
        const restI = i % 4;

        const x = leftX + i * colSize - hs;
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
  }

  drawCells() {
    this.drawSide('left')
    this.drawSide('right')
  } // drawCells

  setFreqListLeft(freqList: TFreqInfo[], botNote: string, topNote: string) {
    freqList = [...freqList];

    const newFreqList = getFreqList(freqList.reverse(), botNote, topNote);

    this.freqListLeft = newFreqList;
  }

  setFreqListRigth(freqList: TFreqInfo[], botNote: string, topNote: string) {
    freqList = [...freqList];

    const newFreqList = getFreqList(freqList.reverse(), botNote, topNote);

    this.freqListRight = newFreqList;
  }

  createCanvas(sizes: Sizes, canvasEl: HTMLElement) {
    this.sizes = sizes;
    // this.gutter = sizes.cellSize;
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

  drawCurrentCells() {
    this.clearCanvasTop();

    const ctx = this.canvasCtxTop;
    const sizes = this.sizes;
    const colSize = sizes.colSize;
    const rowSize = sizes.rowSize;
    const halfColSize = colSize / 2;
    const halfRowSize = rowSize / 2;
    const twoRowSize = rowSize * 2;
    const fourRowSize = rowSize * 4;

    Object.values(this.pointerIds).forEach((info: any) => {
      const leftX = info.boardSide === 'left' ? colSize : colSize * 9
      const leftX2 = info.boardSide === 'left' ? leftX + (colSize*4) : leftX - (colSize*2) - halfColSize;
      const cell = info.cell;

      ctx.fillRect(cell.x - halfColSize, cell.y, sizes.colSize, fourRowSize);
      ctx.fillRect(
        leftX2,
        cell.j * rowSize + twoRowSize + halfRowSize - 3,
        colSize + halfColSize,
        6
      );      
    })    
  }

  update(e: PointerEvent, onlyStop = false) {
    if (onlyStop) {
      const cell = this.pointerIds[e.pointerId] as {pointerId: number, note: string, instrCode: number}

      if (cell) {
        ideService.synthesizer.playSound({
          id: cell.pointerId,
          keyOrNote: cell.note,
          instrCode: cell.instrCode,
          onlyStop: true,
        });
      }

      delete this.pointerIds[e.pointerId]
      // this.drawCurrentCells()

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

    let boardSide = ''
    if (offsetX < (colSize*4 + halfColSize)) {
      boardSide = 'left'
    } else if (offsetX > (colSize*8 + halfColSize)){
      boardSide = 'right'
    }

    if (!boardSide) {
      this.drawCurrentCells()
      return
    }

    const leftX = boardSide === 'left' ? colSize : colSize * 9

    this.clearCanvasTop();
    ctx.fillStyle = fillStyle;

    const cell = {
      x: 0,
      i: 0,
      y: 0,
      j: 0,
      note: '',
    };

    const colX0 = leftX - halfColSize
    const colX1 = leftX - halfColSize + colSize
    const colX2 = leftX - halfColSize + colSize * 2
    const colX3 = leftX - halfColSize + colSize * 3

    // определение колонки
    if (offsetX < colX1) {
      cell.x = colX0 + halfColSize;
      cell.i = 0;
    } else if (offsetX < colX2) {
      cell.x = colX1 + halfColSize;
      cell.i = 1;
    } else if (offsetX < colX3) {
      cell.x = colX2 + halfColSize;
      cell.i = 2;
    } else {
      cell.x = colX3 + halfColSize;
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

    cell.j = row;
    cell.y = rowSize * 2 + halfRowSize + row * rowSize - rowSize * 2;

    const note = boardSide === 'left' ? this.freqListLeft[row] : this.freqListRight[row];

    const pointInfo = {
      pointerId: e.pointerId,
      note: note?.noteLat,
      instrCode: this.instrCode,
      cell,
      boardSide
    }

    if (note) {
      this.pointerIds[e.pointerId] = pointInfo
    }    

    if (note) {
      this.lastNote = note.noteLat;
      cell.note = note.noteLat;
      ideService.synthesizer.playSound({
        id: e.pointerId,
        keyOrNote: note.noteLat,
        instrCode: this.instrCode,
      });

      this.drawCurrentCells()
    }
  } // update

  subscribe() {
    const pos = getPosition(this.canvasTop);
    this.sizes.boardTopOffset = pos.y;
    this.sizes.boardLeftOffset = pos.x;

    this.canvasTop.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!this.pointerIds[e.pointerId]) {
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

      if (this.pointerIds[e.pointerId]) {
        this.update(e, true);
      }
    });

    this.canvasTop.addEventListener('pointerleave', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.pointerIds[e.pointerId] && e.buttons) {
        this.update(e, true);
      }
    });

    this.canvasTop.addEventListener('pointercancel', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.pointerIds[e.pointerId]) {
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
    boardsEl.style.width = `${sizes.width * 2}px`;
    boardsEl.style.height = `${sizes.boardHeight}px`;

    let boardBassEl = getWithDataAttr('board-bass-container')[0];
    boardBassEl.style.top = `0px`;
    boardBassEl.style.left = `${sizes.boardBassLeft}px`;
    boardBassEl.style.width = `${sizes.boardBassWidth * 2}px`;
    boardBassEl.style.height = `${sizes.boardHeight}px`;

    let canvasBassEl = getWithDataAttr('board-bass-canvas-container')[0];
    canvasBassEl.style.top = `0px`;
    canvasBassEl.style.left = `0px`;
    canvasBassEl.style.width = `${sizes.boardBassWidth * 2}px`;
    canvasBassEl.style.height = `${sizes.boardHeight}px`;

    // BASS BOARD
    this.bassBoard = new Board('bass', 'leftToRight');
    // du dy do da
    this.bassBoard.setFreqListLeft(freqInfoList, 'du', 'ba');
    this.bassBoard.setFreqListRigth(freqInfoList, 'dy', 'be');
    this.bassBoard.createCanvas(
      {
        ...sizes,
        width: sizes.boardBassWidth * 2,
        height: sizes.boardHeight,
      },
      canvasBassEl
    );
    this.bassBoard.drawCells();
    // this.bassBoard.wave = new WaveSource2();
    // this.bassBoard.wave.connect(Sound.ctx.destination);
    // this.bassBoard.wave.start();
    this.bassBoard.subscribe();
  } // setContent
}

// дтрнмфвсзлкбдтрнмфвсзлкбдтрнмфвсзлкб
