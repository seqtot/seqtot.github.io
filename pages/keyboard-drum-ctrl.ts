import { drumInfo } from '../libs/muse/drums';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import * as un from '../libs/muse/utils/utils-note';
import { LineModel, Line, LineNote, KeyData } from './line-model';
import { createOutBlock, TextBlock } from '../libs/muse/utils/utils-note';

import { ideService } from './ide/ide-service';
import { DrumBoard, drumNotesInfo } from './drum-board';
import { KeyboardCtrl, BpmInfo, KeyboardPage, DrumKeyboardType } from './keyboard-ctrl';
import { sings } from './sings';

const drumCodesTop = [
    {note: 'ho', alias: 'ча'},
    {note: 'cc', alias: 'щи'},
    {note: 'rc', alias: 'ци'},
];

const drumCodesMid = [
    {note: 'th', alias: 'та'},
    {note: 'tm', alias: 'тo'},
    {note: 'tl', alias: 'ту'},
];

const drumCodesBot = [
    {note: 'hc', alias: 'чи'},
    {note: 'sn', alias: 'ба'},
    {note: 'bd', alias: 'пы'},
];

const someDrum = {
    note: '',
    headColor: 'lightgray',
    bodyColor: 'lightgray',
    char: '?',
}

type ChessCell = {
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,
}

const DOWN = 1;
const UP = 0;

