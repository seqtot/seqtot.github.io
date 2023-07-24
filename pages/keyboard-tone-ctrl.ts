import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import ideService from './ide/ide-service';
import * as un from '../libs/muse/utils/utils-note';
import {KeyData, Line, LineModel, NoteItem} from './line-model';
import { KeyboardCtrl, ToneKeyboardType, KeyboardPage } from './keyboard-ctrl';
import * as hlp from './keyboard-tone-ctrl-helper';

const DOWN = 1;
const UP = 0;

export class ToneCtrl extends KeyboardCtrl {
    instrCode = 162;
    playingNote: { [key: string]: string } = {};
    lastPlayingNote = '';
    offset = 0;
    isMemoMode = false;

    isRecMode = false;
    memoBuffer: string[] = [];
    memoBuffer2: string[] = [];
    recData: {
        startTime: number,
        endTime: number,
        sequence: KeyData[],
    } | null = {
        startTime: 0,
        endTime: 0,
        sequence: []
    };

    constructor(
        public page: KeyboardPage,
        public type: ToneKeyboardType
    ) {
        super(page);

        if (type === 'bassGuitar') {
            this.instrCode = hlp.bassGuitarInstr; // bassGuitarInstr;
        }
        else if (type === 'guitar') {
            this.instrCode = hlp.rockGuitarInstr;
        }
        else {
            this.instrCode = hlp.organInstr;
        }
    }

    getHarmonicaContent(): string {
        let wrapper = `
            <div style="margin: .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
                ${hlp.getVerticalKeyboard('base', 'bassHarmonica', hlp.bassKeys)}
                ${hlp.getVerticalKeyboard('solo', 'soloHarmonica', hlp.soloKeys)}
                <div 
                    style="font-size: 2rem;
                    font-family: monospace;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    pointer-events: none;
                    user-select: none;
                    touch-action: none;
                    padding-left: .5rem;"
                    data-type="text-under-board"
                >
                    ${hlp.getPatternsList()}
                </div>            
            </div>
            <div
                data-name="chess-wrapper"
                style="width: 90%; padding-left: 1rem;"
            ></div>
        `.trim();

        return wrapper;
    }

    getGuitarBoardContent(type?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
        settings = settings || this.getGuitarSettings();

        let stringCount = settings.stringCount;
        let firstString = 0;

        if (type === 'bassGuitar' && stringCount === 4) {
            firstString = 1;
        }

        if (type === 'guitar' && stringCount === 6) {
            firstString = 1;
        }

        let boardKeys = hlp.bassGuitarKeys.slice(settings.offset, settings.offset + 13);

        boardKeys = boardKeys.map(row => {
           return row.slice(firstString, stringCount + firstString);
        });

        return hlp.getVerticalKeyboard('base', type, boardKeys);
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

        let result = '';

        // <span
        //     style="${actionStyle}"
        // data-action-type="tick"
        //     >1:4</span>
        // &nbsp;&nbsp;
        // <span
        //     style="${actionStyle}"
        // data-action-type="stop"
        // >stop</span><br/><br/>
        // <span data-action-tone="record-mode" style="${actionStyle}">rec</span><br/><br/>

        result = `
            <div style="${rowStyle}">
                <!--span 
                    style="font-size: 1.5rem; user-select: none; touch-action: none;"
                    data-page-action="clear"
                >clr&nbsp;&nbsp;</span-->                
                <span
                    style="${style}"
                    data-action-tone="record-mode"
                >rec</span>
                <span
                    style="${style}"
                >&nbsp;&nbsp;&nbsp;</span>                    
                <span
                    style="${style}"
                    data-action-type="stop"
                >stop</span>                                        
                <span
                    style="${style}"
                    data-action-type="tick"
                >1:4</span>
                <!--span
                    style="${style}"
                    data-action-type="tick"
                >3:4&nbsp;</span-->                    
                <span
                    style="${style} color: blue;"
                    data-page-action="play-one"
                >play</span>
            </div>
        `.trim();

        return result;
    }

