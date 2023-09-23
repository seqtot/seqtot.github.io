import {CELL_SIZE, Line, LineModel, LineNote} from './line-model';
import * as hlp from './keyboard-tone-ctrl-helper';
import {dyName, getWithDataAttr} from '../src/utils';
import {KeyboardCtrl, KeyboardPage} from './keyboard-ctrl';
import {parseInteger} from '../libs/common';
import {drumNotesInfo} from './drum-board';

const rem = 'rem';
const px = 'px';

let cellHeight = 1.26;
let cellWidth = 1.26;
let rowHeight = 1.4;

let cellSizePx = 0;
let rowHeightPx = 0;
let fontSizePx = 0;

type DrumChessCell = {
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,
}

export class KeyboardChessCtrl {
    constructor(
        public page: KeyboardPage,
        public liner: LineModel,
        public board: KeyboardCtrl,
    ){
        //console.log(ideService.currentEdit);
        console.log('getBoundingClientRect', Math.floor(this.page.pageEl.getBoundingClientRect().width / 16));

        cellSizePx = Math.floor(this.page.pageEl.getBoundingClientRect().width / 16 / 2) * 2;
        rowHeightPx = cellSizePx + 4;
        fontSizePx = Math.floor(((cellSizePx - (cellSizePx / 3)) / 2) * 2);
    }

    chessCellClick(el: HTMLElement) {
        const offset = parseInteger(el.dataset['chessTotalOffset'], null);

        if (offset === null) {
            return;
        }

        const board = this.board;

        if (!el.dataset['selected']) {
            board.setActiveCell(el);
            board.highlightCellByRowCol(board.activeCell.rowCol);
        } else {
            this.board.highlightCellByRowCol(board.activeCell.rowCol, false);
            board.setActiveCell(null);
        }
    }