export class DrumCtrl extends KeyboardCtrl {
    bpmInfo: BpmInfo = this.getEmptyBpmInfo();
    mode: 'record' | null = null;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];
    tickStartMs: number = 0;
    board: DrumBoard;

    get hasEditedItems(): boolean {
        return !!ideService.editedItems.length;
    }

    constructor(public page: KeyboardPage, public type: DrumKeyboardType) {
        super(page, type);

        this.board = new DrumBoard();
    }

    highlightInstruments() {
        getWithDataAttr('add-note-action', this.page.pageEl).forEach(el => {
            el.style.fontWeight = '400';
            el.style.backgroundColor = 'white';
        });

        const notes = this.liner.getNotesByOffset(this.activeCell.offset);

        notes.forEach(note => {
            getWithDataAttrValue('add-note-action', note.note, this.page.pageEl).forEach(el => {
                el.style.fontWeight = '700';
                el.style.backgroundColor = 'lightgray';
            });
        });
    }

    updateView() {
        getWithDataAttr('row-in-part-item', this.page.pageEl).forEach(el => {
            const rowInPartId = el.dataset['rowInPartId'];

            if (ideService.editedItems.find(item => item.rowInPartId === rowInPartId)) {
                el.style.fontWeight = '600';
            } else {
                el.style.fontWeight = '400';
            }
        });

        this.updateChess();
    }

    playOne() {
        this.page.stop();

        const notes = this.liner.getDrumNotes('temp');

        if (!notes) return;

        let blocks = [
            '<out r100>',
            'temp',
            notes
        ].join('\n');

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            bpm: this.page.bpmValue,
        });
    }

    playBoth() {
        this.page.stop();
        if (!this.hasEditedItems) return;

        let rowsForPlay: string[] = [];

        const midiConfig = this.getMidiConfig({ resetBlockOffset: true, useEditing: true });
        let blocks = midiConfig.blocks;
        let playBlock = midiConfig.playBlockOut as TextBlock;

        const playingRows = playBlock.rows.filter(item => {
            const part = un.getPartInfo(item);
            return !!ideService.editedItems.find(item => item.rowInPartId === part.rowInPartId);
        });

        playingRows.forEach(playRow => {
            const part = un.getPartInfo(playRow);
            let rows = this.liner.lines.filter(row => row.rowInPartId === part.rowInPartId)
            rows = this.liner.cloneRows(rows);
            rows.forEach(row => (row.blockOffsetQ = 0));

            const notes = this.liner.getDrumNotes(ideService.guid.toString(), rows);

            if (notes) {
                const block = un.getTextBlocks(notes)[0];

                rowsForPlay.push(`${playRow} ${block.id}`);
                blocks = [...blocks, block];
            } else {
                rowsForPlay.push(`${playRow}`);
            }
        });

        playBlock = createOutBlock({
            id: 'out',
            type: 'set',
            rows: rowsForPlay,
            bpm: this.page.bpmValue
        });

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            playBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            metaByLines: ideService.currentEdit.metaByLines,
        });
    }

    playActive() {
        if (!this.hasEditedItems) return;

        const midiConfig = this.getMidiConfig({ resetBlockOffset: true });
        const playBlock = midiConfig.playBlockOut as TextBlock;
        const playingRows = playBlock.rows.filter(item => {
            const part = un.getPartInfo(item);
            return !!ideService.editedItems.find(item => item.rowInPartId === part.rowInPartId);
        });

        this.page.stop();

        if (!playingRows.length) return;

        const newOutBlock = createOutBlock({
            id: 'out',
            type: 'set',
            rows: playingRows,
            bpm: this.page.bpmValue
        });

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks: midiConfig.blocks,
            playBlock: newOutBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            metaByLines: ideService.currentEdit.metaByLines,
        });
    }

    subscribeCommonCommands() {
        const page = this.page;
        const pageEl = this.page.pageEl;

        getWithDataAttrValue('page-action', 'play-one', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playOne());
        });

        getWithDataAttrValue('page-action', 'get-bpm-or-stop', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                // остановить запись
                if (this.keyData) {
                    this.keyData.next = Date.now();
                    this.keySequence.push(this.keyData);
                    this.getOut(page.bpmValue, this.keySequence);
                    this.clearRecordData();
                    page.stopTicker();

                    return;
                }

                const bpmInfo = this.bpmInfo;
                const time = Date.now();

                bpmInfo.pressCount++;

                if (bpmInfo.lastDownTime) {
                    bpmInfo.totalMs = bpmInfo.totalMs + (time - bpmInfo.lastDownTime);
                }
                bpmInfo.lastDownTime = time;

                if (bpmInfo.totalMs) {
                    const avg = bpmInfo.totalMs / (bpmInfo.pressCount - 1);
                    bpmInfo.bpm = Math.round(60000 / avg);
                }

                el.innerText = '' + (bpmInfo.bpm || '');
                //this.bpmRange.setValue(bpmInfo.bpm);
                //this.bpmValue = bpmInfo.bpm;
            });
        });

        // getWithDataAttrValue('page-action', 'clear', this.pageEl).forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', (evt: MouseEvent) => {
        //         getWithDataAttrValue('common-drum', 'get-bpm-or-stop', this.pageEl).forEach((el: HTMLElement) => {
        //             this.drumCtrl.clearBpmInfo();
        //             el.innerText = '';
        //         });
        //     });
        // });

        getWithDataAttrValue('page-action', 'record', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                if (this.mode !== 'record') {
                    this.mode = 'record';
                    el.style.fontWeight = '700';
                } else {
                    this.mode = null;
                    el.style.fontWeight = '400';
                }
            });
        });

        getWithDataAttr('action-drum-key', pageEl).forEach((el: HTMLElement) => {
            const note1 = (el.dataset['actionDrumKey'] || '').split('+')[0];

            if (!note1) {
                return;
            }

            const note2 = (el.dataset['actionDrum'] || '').split('+')[1];
            const notes = [note1, note2].filter(item => !!item && !item.startsWith('empty'));
            const volume = note1 === 'cowbell' ? 0.30 : undefined
            const keyboardId = el.dataset['keyboardId'];
            const color = el.dataset['color'];
            const char = el.dataset['char'];

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const time = Date.now();

                if (this.mode === 'record') {
                    this.handleKeyRecord(note1, time, color, char, DOWN);
                }

                notes.forEach(keyOrNote => {
                    page.synthesizer.playSound({
                        keyOrNote,
                        volume,
                        id: keyboardId,
                        onlyStop: false,
                    });
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = '1px solid black';
                    });
                }
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const time = Date.now();

                if (this.mode === 'record') {
                    return this.handleKeyRecord(note1, time, color, char, UP);
                }

                notes.forEach(keyOrNote => {
                    page.synthesizer.playSound({
                        keyOrNote,
                        id: keyboardId,
                        onlyStop: true,
                    });
                });

                if (note2) {
                    getWithDataAttrValue('highlight-drum', el.dataset['actionDrum']).forEach(el => {
                        el.style.border = null;
                    });
                }
            });
        });
    }

    subscribeEditCommands() {
        super.subscribeEditCommands();

        getWithDataAttr('add-note-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addOrDelNoteClick(el));
        });
    }

    subscribeEvents() {
        this.subscribeCommonCommands();
        this.subscribeMoveCommands();
        this.subscribeEditCommands();
        this.subscribeIdeEvents();
    }

    clearRecordData() {
        this.keyData = null;
        this.keySequence = [];
    }

    clearBpmInfo() {
        this.bpmInfo = this.getEmptyBpmInfo();
    }

    getDrumNotesPanel(): string {
        const rowStyle = `width: 100%; font-family: monospace; margin-top: .5rem; margin-bottom: .5rem; user-select: none;`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.1rem; user-select: none; touch-action: none;`;

        let wrapper = `
            <div style="display: flex; width: 90%; justify-content: flex-start; user-select: none; margin-bottom: .5rem;">
                <div style="border-radius: .5rem; margin-left: .5rem; padding-left: .5rem; padding-right: .5rem; border: 1px solid lightgray;">
                    %instruments%
                </div>
                <div style="margin-left: 1rem;">
                    %actions%
                </div>                
            </div>
        `.trim();

        let topRow = ''
        drumCodesTop.forEach(item => {
            const info = drumNotesInfo[item.note];
            topRow += `
                <span
                    style="${style}"
                    data-add-note-action="${info.note}"
                    data-note-lat="${info.note}"
                >${info.vocalism}</span>
            `;
        });
        topRow = `<div style="${rowStyle}">${topRow}</div>`;

        let midRow = ''
        drumCodesMid.forEach(item => {
            const info = drumNotesInfo[item.note];
            midRow += `
                <span
                    style="${style}"
                    data-add-note-action="${info.note}"
                    data-note-lat="${info.note}"                    
                >${info.vocalism}</span>
            `;
        });
        midRow = `<div style="${rowStyle}">${midRow}</div>`;

        let botRow = ''
        drumCodesBot.forEach(item => {
            const info = drumNotesInfo[item.note];
            botRow += `
                <span
                    style="${style}"
                    data-add-note-action="${info.note}"
                    data-note-lat="${info.note}"                    
                >${info.vocalism}</span>
            `;
        });
        botRow = `<div style="${rowStyle}">${botRow}</div>`;

        let actions = `
            <div style="${rowStyle}">
                ${this.getMoveButtons()}
            </div>
            <div style="${rowStyle}">
                <span
                    style="${style} color: gray;"
                    data-action-type="stop"
                >${sings.stop}</span>
                <span
                    style="${style} color: blue;"
                    data-page-action="play-one"
                >${sings.play}</span>
            </div>     
            <div style="${rowStyle} display: flex; justify-content: flex-end; padding-right: 1rem;">
               <span
                    style="${style} background-color: red; color: white; font-size: 1rem;"
                    data-edit-action="delete-cell"
                >del</span>
            </div>               
        `.trim();

        wrapper = wrapper.replace('%instruments%', topRow + midRow + botRow);
        wrapper = wrapper.replace('%actions%', actions);

        return wrapper;
    }

    getDrumBoard(keyboardId: string): string {
        return this.board.getContent(keyboardId);
    }

    getPatternsContent(): string {
        const style = `font-size: 1.7rem; margin: .5rem; user-select: none; font-family: monospace;`;

        const content = `
            <div style="${style}" data-type="drum-pattern">
                O-k-T-k-O---V---<br/>                    
                O-k-T-k-O---O-kt<br/>
                O-ktK-v-O---O---<br/>
                O-k-|-k-O-k-V---<br/>
                O---|-k-O---V---<br/>
                O---T-k-O---V---<br/>
                O---T-k-O---O---<br/>                                                        
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                O-----k-----<br/>
                T-----k-----<br/>
                O-----------<br/>
                V-----------<br/>
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                O-----k-----<br/>
                T-----k-----<br/>
                O-----------<br/>
                O-----k--t--<br/>
            </div>     
            <br/>                   
            <div style="${style}" data-type="drum-pattern">
                QoxoAoq_<br/>
                X_qoA_xv<br/>
                Q_q_Aoxo<br/>
                X_x_A_xv
            </div>
            <br/>
            <div style="${style}" data-type="drum-pattern">
                Q_q_Aoq_<br/>
                X_q_A_xv<br/>
                Q_q_Aoxo<br/>
                X_qoA_xv
            </div>`.trim();

        return content;
    }

    getContent(keyboardId: string): string {
        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum-key="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');

        const content = `
            <div class="page-content" data="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${this.getDrumBoard(keyboardId)}
                ${this.getTopCommandPanel()}
                ${this.getMetronomeContent()}                
                ${this.getRowActionsCommands()}                
                <!--${this.getMoveCommandPanel()} -->
                ${this.getDrumNotesPanel()}
                
                <div
                    data-name="chess-wrapper"
                    style="width: 90%; padding-left: 1rem;"
                ></div>
                
                <div data-edit-parts-wrapper>
                    ${this.getIdeContent()}                
                </div>                                
                
                <div style="font-size: 1.5rem;">
                    ${drums}
                </div>
                
                <div 
                    data-name="drum-patterns"                
                    style="width: 90%; padding-left: 2%;"
                >
                    ${this.getPatternsContent()}               
                </div>                
            </div>`.trim();

        return content;
    }

    handleKeyRecord(note: string, time: number, color: string, char: string, type: 0 | 1) {
        if (this.mode !== 'record') {
            return;
        }

        // ПЕРВОЕ НАЖАТИЕ
        if (!this.keyData && type === DOWN) {
            this.keyData = {
                note,
                char,
                code: note,
                down: time,
                up: 0,
                next: 0,
                //quarterTime: this.tickInfo.quarterTime,
                //quarterNio: this.tickInfo.quarterNio,
                quarterTime: 0,
                quarterNio: 0,
                color: color || 'black',
                color2: '',
            };

            return;
        }

        if (this.keyData) {
            if (type === UP) {
                this.keyData.up = time;
            }

            if (type === DOWN) {
                this.keyData.next = time;
                this.keySequence.push(this.keyData);

                this.keyData = {
                    note,
                    char,
                    code: note,
                    down: time,
                    up: 0,
                    next: 0,
                    quarterTime: 0,
                    quarterNio: 0,
                    color: color || 'black',
                    color2: '',
                };
            }
        }
    }

    getOut(bpm: number, seq: DrumCtrl['keySequence'] ) {
        const rows = LineModel.GetLineModelFromRecord(bpm, this.tickStartMs, seq);
        this.liner.setData(rows);
        this.printChess(rows);
    }

    printChess(rows: Line[]) {
        const rem = 'rem';
        const getMask = (count: number): ChessCell[] => {
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
        let height = 1.26;
        let padding = .07;
        let rowHeight = 1.4;

        const getTextAndColor = (arr: LineNote[]): ChessCell => {
            const result: ChessCell = {
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
            const rowBorderBottom = hasLine ? '1px solid gray;' : 'none;';

            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    font-size: 1.2rem;
                    line-height: .9rem;
                    color: white;                    
                    user-select: none;
                    padding-top: .07rem;
                    height: 1.4rem;
                    border-bottom: ${rowBorderBottom};
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

            cols.forEach((col, iCol) => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
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
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${iCol * height}${rem};
                        "
                    ></span>`.trim();
            });

            cols.forEach((cell, iCell) => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';
                const rem = 'rem';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${iCell}"
                        data-chess-cell-row-col="${iRow}-${iCell}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${iCell}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${height}${rem};
                            height: ${height}${rem};
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            z-index: 0;
                            text-decoration: ${textDecoration};
                            left: ${iCell * height}${rem};
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();
    }

    getNoteInfo(noteLat: string): {
        note: string,
        headColor: string,
        bodyColor: string,
        char: string,
        vocalism: string,
    } {
        return drumNotesInfo[noteLat] || someDrum;
    }
}

// getContent updateView
//
// getDrumBoard
// getDrumNotesPanel  highlightInstruments
// addOrDelNoteClick -> addOrDelNote
//
// getPatternsContent
//
//
// CHESS
// printChess
// getOut
//
// RECORD
// handleKeyRecord
// clearRecordData
//
// SUBSCRIBE
// subscribeEvents
// subscribeCommonCommands
// subscribeEditCommands
//
// PLAY
// playOne  playActive  playBoth
//
// clearBpmInfo?