    getGuitarContent(type?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
        settings = settings || this.getGuitarSettings();
        type = type || <any>this.type;

        const actionStyle = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;
        let stringCountCommands = '';

        if (type === 'guitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="6" style="${actionStyle}">6s</span>
                    <span data-action-set-string-count="7" style="${actionStyle}">7s</span>                                    
                </div>
            `.trim();
        }

        if (type === 'bassGuitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="4" style="${actionStyle}">4s</span>
                    <span data-action-set-string-count="5" style="${actionStyle}">5s</span>                    
                    <span data-action-set-string-count="6" style="${actionStyle}">6s</span>                                        
                </div>
            `.trim();
        }

        let wrapper = `
            <div style="
                display: flex;
                margin: .5rem;
                justify-content: space-between;
                position: relative;"
            >
                <div 
                    data-guitar-board-wrapper
                    style="user-select: none; touch-action: none;"
                >
                    ${this.getGuitarBoardContent(type, settings)}                
                </div>

                <div style="padding-left: .5rem; padding-top: .5rem;">
                    ${stringCountCommands}<br/>
                    <span data-action-tone="set-offset-up" style="${actionStyle}">up</span>&emsp;
                    <span data-action-tone="set-offset-down" style="${actionStyle}">down</span><br/><br/>
                    <span data-action-tone="fix-board-cell" style="${actionStyle} font-size: 1.4rem; background-color: yellow; ">fix</span><br/><br/>
                    <span data-action-tone="unfix-board-cell" style="${actionStyle}">unfix</span><br/><br/>                    
                    
                    <span data-action-tone="memo-mode" style="${actionStyle}">memo</span><br/><br/>
                    <span data-action-tone="memo-clear" style="${actionStyle} color: red;">&times;mem</span><br/><br/>                    
                </div>
            </div>

            <div 
                data-action-tone="record-beat-wrapper"
                style="margin: .5rem; display: none; width: 90%;"
            >
                <div
                    data-action-tone="record-beat"
                    data-id="beat1"                     
                    style="${actionStyle} height: 5rem; width: 100%; background-color: whitesmoke;  margin: 0;"
                >beat me</div>
                <div
                    data-action-tone="record-beat"
                    data-id="beat2" 
                    style="${actionStyle} height: 5rem; width: 100%; background-color: whitesmoke; margin-bottom: .5rem;"
                >beat me</div>
            </div>
            
            ${this.getTopCommandPanel()}
                        
            <div style="margin: .5rem;">
                ${this.page.getMetronomeContent()}
                <br/>            
            </div>
            
            ${this.getRowActionsCommands()}            
                        
            <div
                data-name="chess-wrapper"
                style="width: 90%; padding-left: 1rem;"
            ></div>
              
            ${this.getMoveCommandPanel(1.2)}                     
           
            <div style="margin: .5rem;">            
                <b>ДО</b> - С<br/>
                до диез - С# или <b>t</b> <br/>
                ре бемоль - Db или <b>t</b> <br/>                
                <b>РЕ</b> - D <br/>                                
                ре диез - D# или <b>n</b> <br/>
                ми бемоль - Eb или <b>n</b> <br/>
                <b>МИ</b> - E <br/>
                <b>ФА</b> - F <br/>                            
                фа диез - F# или <b>v</b> <br/>
                соль бемоль - Gb или <b>v</b> <br/>
                <b>СОЛЬ</b> - G <br/>
                соль диез - G# или <b>z</b> <br/>
                ля бемоль - Ab или <b>z</b> <br/>
                <b>ЛЯ</b> - A <br/>
                ля диез - A# или <b>k</b> <br/>
                си бемоль - Hb или B или <b>k</b> <br/>
                <b>СИ</b> - H или B <br/>
            </div>
            
        `.trim();

        return wrapper;
    }

    getContent(type?: ToneKeyboardType): string {
        if (type === 'bassSoloHarmonica') {
            return this.getHarmonicaContent();
        }
        else if(type === 'bassGuitar') {
            return this.getGuitarContent('bassGuitar');
        }
        else if(type === 'guitar') {
            return this.getGuitarContent('guitar');
        }
    }