    subscribeChess() {
        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.chessCellClick(el));
        });
    }

    getChessLine(count: number): hlp.ChessCell[] {
        const arr = Array(count).fill(null);

        return arr.map((item ,colInd) => ({
            colInd,
            bgColor: 'whitesmoke',
            noteId: 0,
            cellId: 0,
            char: '',
            startOffsetQ: 0,
            totalOffsetQ: 0,
            underline: false,
            durQ: 0,
            octave: ''
        }));
    }

    getChessCellFor(arr: LineNote[]): hlp.ChessCell {
        const result: hlp.ChessCell = {
            colInd: 0,
            noteId: 0,
            cellId: 0,
            char: '',
            octave: '',
            bgColor: '#eee',
            underline: false,
            startOffsetQ: 0,
            totalOffsetQ: 0,
            durQ: 0,
        }

        if (!arr[0]) {
            return result;
        }

        const char = arr[0].note[0];
        const octave = arr[0].note[1];

        const octaveColor = {
            u: 'black',
            y: 'darkblue',
            o: 'darkgreen',
            a: 'lightblue',
            e: 'lightgreen',
            i: 'yellow',
        }

        result.cellId = arr[0].id;
        result.char = hlp.mapNoteToChar[char] || '?';
        result.bgColor = octaveColor[octave] || 'gray';
        result.durQ = arr[0].durQ;

        return result;
    }

    printToneChess(rows: Line[]) {
        let totalOut = '';

        const boxedRows: {
            row: Line,
            cols: hlp.ChessCell[],
            cells: hlp.ChessCell[],
            rowBorderBottom: string,
        }[] = rows.map((row, iRow) => {
            const box = { row, cells: [] } as any;
            const nextRow = rows[iRow + 1];
            const hasLine = (!!nextRow && nextRow.blockOffsetQ !== row.blockOffsetQ);

            box.rowBorderBottom = hasLine ? '2px solid black;' : 'none;';

            box.cols = this.getChessLine(row.durQ / row.cellSizeQ);
            box.cols.forEach((col, i) => {
                col.startOffsetQ = row.startOffsetQ + (CELL_SIZE * i);
                col.totalOffsetQ = col.startOffsetQ + row.blockOffsetQ;
            });

            const offsets = this.liner.getOffsetsByRow(row);

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / CELL_SIZE;
                const notes = this.liner.getNotesListByOffset(row, offset);

                const col = box.cols[iCell];
                const cell = this.getChessCellFor(notes);

                cell.colInd = col.colInd;
                cell.startOffsetQ = col.startOffsetQ;
                cell.totalOffsetQ = col.totalOffsetQ;
                cell.octave = col.octave;

                box.cells.push(cell);
            }

            return box;
        });

        // COL - bgColor
        boxedRows.forEach((box, iRow) => {
            box.cells.forEach(cell => {
                let colCount = cell.durQ ? Math.floor(cell.durQ / CELL_SIZE) : 1;
                let colInd = cell.colInd;

                for (let i = iRow; i < boxedRows.length; i++) {
                    if (!colCount) break;

                    const row = boxedRows[i];

                    for (let j = colInd; j < row.cols.length; j++) {
                        if (!colCount) break;

                        const col = row.cols[j];
                        col.bgColor = '#bbb';
                        colCount--;

                        if (j === (row.cols.length - 1) ) {
                            colInd = 0;
                        }
                    }
                }
            });
        });

        boxedRows.forEach((box, iRow) => {
            // ROW tone
            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    color: white;                    
                    user-select: none;
                    height: ${rowHeightPx}px;
                    width:${cellSizePx*12}px;                    
                    border-bottom: ${box.rowBorderBottom}
                ">`;

            // COLS tone
            box.cols.forEach(col => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-line-ind="${iRow}"
                        data-chess-cell-col="${col.colInd}"
                        data-chess-cell-row-col="${iRow}-${col.colInd}"
                        data-chess-cell-id=""
                        data-chess-total-offset="${col.totalOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            z-index: 0;
                            position: absolute;
                            width: ${cellSizePx}px;
                            height: ${cellSizePx}${px};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${col.colInd * cellSizePx}px;
                            top: 1px;
                        "
                    ></span>`.trim();
            });

            // CELLS tone
            box.cells.forEach(cell => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-line-ind="${iRow}"
                        data-chess-cell-col="${cell.colInd}"
                        data-chess-cell-row-col="${iRow}-${cell.colInd}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${cell.colInd}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: none;
                            display: inline-block;
                            position: absolute;
                            z-index: 0;                            
                            width: ${cellSizePx-2}px;
                            height: ${cellSizePx-2}px;
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            font-size: ${fontSizePx}px;
                            line-height: ${fontSizePx}px;
                            text-decoration: ${textDecoration};
                            left: ${(cell.colInd * cellSizePx) + 1}px;
                            top: 2px;
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });


        const height = rows.length * rowHeightPx;

        const content = `
            <div style="display: flex; padding-left: ${cellSizePx}px;">
                <div style="width: ${cellSizePx*12}px; height: ${height}px; user-select: none; touch-action: none;">
                    ${totalOut}
                </div>
                <div style="width: ${cellSizePx*3}px; height: ${height}px;">
                    <!--  -->
                </div>
            </div>
        `.trim();

        // UPDATE CHESS
        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = content;
            //el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();
    }

    printDrumChess(rows: Line[]) {
        const getMask = (count: number): DrumChessCell[] => {
            const arr = Array(count).fill(null);
            return arr.map(() => ({
                bgColor: 'whitesmoke',
                noteId: 0,
                cellId: 0,
                char: '',
                startOffsetQ: 0,
                totalOffsetQ: 0,
                underline: false,
            }));
        }

        let totalOut = '';

        const getTextAndColor = (arr: LineNote[]): DrumChessCell => {
            const result: DrumChessCell = {
                noteId: 0,
                cellId: 0,
                char: '',
                //color: 'white',
                bgColor: 'lightgray',
                underline: false,
                startOffsetQ: 0,
                totalOffsetQ: 0,
            }

            const map = {
                bd: 0,
                sn: 0,
                hc: 0
            }

            arr = arr.filter(item => {
                if (item.note === 'bd' || item.note === 'sn' || item.note === 'hc') {
                    map[item.note] = item.id;

                    return false;
                }

                return true;
            });

            if (arr.length) {
                result.char = (drumNotesInfo[arr[0].note])?.char || '?';
                result.noteId = arr[0].id || 0;
            }
            else {
                result.char = map.hc ? '_' : '';
                result.noteId = map.hc ? map.hc : 0;
            }

            if (map.bd && map.sn) {
                result.noteId = map.bd;
                result.bgColor = 'black';
            } else if (map.bd) {
                result.noteId = map.bd;
                result.bgColor = drumNotesInfo.bd.headColor;
            } else if (map.sn) {
                result.noteId = map.sn;
                result.bgColor = drumNotesInfo.sn.headColor;
            } else if (arr.length) {
                result.bgColor = drumNotesInfo[arr[0].note]?.headColor || 'darkgray';
            }

            if (map.hc) {
                result.underline = true;
            }

            const cell = this.liner.getCellByNoteId(result.noteId);
            result.cellId = cell?.id;

            return result;
        }

        rows.forEach((row, iRow) => {
            const nextRow = rows[iRow + 1];
            const offsets = this.liner.getOffsetsByRow(row);
            const hasLine = (!!nextRow && nextRow.blockOffsetQ !== row.blockOffsetQ);
            const rowBorderBottom = hasLine ? '2px solid black;' : 'none;';

            // ROW drum
            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    color: white;                    
                    user-select: none;
                    height: ${rowHeightPx}px;
                    width:${cellSizePx*12}px;                    
                    border-bottom: ${rowBorderBottom}
                ">`;

            const cellSizeQ = 10;
            const cols = getMask(row.durQ / row.cellSizeQ);
            cols.forEach((col, i) => {
                col.startOffsetQ = row.startOffsetQ + (cellSizeQ * i);
                col.totalOffsetQ = col.startOffsetQ + row.blockOffsetQ;
            });

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / cellSizeQ;
                const notes = this.liner.getNotesListByOffset(row, offset);

                const col = cols[iCell];
                const textAndColor = getTextAndColor(notes);

                col.cellId = textAndColor.cellId;
                col.noteId = textAndColor.noteId;
                col.bgColor = textAndColor.bgColor;
                col.char = textAndColor.char;
                col.underline = textAndColor.underline;
            }

            // COL drum
            cols.forEach((col, iCol) => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-line-ind="${iRow}"
                        data-chess-cell-col="${iCol}"
                        data-chess-cell-row-col="${iRow}-${iCol}"
                        data-chess-cell-id=""
                        data-chess-total-offset="${col.totalOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            z-index: 0;
                            position: absolute;
                            width: ${cellSizePx}${px};
                            height: ${cellSizePx}${px};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${iCol * cellSizePx}${px};
                            top: 1px;
                        "
                    ></span>`.trim();
            });

            // CELL drum
            cols.forEach((cell, iCell) => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-line-ind="${iRow}"
                        data-chess-cell-col="${iCell}"
                        data-chess-cell-row-col="${iRow}-${iCell}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${iCell}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: none;
                            display: inline-block;
                            position: absolute;
                            z-index: 0;                            
                            width: ${cellSizePx-2}${px};
                            height: ${cellSizePx-2}${px};
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            font-size: ${fontSizePx}${px};
                            line-height: ${fontSizePx}${px};
                            text-decoration: ${textDecoration};
                            left: ${(iCell * cellSizePx) + 1}px;
                            top: 2px;
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        const height = rows.length * rowHeightPx;

        const content = `
            <div style="display: flex; padding-left: ${cellSizePx}px;">
                <div style="width: ${cellSizePx*12}px; height: ${height}px; user-select: none; touch-action: none;">
                    ${totalOut}
                </div>
                <div style="width: ${cellSizePx*3}px; height: ${height}px;">
                    <!--  -->
                </div>
            </div>
        `.trim();

        // UPDATE CHESS
        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = content;
            //el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();

        // // UPDATE CHESS
        // const el = dyName('chess-wrapper', this.page.pageEl);
        // if (el) {
        //     el.innerHTML = totalOut;
        //     el.style.height = `${rows.length * rowHeight}rem`;
        // }
        //
        // this.subscribeChess();
    }
}
