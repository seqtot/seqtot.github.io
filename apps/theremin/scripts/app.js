'use strict';

let soloBotNote = 'dy';
let soloTopNote = 'be';

let sizes = {
  pageWidth: 0,
  pageHeight: 0,
  boardWidth: 0,
  boardHeight: 0,
  boardTopOffset: 0,
  boardLeftOffset: 0,
  cellSize: 0,
  halfSize: 0,
};

class App {
  constructor() {
    this.isAppInit = false;

    this.playSolo = false;
    this.playBack = false;
    this.playReco = false;

    this.soloWave = new WaveSource2();
    this.backWave = new WaveSource2();

    this.outVol = 70;

    this.ticker = new Ticker(audioCtx);
    this.freqAndVolBoard = new FreqAndVolBoard('freqAndVol');
    this.noteAndVolBoard = new FreqAndVolBoard('noteAndVol');
  }

  useReco(flag) {
    this.initWave();

    if (flag && !this.playReco) {
      this.playSolo = false;
      this.freqAndVolBoard.isSilent = true;

      this.playReco = true;
      this.noteAndVolBoard.isSilent = false;

      this.soloWave.connect(audioCtx.destination);
    }
    else if (!flag && this.playReco) {
      this.playReco = false;
      this.soloWave.disconnect(audioCtx.destination);
    }
  }

  useSolo(flag) {
    this.initWave();

    if (flag && !this.playSolo) {
      this.playSolo = true;
      this.freqAndVolBoard.isSilent = false;
      this.playReco = false;
      this.noteAndVolBoard.isSilent = true;

      this.soloWave.connect(audioCtx.destination);
    }
    else if (!flag && this.playSolo) {
      this.playSolo = false;
      this.freqAndVolBoard.isSilent = true;

      this.soloWave.disconnect(audioCtx.destination);
    }
  }

  useBack(flag) {
    this.initWave();
    
    if (flag && !this.playBack) {
      this.playBack = true;
      this.backWave.connect(audioCtx.destination);
    }
    else if (!flag && this.playBack) {
      this.playBack = false;
      this.backWave.disconnect(audioCtx.destination);
    }
  }

  initWave() {
    if (this.isAppInit) {
      return;
    }

    this.isAppInit = true;
    this.soloWave.start();
    this.backWave.start();
  }

  startBeat(text) {
    text = (text || '').trim();

    const bpm = muse.getBpmFromString(text, 90);
    const repeat = muse.getRepeatFromString(text, 10);
    const prebeat = muse.getPrebeatFromString(text, 4);

    this.ticker.stopTick();

    this.ticker.createTickSource({
        //qms: Math.round(60000/ this.bpmValue),
        qms: 60000/bpm,
        preset1: window._drum_56_0_SBLive_sf2, // cowbell
        //preset2: ideService.synthesizer.instruments['drum_80'],
        repeat,
        //signature,
        cb: (data) => {
        //console.log('data', data);
        },
    });

    // app.soloWave.toggleType();
    // console.log(app.soloWave.type1, app.soloWave.type2);
  }

  stopBeat() {
    this.ticker.stopTick();    
  }

  startRecord(text) {
    text = (text || '').trim();

    const bpm = muse.getBpmFromString(text, 90);
    const repeat = muse.getRepeatFromString(text, 10);
    const prebeat = muse.getPrebeatFromString(text, 4);

    this.ticker.stopTick();
    let board = null;

    if (this.playSolo) {
      board = this.freqAndVolBoard;
    }
    if (this.playReco) {
      board = this.noteAndVolBoard;
    }

    if (board) {
      board.record = [];
    }

    this.ticker.createTickSource({
        //qms: Math.round(60000/ this.bpmValue),
        qms: 60000/bpm,
        preset1: window._drum_56_0_SBLive_sf2, // cowbell
        //preset2: ideService.synthesizer.instruments['drum_80'],
        repeat,
        //signature,
        cb: (data) => {
          if (data.type === 'stop') {
            //console.log('record.data', board ? board.record : null);
            //board.record = null;
          }
        },
    });
  }

  stopRecord() {
    this.ticker.stopTick();
  }
}