    setKeysColor() {
        let baseNote = this.playingNote.base || '';
        let baseChar = baseNote[0];

        getWithDataAttr('note-key', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.style.backgroundColor = el.dataset['bgColor'] || 'white';

            if (this.type === 'bassSoloHarmonica') {
                el.style.boxShadow = null;
            }

            const data = (el?.dataset || {}) as {
                keyboardId: string;
                noteLat: string;
                row: string;
            };
            const note = data.noteLat || '';

            if (data.keyboardId === 'solo') {
                if (note[0] === baseChar) {
                    el.style.boxShadow = 'inset 0px 0px 3px black';
                }
                if (note === baseNote) {
                    el.style.boxShadow = 'inset 0px 0px 3px blue';
                }
            }

            // GUITAR
            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                baseChar = this.lastPlayingNote[0];

                if (data.row !== '0' && data.row !== '12') {
                    el.innerHTML = '&nbsp;';
                } else {
                    el.style.color = 'black';
                }

                if (note[0] === baseChar) {
                    const octaveChar = (el.dataset['noteLat'] || '')[1];
                    el.innerText = hlp.mapNoteToChar[baseChar];
                    el.style.color = hlp.octaveColor[octaveChar] || 'dimgrey';
                }
            }
        });
    }

    toggleRecord() {
        const pageEl = this.page.pageEl;

        this.isRecMode = !this.isRecMode && !!this.memoBuffer.length;

        if (this.isRecMode) {
            this.memoBuffer2 = [...this.memoBuffer];
            // может быть перезаписан при старте таймера
            this.recData.startTime = Date.now();

            getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
                el.style.fontWeight = '700';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl)?.forEach((el: HTMLElement) => {
                el.style.display = 'block';
            });
        } else {
            this.clearRecordData();

            getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
                el.style.fontWeight = '400';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl)?.forEach((el: HTMLElement) => {
                el.style.display = 'none';
            });
        }
    }


    getOut(bpm: number, data: ToneCtrl['recData'] ) {
        data.sequence.forEach((item, i) => {
            const next = data.sequence[i];

            if (next) {
                item.next = next.down;
            } else {
                item.next = data.endTime;
            }
        });

        const rows = LineModel.GetToneLineModelFromRecord(
            bpm, data.startTime, data.sequence
        );
        this.liner.setData(rows);
        this.printChess(rows);
    }

    clearRecordData() {
        this.recData = {
            startTime: 0,
            endTime: 0,
            sequence: []
        };
    }

    handleKeyRecord(id: string, time: number, type: 0 | 1) {
        const instrCode = this.instrCode;

        if (!this.isRecMode) {
            return;
        }

        if (type === DOWN && this.memoBuffer2.length) {
            const note = this.memoBuffer2.shift();

            this.recData[id] = {
                note,
                char: note[0],
                code: note,
                down: time,
                up: 0,
                next: 0,
                quarterTime: 0,
                quarterNio: 0,
                color: 'gray',
                color2: 'lightgray',
            }

            this.recData.sequence.push(this.recData[id]);

            ideService.synthesizer.playSound({
                id,
                keyOrNote: note,
                instrCode,
            });

            return;
        }

        if (type === UP && this.recData[id]) {
            this.recData[id].up = time;

            ideService.synthesizer.playSound({
                id,
                keyOrNote: this.recData[id].note,
                onlyStop: true,
            });

            this.recData[id] = null;

            return;
        }

        if (!this.memoBuffer2.length && type === DOWN) {
            this.recData.endTime = time;

            this.getOut(this.page.bpmValue, this.recData);
            this.page.stopTicker();
            this.toggleRecord();

            return;
        }
    }

    pushNoteToMemo(note: string | null) {
        if (note) {
            this.memoBuffer.push(note);
        } else {
            this.memoBuffer = [];
        }

        getWithDataAttrValue('action-tone', 'memo-clear', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.style.fontWeight = this.memoBuffer.length ? '700' : '400';
        });
    }


    toggleMemo() {
        this.isMemoMode = !this.isMemoMode;

        getWithDataAttrValue('action-tone', 'memo-mode', this.page.pageEl)?.forEach((el: HTMLElement) => {
            if (this.isMemoMode) {
                el.style.fontWeight = '700';
            } else {
                el.style.fontWeight = '400';
            }
        });
    }

    subscribeEditCommands() {
        const pageEl = this.page.pageEl;

        getWithDataAttrValue('edit-action', 'delete-cell', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteCell(el));
        });

        getWithDataAttr('action-drum-note', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.drumNoteClick(el));
        });

        getWithDataAttrValue('edit-row-action', 'add-row', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addRow());
        });

        getWithDataAttrValue('edit-row-action', 'insert-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.insertRow());
        });

        getWithDataAttrValue('edit-row-action', 'delete-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.deleteRow());
        });
    }

    moveCell(id: number, value: number) {
        const result = this.liner.moveCell(id, value);

        if (result) {
            this.printChess(this.liner.rows);
            //this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    getGuitarSettings(): hlp.GuitarSettings {
        if (!localStorage.getItem(`[settings]${this.type}`)) {
            let offset = 0;

            if (this.type === 'guitar') {
                offset = 12;
            }

            this.setGuitarSettings({
                stringCount: 6,
                offset,
            });
        }

        return JSON.parse(localStorage.getItem(`[settings]${this.type}`));
    }

    setGuitarSettings(settings: hlp.GuitarSettings) {
        localStorage.setItem(`[settings]${this.type}`, JSON.stringify(settings));
    }

    fixBoardCell(resetFix = false) {
        if (resetFix) {
            getWithDataAttrValue('fix-note-cell', 'true', this.page.pageEl).forEach(el => {
                el.style.boxShadow = null;
                el.dataset['fixCell'] = '';
            });

            return;
        }

        getWithDataAttrValue('note-cell-guid', this.lastNoteCellGuid, this.page.pageEl).forEach(el => {
            if (el.dataset['fixNoteCell']) {
                el.style.boxShadow = null;
                el.dataset['fixNoteCell'] = '';
            } else {
                el.dataset['fixNoteCell'] = 'true';
                el.style.boxShadow = 'inset 0px 0px 6px yellow';
            }
        });
    }

    setGuitarOffset(step: number) {
        //console.log('setGuitarOffset', step);

        let settings = this.getGuitarSettings();
        const offset = settings.offset + step;

        if (offset < 0) {
            return;
        }

        settings.offset = offset;
        this.setGuitarSettings(settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = null;
        });

        const boardContent = this.getGuitarBoardContent(<any>this.type, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    setStringCount(stringCount: number | string) {
        stringCount = un.parseInteger(stringCount, 6);
        let settings = this.getGuitarSettings();
        settings.stringCount = stringCount;
        this.setGuitarSettings(settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = null;
        });

        const boardContent = this.getGuitarBoardContent(<any>this.type, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    lastNoteCellGuid = '';

    subscribeBoardEvents() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('note-key', pageEl)?.forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                keyId = el.dataset.noteCellGuid;
            }

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const instrCode = this.instrCode;

                ideService.synthesizer.playSound({
                    keyOrNote: this.playingNote[keyId],
                    id: keyId,
                    onlyStop: true,
                });

                this.playingNote[keyId] = keyOrNote;
                this.lastPlayingNote = keyOrNote;
                this.lastNoteCellGuid = el?.dataset?.noteCellGuid || '';

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    instrCode,
                });

                this.setKeysColor();

                if (this.isMemoMode) {
                    this.pushNoteToMemo(keyOrNote);
                }
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    onlyStop: true,
                });

                this.playingNote[keyId] = undefined;
            });
        });
    }

    subscribeCommonCommands() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('action-set-string-count', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setStringCount(el.dataset['actionSetStringCount']));
        });

        getWithDataAttrValue('action-tone', 'set-offset-up', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setGuitarOffset(1));
        });

        getWithDataAttrValue('action-tone', 'set-offset-down', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.setGuitarOffset(-1));
        });

        getWithDataAttrValue('action-tone', 'fix-board-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.fixBoardCell());
        });

        getWithDataAttrValue('action-tone', 'unfix-board-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.fixBoardCell(true));
        });

        getWithDataAttrValue('page-action', 'play-one', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playOne());
        });

        getWithDataAttrValue('action-tone', 'memo-mode', pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleMemo());
        });

        getWithDataAttrValue('action-tone', 'memo-clear',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.pushNoteToMemo(null));
        });

        // getWithDataAttrValue('action-tone', 'record-stop',pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => this.toggleRecord())
        // });

        getWithDataAttrValue('action-tone', 'record-beat',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.handleKeyRecord(el.dataset.id, Date.now(), DOWN);
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                this.handleKeyRecord(el.dataset.id, Date.now(), UP);
            });
        });

        getWithDataAttrValue('action-tone', 'record-mode',pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleRecord())
        });

        const clearColor = () => {
            getWithDataAttr('note-key', pageEl)?.forEach((el: HTMLElement) => {
                el.style.backgroundColor = el.dataset['bgColor'] || 'white';
            });
        };

        // очистка цвета
        let el = dyName('clear-keys-color', pageEl);
        if (el) {
            el.addEventListener('click', () => clearColor());
        }

        el = dyName('select-random-key', pageEl);
        if (el) {
            el.addEventListener('click', () => {
                const val =
                    un.getRandomElement('dtrnmfvszlkb') + un.getRandomElement('uoa');

                const key = dyName(
                    `note-key-${val}`,
                    dyName(`keyboard-solo`, pageEl)
                );

                if (key) {
                    clearColor();
                    key.style.backgroundColor = 'gray';
                }
            });
        }

    }

    subscribeEvents() {
        this.subscribeCommonCommands();
        this.subscribeMoveCommands();
        this.subscribeEditCommands();
        this.subscribeBoardEvents();
    }

    getChessCellFor(arr: NoteItem[]): hlp.ChessCell {
        const result: hlp.ChessCell = {
            noteId: 0,
            cellId: 0,
            char: '',
            //color: 'white',
            bgColor: 'lightgray',
            underline: false,
            startOffsetQ: 0,
            totalOffsetQ: 0,
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

        return result;
    }

    printChess(rows: Line[]) {
        const rem = 'rem';
        const getMask = (count: number): hlp.ChessCell[] => {
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
                const textAndColor = this.getChessCellFor(notes);

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

    playOne() {
        this.page.stop();

        const notes = LineModel.GetToneNotes({
            blockName: 'temp',
            instr: hlp.instrName[this.instrCode],
            chnl: this.type === 'bassGuitar' ? '$bass' : '$guit',
            rows: this.liner.rows,
        });

        //console.log('notes', notes);

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
}
