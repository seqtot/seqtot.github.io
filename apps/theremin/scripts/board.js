'use strict';

class FreqAndVolBoard {
  constructor(type) {
    // freqAndVol noteAndVol
    this.type = type || 'freqAndVol';
    this.canvasMid = null;
    this.canvasCtxMid = null;
    this.canvasTop = null;
    this.canvasCtxTop = null;
    this.canvasBot = null;
    this.canvasCtxBot = null;
    
    this.gutter = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastFreqObj = null;
    this.lastFreqVal = 0;
    this.lastVolVal = 0;

    this.isSmoothMode = true;
    this.freqList = null;

    this.boardEl = null;
    this.canvasEl = null;
    this.sizes = null;

    this.isSilent = false;
    this.record = null;
  }

  createCanvas(sizes, canvasEl) {
      this.sizes = sizes;
      this.gutter = sizes.cellSize;
      this.canvasEl = canvasEl;
    
      // this.boardEl = getWithDataAttr('board-container')[0];
      // this.canvasEl = getWithDataAttr('board-canvas-container')[0];
      
      //div.style.position = "absolute";
      //boardEl.style.width  = `${BOARD_WIDTH}px`;
      //boardEl.style.height = `${BOARD_HEIGHT}px`;
      //div.style.top = `${boardTopOffset}px`;

      //this.boardEl.style.left = `${sizes.boardLeftOffset}px`;

      this.canvasEl.style.width  = `${sizes.boardWidth}px`;
      this.canvasEl.style.height = `${sizes.boardHeight}px`;
    
      // BOT TOM
      this.canvasBot = document.createElement('canvas');
      this.canvasBot.style.position = "absolute";
      //canvas.id     = "CursorLayer";
      this.canvasBot.width  = sizes.boardWidth;
      this.canvasBot.height = sizes.boardHeight;
      //canvas.style.zIndex = 8;
    
      //canvas.style.border   = "1px solid";
      this.canvasEl.appendChild(this.canvasBot);
      this.canvasCtxBot = this.canvasBot.getContext("2d");
    
      // MID CANVAS
      this.canvasMid = document.createElement('canvas');
      this.canvasMid.style.position = "absolute";
      //canvas.id     = "CursorLayer";
      this.canvasMid.width  = sizes.boardWidth;
      this.canvasMid.height = sizes.boardHeight;
      //canvas.style.zIndex = 8;
    
      //canvas.style.border   = "1px solid";
      this.canvasEl.appendChild(this.canvasMid);
      this.canvasCtxMid = this.canvasMid.getContext("2d");
    
      // TOP CANVAS
      this.canvasTop = document.createElement('canvas');
      //canvas.id     = "CursorLayer";
      this.canvasTop.style.position = "absolute";
      this.canvasTop.width  = sizes.boardWidth;
      this.canvasTop.height = sizes.boardHeight;
      //canvas.style.zIndex = 8;
      //canvas.style.border   = "1px solid";
      this.canvasEl.appendChild(this.canvasTop);
    
      this.canvasCtxTop = this.canvasTop.getContext("2d");
    
      //document.body.appendChild(div);
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
    const height = this.sizes.boardHeight - (gutter*2);
    const width = this.sizes.boardWidth - (gutter*2);
    const ctx = this.canvasCtxMid;
    const cellSize = this.sizes.cellSize;

    this.clearCanvasMid();
    const defStroke = 'rgb(230, 230, 230)';
    //const midStroke = 'rgb(250, 190, 190)';
    const midStroke = defStroke;

    // линия слева ячейки
    this.freqList.forEach((item, i) => {
      ctx.strokeStyle = defStroke;
      ctx.lineWidth = .5;

      // if ((i % 6) === 0) {
      //   canvasCtx.lineWidth = 1;
      //   canvasCtx.strokeStyle = 'gray';
      // }

      if (item.step === 'd' && this.type === 'freqAndVol') {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.fillRect(zeroX + (i * cellSize) + cellSize/2, gutter/2 , 2, 2);
        ctx.fillRect(zeroX + (i * cellSize) + cellSize/2, gutter + height + gutter/2 , 2, 2);
      }

      ctx.strokeStyle = defStroke;
      ctx.lineWidth = .5;
      ctx.beginPath();
      ctx.moveTo(zeroX + (i * cellSize), zeroY);
      ctx.lineTo(zeroX + (i * cellSize), zeroY + height);
      ctx.stroke();
    });

    volumeList.forEach((item, i) => {
      if (item.value === 100 ) {
        if (i > 0) {
          return;
        }

        ctx.lineWidth = .5;
        ctx.strokeStyle = defStroke;
        ctx.beginPath();
        ctx.moveTo(zeroX, zeroY);
        ctx.lineTo(zeroX + width, zeroY);
        ctx.stroke();

        return;
      }

      // if (item.value === 52.5 || item.value === 47.5 ) {
      //   ctx.lineWidth = .5;
      //   ctx.strokeStyle = 'red';
      //   ctx.beginPath();
      //   ctx.moveTo(zeroX, (i * cellSize) + zeroY);
      //   ctx.lineTo(zeroX + width, (i * cellSize) + zeroY);
      //   ctx.stroke();

      //   return;
      // }

      if (item.value === 0) {
        ctx.lineWidth = .5;
        ctx.strokeStyle = defStroke;

        if (i === (volumeList.length - 1)) {
          ctx.beginPath();
          ctx.moveTo(zeroX, ((i+1) * cellSize) + zeroY);
          ctx.lineTo(zeroX + width, ((i+1) * cellSize) + zeroY);
          ctx.stroke();

          return;
        }
      }

      
      ctx.strokeStyle = defStroke;

      if (item.isMiddle) {
        ctx.strokeStyle = midStroke;
      }

      ctx.lineWidth = .5;

      ctx.beginPath();
      ctx.moveTo(zeroX, (i * cellSize) + zeroY);
      ctx.lineTo(zeroX + width, (i * cellSize) + zeroY);
      ctx.stroke();    

      // if ((i % 6) === 0) {
      //   canvasCtx.lineWidth = 1;
      //   canvasCtx.strokeStyle = 'gray';
      // }

      // if (i=== 0 || (i % 12) === 0) {
      //   canvasCtx.lineWidth = 2;
      //   canvasCtx.strokeStyle = 'red';
      // }


      // canvasCtx.beginPath();
      // canvasCtx.moveTo(0, i * cellSize);
      // canvasCtx.lineTo(BOARD_WIDTH, i * cellSize);
      // canvasCtx.stroke();
    });
  } // drawCells