const app = new App();

function skipEvent (e, result) {
  e.preventDefault();
  e.stopPropagation();

  return result;
}


// ctrlKey ControlLeft ControlRight

function keyHandler(e, isUp) {
  //console.log('keyHandler', e);

  const board = app.freqAndVolBoard;

  if (e.code === 'F5') {
    return;
  }

  // F1 - useSolo
  if (e.code === 'F1') {
    skipEvent(e);

    if (isUp) {
      app.useSolo(!app.playSolo);
    }

    return;
  }  

  // F2 - useBack
  if (e.code === 'F2') {
    skipEvent(e);

    if (isUp) {
      app.useBack(!app.playBack);
    }

    return;
  }

    // F1 - useSolo
    if (e.code === 'F3') {
      skipEvent(e);
  
      if (isUp) {
        app.useReco(!app.playReco);
      }
  
      return;
    }  

  // Escape
  if (e.code === 'Escape') {
    skipEvent(e);

    if (isUp) {
      app.useSolo(false);
      app.useReco(false);
      app.useBack(false);
    }

    return;
  }  

  // Delete
  if (e.code === 'Delete' && app.playBack) {
    skipEvent(e);

    if (isUp) {
      getWithDataAttr('note-input')[0].value = '';
    }

    return;
  }  

  // Insert
  if (e.code === 'Insert' && app.playBack) {
    skipEvent(e);

    if (isUp) {
      let text = (getWithDataAttr('note-input')[0].value || '').trim();

      app.noteAndVolBoard.setFreqListByNote(text);
    }

    return;
  }  

  // ctrlKey ControlLeft ControlRight

  if (e.code === 'KeyB') {
    if (e.ctrlKey || !app.playBack ) {
        skipEvent(e);

        if (isUp) {
          if (app.ticker.tickSource) {
            app.stopBeat();
          } else {
            const text = getWithDataAttr('settings-input')[0].value.trim();
            app.startBeat(text);
          }
        }

        return;
    }
  }  

  if (e.code === 'KeyR') {
    if (e.ctrlKey || !app.playBack ) {
        skipEvent(e);

        if (isUp) {
          if (app.ticker.tickSource) {
            app.stopRecord();
          } else {
            const text = getWithDataAttr('settings-input')[0].value.trim();
            app.startRecord(text);
          }
        }

        return;
    }
  }

  if (app.playBack && !e.ctrlKey) {
    let noteInfo = keysToNoteLat[e.code];

    if(noteInfo) {
      skipEvent(e);

      if (isUp) {
        if (app.backWave.lastKey === e.code) {
          app.backWave.setFreqAndVol(0, 0);
          app.backWave.lastKey = null;
        }
      } else {
        if (e.repeat) return;
  
        app.backWave.lastKey = e.code;
        app.backWave.setFreqAndVol(noteInfo.value, 0.02);
        app.freqAndVolBoard.drawBackNote(noteInfo);
        const input = getWithDataAttr('note-input')[0];
  
        input.value = input.value + ' ' + noteInfo.noteLat;
      }
  
      return;
    }
  }

  // sine triangle sawtooth square
  if (e.code === 'Backquote' && isUp) {
    app.soloWave.setType2('sine')

    return;
  }

  if (e.code === 'Digit1'  && isUp) {
    app.soloWave.setType2('triangle')

    return;
  }

  if (e.code === 'Digit2'  && isUp) {
    app.soloWave.setType2('sawtooth')

    return;
  }

  if (e.code === 'Digit3' && isUp) {
    app.soloWave.setType2('square')

    return;
  }

  if (e.code === 'KeyC' && isUp) {
    board.clearCanvasTop();
    board.clearCanvasBot();

    return;
  }

  if (e.code === 'KeyS' && isUp) {
    board.isSmoothMode = !board.isSmoothMode;

    return;
  }

}


window.addEventListener('keydown', e => {
  if (e.code === 'F1') {
    e.preventDefault();
  }

  // if (e.code === 'Tab' && app.useBack) {
  //   e.preventDefault();
  // }

  //console.log('window keydown', e.code);

  keyHandler(e, 0);
});

