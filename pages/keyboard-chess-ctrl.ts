import { Muse as m, Line, LineNote, LineModel } from '../libs/muse';

import * as hlp from './keyboard-tone-ctrl-helper';
import { dyName, getWithDataAttr } from '../src/utils';
import { KeyboardCtrl, KeyboardPage } from './keyboard-ctrl';
import { parseInteger } from '../libs/common';
import { drumNotesInfo } from './drum-board';
import { UserSettings, UserSettingsStore } from './user-settings-store';

const rem = 'rem';
const px = 'px';

let cellSizePx = 0;
let rowHeightPx = 0;
let fontSizePx = 0;

const MAX_BOARD_WIDTH = 400;

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
    userSettings: UserSettings = UserSettingsStore.GetUserSettings();

    get page(): KeyboardPage {
        return this.board.page;
    }

    constructor(
        public board: KeyboardCtrl,
        public liner: LineModel,
    ){
        //console.log(ideService.currentEdit);
        //console.log('getBoundingClientRect', Math.floor(this.page.pageEl.getBoundingClientRect().width / 16));

        let boardWidth = this.page.pageEl.getBoundingClientRect().width;
        boardWidth = boardWidth > MAX_BOARD_WIDTH ? MAX_BOARD_WIDTH : boardWidth;

        cellSizePx = Math.floor(boardWidth / 16 / 2) * 2;
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

        getWithDataAttr('chess-pony-col-line-ind', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.board.ponyCellClicked());
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

        const noteMap = this.userSettings.useCyrillicNote ? hlp.mapNoteToCharRus : hlp.mapNoteToCharLat;

        result.cellId = arr[0].id;
        result.char = noteMap[char] || '?';
        result.bgColor = octaveColor[octave] || 'gray';
        result.durQ = arr[0].durQ;

        return result;
    }


    getRowTpl({rowBorderBottom}: {rowBorderBottom: string}): string {
        return `<div style="
            box-sizing: border-box;
            position: relative;
            margin: 0;
            padding: 0;
            color: white;                    
            user-select: none;
            height: ${rowHeightPx}px;
            width:${cellSizePx*12}px;                    
            border-bottom: ${rowBorderBottom}
        ">
            %content%
        </div>`;
    }

    getColTpl({iRow, iCol, totalOffsetQ, bgColor}:{iRow: number, iCol: number, totalOffsetQ: number, bgColor: string}): string {
        return `<span
            data-chess-cell-line-ind="${iRow}"
            data-chess-cell-col="${iCol}"
            data-chess-cell-row-col="${iRow}-${iCol}"
            data-chess-cell-id=""
            data-chess-total-offset="${totalOffsetQ}"                        
            style="
                box-sizing: border-box;
                border: 1px solid white;
                display: inline-block;
                z-index: 0;
                position: absolute;
                width: ${cellSizePx}${px};
                height: ${cellSizePx}${px};
                background-color: ${bgColor};
                user-select: none;
                touch-action: none;
                text-align: center;
                left: ${iCol * cellSizePx}${px};
                top: 1px;
            "
        ></span>`.trim();
    }

    getCellTpl({iRow, iCol, cellId, totalOffsetQ, bgColor, char, textDecoration}: {
        iRow: number,
        iCol: number,
        cellId: string | number,
        totalOffsetQ: number,
        bgColor: string,
        char: number | string,
        textDecoration: string,
    }): string {
        return `<span
            data-chess-cell-line-ind="${iRow}"
            data-chess-cell-col="${iCol}"
            data-chess-cell-row-col="${iRow}-${iCol}"                                                
            data-chess-cell-id="${cellId}"
            data-chess-total-offset="${totalOffsetQ}"
            data-chess-cell-with-id-offset="${totalOffsetQ}"
            data-chess-cell-with-id-row-col="${iRow}-${iCol}"                                                                        
            style="
                box-sizing: border-box;
                border: none;
                display: inline-block;
                position: absolute;
                z-index: 0;                            
                width: ${cellSizePx-2}${px};
                height: ${cellSizePx-2}${px};
                background-color: ${bgColor};
                user-select: none;
                touch-action: none;
                text-align: center;
                font-weight: 700;
                font-size: ${fontSizePx}${px};
                line-height: ${fontSizePx}${px};
                text-decoration: ${textDecoration};
                left: ${(iCol * cellSizePx) + 1}${px};
                top: 2px;
            "
        >${char}</span>`.trim();
    }

    getToneChess(rows: Line[]) {
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
                col.startOffsetQ = row.startOffsetQ + (m.CELL_SIZE * i);
                col.totalOffsetQ = col.startOffsetQ + row.blockOffsetQ;
            });

            const offsets = this.liner.getOffsetsByRow(row);

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / m.CELL_SIZE;
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
                let colCount = cell.durQ ? Math.floor(cell.durQ / m.CELL_SIZE) : 1;
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
            let rowOut = '';
            let rowTpl = this.getRowTpl({rowBorderBottom: box.rowBorderBottom});

            // COLS tone
            box.cols.forEach(col => {
                rowOut += this.getColTpl({
                    iRow,
                    iCol: col.colInd,
                    totalOffsetQ: col.totalOffsetQ,
                    bgColor: col.bgColor
                });
            });

            // CELLS tone
            box.cells.forEach(cell => {
                if (!cell.cellId) return;

                rowOut += this.getCellTpl({
                    iRow,
                    iCol: cell.colInd,
                    cellId: cell.cellId,
                    totalOffsetQ: cell.totalOffsetQ,
                    bgColor: cell.bgColor,
                    char: cell.char,
                    textDecoration: cell.underline ? 'underline' : 'none',
                });
            });

            totalOut += rowTpl.replace('%content%', rowOut);
        });

        return {
            content: totalOut,
            rowCount: rows.length,
        }
    }

    getDrumChess(rows: Line[]): {
        content: string,
        rowCount: number,
    } {
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

            let rowOut = '';

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
                rowOut += this.getColTpl({
                    iRow,
                    iCol,
                    totalOffsetQ: col.totalOffsetQ,
                    bgColor: col.bgColor,
                });
            });

            // CELL drum
            cols.forEach((cell, iCol) => {
                if (!cell.cellId) return;

                rowOut += this.getCellTpl({
                    iRow,
                    iCol,
                    cellId: cell.cellId,
                    totalOffsetQ: cell.totalOffsetQ,
                    bgColor: cell.bgColor,
                    textDecoration: cell.underline ? 'underline' : 'none',
                    char: cell.char,
                });
            });

            let rowTpl = this.getRowTpl({rowBorderBottom});
            totalOut += rowTpl.replace('%content%', rowOut);
        });

        return {
           content: totalOut,
           rowCount: rows.length,
        }
    }

    getPonyCol(rowCount: number): string {
        let result = ``;

        for (let i = 0; i < rowCount; i++) {
            result += `<div 
                style="
                    height: ${rowHeightPx}px;
                    width: ${cellSizePx*3}px"
                >
                    <div
                        data-chess-pony-col-line-ind="${i}"                    
                        style="
                            display: none;
                            margin-left: ${cellSizePx}px;
                            width: ${cellSizePx * 2}px;
                            border: 1px solid black;
                            height: ${rowHeightPx}px;                            
                            text-align: center;
                        "
                        ></div>
                </div>`;
        }

        return result;
    }

    printChess(x: {content: string, rowCount: number}): {content: string, rowCount: number} {
        const height = x.rowCount * rowHeightPx;

        const content = `
            <div style="display: flex; padding-left: ${cellSizePx}px;">
                <div style="width: ${cellSizePx*12}px; height: ${height}px; user-select: none; touch-action: none;">
                    ${x.content}
                </div>
                <div style="width: ${cellSizePx*3}px; height: ${height}px;">
                    ${this.getPonyCol(x.rowCount)}
                </div>
            </div>
        `.trim();

        // UPDATE CHESS
        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = content;
        }

        this.subscribeChess();

        return x;
    }

    printDrumChess(rows: Line[]) {
        this.printChess(this.getDrumChess(rows));
    }

    printToneChess(rows: Line[]) {
        this.printChess(this.getToneChess(rows));
    }
}