  update(e) {
    const gutter = this.gutter;
    const cellSize = this.sizes.cellSize;
    const halfSize = this.sizes.halfSize;
    const sizes = this.sizes;
  
    if (e.offsetX <= gutter ||
        e.offsetX >= (sizes.boardWidth - gutter) ||
        e.offsetY <= gutter ||
        e.offsetY >= (sizes.boardHeight - gutter) ||
        this.isSilent
    ) {
      return;
    }
  
    // if (e.buttons) {
    //   canvasCtx.fillStyle = "green";
    //   canvasCtx.fillRect(CurX, CurY , 1, 1);
    // }
  
      let curX = Math.round(e.offsetX);
      let curY = Math.round(e.offsetY);
      let changed = false;

      if (curX !== this.lastX) {
        this.lastX = curX;
        changed = true;
  
        const locX = curX - gutter;
        const indSolo = Math.floor(locX / cellSize);

        if (this.freqList[indSolo]) {
          this.lastFreqObj = this.freqList[indSolo];
        }

        let freqVal = this.lastFreqObj.value;
        let type2 = app.soloWave.type1;
  
        if (this.isSmoothMode) {
          let lftFRange = this.lastFreqObj.mid  - this.lastFreqObj.low;
          let rghFRange = this.lastFreqObj.high - this.lastFreqObj.mid;
   
          let lftX = (cellSize * indSolo);
          let rghX = (cellSize * (indSolo + 1)) - 1;
          let midX = lftX + halfSize + 1;
    
          let lftFact = lftFRange / (midX - lftX);
          let rghFact = rghFRange / (rghX - midX);

          if (locX === midX) {
            type2 = 'sawtooth';
          }
          else if (locX < midX) {
            freqVal = freqVal - (lftFact * ((midX - locX)));
          }
          else {
            freqVal = freqVal + (rghFact * ((locX - midX)));
          }  
        }
    
        this.lastFreqVal = freqVal;
        app.soloWave.setFreq(freqVal);
        app.soloWave.setType2(type2);
      }
  
      if (curY !== this.lastY) {
        this.lastY = curY;
        changed = true;
  
        let vol = 0;
  
        if (curY <= (gutter + cellSize + cellSize)) {
            vol = 100;
        }
        else if (curY >= (sizes.boardHeight - gutter - cellSize - cellSize)) {
            vol = 0;
        } 
        else {
            const height = sizes.boardHeight - (gutter*2) - (cellSize*4);
            const locY = curY - gutter - (cellSize*2);
            vol = (1 - (locY / height)) * 100;
        }
  
        //console.log(outVol, vol, getEndPointVolume(vol) * (outVol/100));
        let freqVol = this.lastFreqObj ? this.lastFreqObj.volume : 0;
        let lastVolVal = vol * freqVol;
        this.lastVolVal = lastVolVal;
  
        app.soloWave.setVol(
          getEndPointVolume(lastVolVal * app.outVol / 100) / 100
        );
      }

      if (changed && this.record) {
        if (!this.lastVolVal && !this.record[this.record.length - 1]) {
          return;
        }
        
        this.record.push(
          Date.now(), this.lastFreqVal, this.lastVolVal
        );
      }
  } // update