window.addEventListener('keyup', e => {
  if (e.code === 'F1') {
    e.preventDefault();
  }  

  //console.log('window keyup', e.code);

  keyHandler(e, 1);
});

// document.body.addEventListener('keydown', e => {
//   console.log('doc keydown', e.code);
//   keyHandler(e, 0)
// });

// document.body.addEventListener('keyup', e => {
//   console.log('doc keyup', e.code);  
//   keyHandler(e, 1)  
// });

function getSizes(freqList) {
  let pageWidth = window.innerWidth;
  let pageHeight = window.innerHeight;
  let boardWidth = pageWidth - 64;
  let boardHeight = 0;
  let cellSize = 0;
  let halfSize = 0;

  cellSize = Math.floor(boardWidth / (freqList.length + 2));
  cellSize = Math.floor(cellSize / 2) * 2;
  halfSize = cellSize / 2;
  cellSize = cellSize + 1;
  
  boardWidth = (freqList.length * cellSize) + (cellSize * 2);
  boardHeight = (volumeList.length * cellSize) + (cellSize * 2);

  const boardLeftOffset = Math.floor((pageWidth - boardWidth) / 2);
  const boardTopOffset = Math.floor((pageHeight - boardHeight) / 2);

  return {
    pageWidth, 
    pageHeight,
    boardWidth,
    boardHeight,
    cellSize,
    halfSize,
    boardLeftOffset,
    boardTopOffset,
  }
}

function toggleMute(what) {
    const mute = document.querySelector(".mute");

    // if (!what || what === 'bass') {
    //     if(bassConnected) {
    //         bassVol.disconnect(audioCtx.destination);
    //         bassConnected = false;
    //     } else {
    //         bassVol.connect(audioCtx.destination);
    //         bassConnected = true;
    //     }
    // }

    // if (!what || what === 'solo') {
    //     if(soloConnected) {
    //         soloConnected = false;
    //         app.soloWave.disconnect(audioCtx.destination);
    //     } else {
    //         app.soloWave.connect(audioCtx.destination);
    //         soloConnected = true;
    //     }
    // }

    // if (mute.getAttribute("data-muted") === "false") {
    //   soloVol.disconnect(audioCtx.destination);
    //   mute.setAttribute("data-muted", "true");
    //   mute.innerHTML = "Unmute";
    // } else {
    //   soloVol.connect(audioCtx.destination);

    //   mute.setAttribute("data-muted", "false");
    //   mute.innerHTML = "Mute";
    // }
}

// canvas visualization
function random(number1, number2) {
  return number1 + (Math.floor(Math.random() * (number2 - number1)) + 1);
}

function subscribeBoard(board) {
  const gutter = board.gutter;

  board.canvasTop.onmousemove = (e) => {
    //console.log(e);
    e.preventDefault();
    e.stopPropagation();

    // if (e.buttons) {
    //   canvasCtx.fillStyle = "green";
    //   canvasCtx.fillRect(CurX, CurY , 1, 1);
    // }    

    board.update(e);
  }

  board.canvasTop.addEventListener('mousedown', (e) => {
    if (board.type === 'noteAndVol') {
      return;
    }

    if (e.offsetX <= gutter || 
      e.offsetX >= sizes.boardWidth - gutter ||
      e.offsetY <= gutter ||
      e.offsetY >= (sizes.boardHeight - gutter)
    ) {
      return;
    }

    let curX = Math.round(e.offsetX);
    let curY = Math.round(e.offsetY);
    let indX = 0;
    let indY = 0;
    const cellSize = sizes.cellSize;
    const halfSize = sizes.halfSize;

    // curX
    if (curX <= (gutter + cellSize)) {
      indX = 0;
    } else if (curX >= (sizes.boardWidth - gutter - cellSize)) {
      indX = board.freqList.length - 1;
    } else {
      const locX = curX - gutter;
      indX = Math.floor(locX / cellSize);
    }

    const noteInfo = board.freqList[indX];

    if (!noteInfo) return;

    // curY
    if (curY <= (gutter + cellSize)) {
      indY = 0;
    } else if (curY >= (sizes.boardHeight - gutter - cellSize)) {
      indY = volumeList.length - 1;
    } else {
      const locY = curY - gutter;
      indY = Math.floor(locY / cellSize);
    }

    // draw cols
    board.clearCanvasTop();
    noteInfo.relatives.forEach(iIndX => {
      volumeList.forEach((item, indY) => {
        let drawX = gutter + (iIndX * cellSize) + halfSize;
        const drawY = gutter + (indY * cellSize) + halfSize;
        
        board.canvasCtxTop.fillStyle = "gray";
        board.canvasCtxTop.fillRect(drawX - 1, drawY - 1 , 2, 2);

        // +4
        drawX = gutter + ((iIndX + 4) * cellSize) + halfSize;
        board.canvasCtxTop.fillRect(drawX, drawY, 1, 1);

        drawX = gutter + ((iIndX + 8) * cellSize) + halfSize;
        board.canvasCtxTop.fillRect(drawX, drawY, 1, 1);
      });
    });

    // draw cell
    const drawX = gutter + (indX * cellSize) + halfSize - 1;
    const drawY = gutter + (indY * cellSize) + halfSize - 1;
  
    board.canvasCtxTop.fillStyle = "green";
    board.canvasCtxTop.fillRect(drawX, drawY , 3, 3);

    //toggleMute('solo');
  });
}

