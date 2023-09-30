import { drumInfo } from '../libs/muse/drums';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { LineModel, Line, LineNote, KeyData } from './line-model';

import { ideService } from './ide/ide-service';
import { DrumBoard, drumNotesInfo } from './drum-board';
import { KeyboardCtrl, BpmInfo, KeyboardPage, DrumKeyboardType } from './keyboard-ctrl';
import * as svg from './svg-icons';
import { KeyboardChessCtrl } from './keyboard-chess-ctrl';

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
    chess: KeyboardChessCtrl;

    constructor(public page: KeyboardPage, public type: DrumKeyboardType) {
        super(page, type);
        this.chess = new KeyboardChessCtrl(this, this.liner);

        this.board = new DrumBoard();
    }

    highlightInstruments() {
        getWithDataAttr('add-note-action', this.page.pageEl).forEach(el => {
            el.style.fontWeight = '400';
            el.style.backgroundColor = 'white';
        });

        const notes = this.liner.getNotesByOffset(this.activeCell.totalOffset);

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
                ${svg.stopBtn('data-action-type="stop"')}
                ${svg.playBtn('data-page-action="play-one"')}
            </div>     
            <div style="${rowStyle} display: flex; justify-content: flex-end; padding-right: 1rem;">
                ${svg.deleteBtn('data-edit-line-action="delete-cell"')}
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

    getContent(keyboardId: string, trackName: string): string {
        this.trackName = trackName; // jjkl сделать в ToneCtrl

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum-key="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');

        const content = `
            ${this.getDrumBoard(keyboardId)}
            ${this.getTopCommandPanel()}
            ${this.getMetronomeContent()}                
            ${this.getRowActionsCommands()}                
            <!--${this.getMoveCommandPanel()} -->
            ${this.getDrumNotesPanel()}
            
            <div data-name="chess-wrapper" style="width: 100%;"></div>
            
            <div data-edit-parts-wrapper>
                ${this.getRowsByPartComplexContent()}                
            </div>                                
            
            <div style="font-size: 1.5rem;">
                ${drums}
            </div>
            
            <div 
                data-name="drum-patterns"                
                style="width: 90%; padding-left: 2%;"
            >
                ${this.getPatternsContent()}               
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
        this.chess.printDrumChess(rows);
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
// PLAY: in parent
//
// clearBpmInfo?