  setFreqList(freqList, botNote, topNote) {
    const botCode = freqList.find(item => item.noteLat === botNote).code;
    const topCode = freqList.find(item => item.noteLat === topNote).code;
  
    let list = freqList.filter(item => item.code >= botCode && item.code <= topCode);
  
    list.forEach((item, i) => {
      item.relatives = list.map((iItem, i) => iItem.step === item.step ? i : -1).filter(ind => ind > -1);
      item.index = i;
    });
  
    this.freqList = list;
  }  

  drawBackNote(info) {
    const gutter = this.gutter;
    const cellSize = this.sizes.cellSize;
    const boardHeight = this.sizes.boardHeight;
  
    this.clearCanvasBot();
    info = this.freqList.find(item => item.step === info.step);
  
    info.relatives.forEach((i) => {
      this.canvasCtxBot.fillStyle = `rgb(250, 250, 250)`;
      this.canvasCtxBot.fillRect((gutter + (i * cellSize)) , 0 , cellSize, boardHeight);
    });
  
    //console.log(info);
  } // drawBackNote

  setFreqListByNote(text) {
    text = text
      .split(' ')
      .filter(item => !!item);

    const list = text
      .map(noteLat => freqList.find(item => item.noteLat === noteLat))
      .filter(item => !!item);

    
    if (!list.length) return;

    this.clearCanvasMid();

    const first = { ...list[0]};
    first.low = first.mid;
    first.high = first.mid;
    first.volume = 0;

    const outList = [];

    list.forEach((curr, i) => {
      let prev = list[i-1];
      let next = list[i+1];

      if (prev) prev = {...prev};
      if (next) next = {...next};      

      curr = {...curr};
      curr.isReal = true;

      outList.push(curr);

      if (next) {
        const nextLow = next.low;

        next.low =  curr.high;
        next.high = nextLow;
        next.value = ((next.high - next.low) /2) + next.low;
        next.mid = next.value;

        outList.push(next);
      }
    });

    outList.forEach((item, i) => {
      item.relatives = [];
      item.index = i;
    });

    this.freqList = outList;
    this.drawCells();

    // draw back
    const gutter = this.gutter;
    const cellSize = this.sizes.cellSize;
    const boardHeight = this.sizes.boardHeight;
  
    this.clearCanvasBot();

    outList.forEach((item, i) => {
      if (item.isReal) {
        this.canvasCtxBot.fillStyle = `rgb(250, 250, 250)`;
        this.canvasCtxBot.fillRect((gutter + (i * cellSize)) , 0 , cellSize, boardHeight);
      }
    });
  
    //console.log('outList', outList);
  } // setFreqListByNote

} // FreqAndVolBoard.class