// ---------------------------------------------------- //

// freqAndVolBoard
{
  let board = app.freqAndVolBoard;

  board.setFreqList(freqList, soloBotNote, soloTopNote);
  sizes = getSizes(board.freqList);

  let boardEl = getWithDataAttr('board-container')[0];
  let canvasEl = getWithDataAttr('board-canvas-container')[0];      

  boardEl.style.left = `${sizes.boardLeftOffset}px`;

  board.createCanvas(sizes, canvasEl);
  board.drawCells();
  subscribeBoard(board);
}

// noteAndVolBoard
{
  let board = app.noteAndVolBoard;

  board.setFreqList(freqList, soloBotNote, soloTopNote);
  let sizes2 = getSizes(board.freqList);

  let boardEl = getWithDataAttr('board-container2')[0];
  let canvasEl = getWithDataAttr('board-canvas-container2')[0];

  boardEl.style.left = `${sizes.boardLeftOffset}px`;

  board.createCanvas(sizes2, canvasEl);
  board.drawCells();
  subscribeBoard(board);
}

// ---------------------------------------------------- //

preparePreset({
  audioContext: audioCtx,
  preset: window._drum_56_0_SBLive_sf2,
  //var?: string,
  //id?: number | string
});

// ---------------------------------------------------- //

getWithDataAttr('clear-action').forEach(el => {
  el.addEventListener('click', () => app.freqAndVolBoard.clearCanvasTop());
});

getWithDataAttr('test-action').forEach(el => {
  el.addEventListener('click', () => {
      const text = getWithDataAttr('settings-input')[0].value.trim();
      app.playBeat(text);
  });
});

getWithDataAttr('note-input-button').forEach(el => {
  el.addEventListener('click', () => {
    let text = (getWithDataAttr('note-input')[0].value || '').trim();

    app.noteAndVolBoard.setFreqListByNote(text);
  });
});


// playTick3(signature?: string) {
//   this.stopTicker();

//   const cb = (x: {ab: AudioBufferSourceNode, startTimeMs: number}) => {
//       this.tickNode = x.ab;

//       if (this.drumCtrl) {
//           this.drumCtrl.tickStartMs = x.startTimeMs;
//       }

//       if (this.toneCtrl?.recData) {
//           this.toneCtrl.recData.startTimeMs = x.startTimeMs;
//       }

//       //console.log('start');
//       // setTimeout(() => {
//       //     x.ab.stop(0);
//       //     x.ab.stop(0);
//       // }, 2000);
//   }

//   ideService.ticker.createTickSource({
//       qms: Math.round(60000/ this.bpmValue),
//       preset1: ideService.synthesizer.instruments['drum_56'],
//       preset2: ideService.synthesizer.instruments['drum_80'],
//       repeat: 100,
//       signature,
//       cb,
//   });
// }
