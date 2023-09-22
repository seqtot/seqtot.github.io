import { Dialog } from 'framework7/components/dialog/dialog';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { ideService } from './ide/ide-service';
import * as un from '../libs/muse/utils/utils-note';
import { KeyData, Line, LineModel, LineNote, CELL_SIZE } from './line-model';
import { KeyboardCtrl, ToneKeyboardType, KeyboardPage } from './keyboard-ctrl';
import * as hlp from './keyboard-tone-ctrl-helper';
import { sings } from './sings';
import { SongStore } from './song-store';
import { isT34 } from './keyboard-tone-ctrl-helper';
import { DEFAULT_TONE_INSTR } from '../libs/muse/keyboards';
import { getInstrNameByCode } from '../libs/muse/instruments';
import { KeyboardChessCtrl } from './keyboard-chess-ctrl';

const DOWN = 1;
const UP = 0;
const rem = 'rem';
const monoFont = 'font-family: monospace;';

export class ToneCtrl extends KeyboardCtrl {
    _instrCode = DEFAULT_TONE_INSTR;
    playingNote: { [key: string]: string } = {};
    lastPlayingNote = '';
    offset = 0;
    isMemoMode = false;
    realBoardType: ToneKeyboardType = '' as any;

    isRecMode = false;
    memoBuffer: string[] = [];
    memoBuffer2: string[] = [];
    recData: {
        startTimeMs: number,
        endTimeMs: number,
        sequence: KeyData[],
        keys: {[key: string]: KeyData}
    } | null = {
        startTimeMs: 0,
        endTimeMs: 0,
        sequence: [],
        keys: {}
    };

    boardPopup: Dialog.Dialog;
    chess: KeyboardChessCtrl;
    lastNoteCellGuid = '';

    get instrName(): string {
        const name = getInstrNameByCode(this.instrCode);

        return name ? '$' + name : '';
    }

    get instrCode(): string | number { return this._instrCode }

    constructor(
        public page: KeyboardPage,
        public boardType: ToneKeyboardType
    ) {
        super(page, boardType);
        this.chess = new KeyboardChessCtrl(this.page, this.liner, this);

        if (boardType === 'bassGuitar') {
            this._instrCode = hlp.bassGuitarInstr;
        }
        else if (boardType === 'guitar') {
            this._instrCode = hlp.rockGuitarInstr;
        }
        else {
            this._instrCode = hlp.organInstr;
        }
    }

    getGuitarBoard(boardType?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
        settings = settings || this.getGuitarSettings();

        let stringCount = settings.stringCount;
        let firstString = 0;

        if (boardType === 'bassGuitar' && stringCount === 4) {
            firstString = 1;
        }

        if (boardType === 'guitar' && stringCount === 6) {
            firstString = 1;
        }

        let boardKeys = hlp.bassGuitarKeys.slice(settings.offset, settings.offset + 13);

        boardKeys = boardKeys.map(row => {
           return row.slice(firstString, stringCount + firstString);
        });

        return hlp.getVerticalKeyboard('base', boardType, boardKeys);
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.1rem; user-select: none;`;
        const rowStyle = `margin: .5rem 0; padding-left: 1rem; width: 90%; user-select: none; ${monoFont}`;
        let result = '';

        result = `
            <div style="${rowStyle}">
                <!--span 
                    style="font-size: 1.5rem; user-select: none; touch-action: none;"
                    data-page-action="clear"
                >clr&nbsp;&nbsp;</span-->                
                <span
                    style="${style}"
                    data-action-tone="record-mode"
                >rec</span>&nbsp;
                <span
                    style="${style}"
                    data-action-type="tick"
                    data-signature="1:4"
                >1:4</span>
                <span
                    style="${style}"
                    data-action-type="tick"
                    data-signature="3:8"                    
                >3:8</span>&nbsp;
                <span
                    style="${style} color: gray;"
                    data-action-type="stop"
                >${sings.stop}</span>                                  
                <span
                    style="${style} color: blue;"
                    data-page-action="play-one"
                >${sings.play}</span>
            </div>
        `.trim();

        return result;
    }

    getBeatContent(): string {
        const actionStyle = `
            border: 1px solid lightgray;
            font-size: 1.1rem;
            margin: 0;
            width: 100%;
            background-color: whitesmoke;
            height: 5rem;            
            user-select: none;
            touch-action: none;
        `.trim();

        return `
        <div
            data-action-tone="record-beat-wrapper"
            style="margin: .5rem; display: none; width: 80%;"
        >
            <div
                data-action-tone="record-beat"
                data-id="beat1"
                style="${actionStyle}"
            >beat me</div>
            <div
                data-action-tone="record-beat"
                data-id="beat2"
                style="${actionStyle}"
            >beat me</div>
            <div
                data-action-tone="record-beat"
                data-id="beat3"
                style="${actionStyle}"
            >beat me</div>                
            <div
                data-action-tone="record-beat"
                data-id="stop"
                style="${actionStyle} color: red;"
            >STOP</div>
            <br/>
        </div>`.trim();
    }

    getMusicInfoContent(): string {
        return `<div style="margin: .5rem;">
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
        </div>`.trim();
    }

    getGuitarRightSide(boardType: 'guitar' | 'bassGuitar', settings: hlp.GuitarSettings): string {
        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;
        let stringCountCommands = '';

        if (boardType === 'guitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="6" style="${btnStl}">6s</span>
                    <span data-action-set-string-count="7" style="${btnStl}">7s</span>                                    
                </div>
            `.trim();
        }

        if (boardType === 'bassGuitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="4" style="${btnStl}">4s</span>
                    <span data-action-set-string-count="5" style="${btnStl}">5s</span>                    
                    <span data-action-set-string-count="6" style="${btnStl}">6s</span>                                        
                </div>
            `.trim();
        }

        return `
            ${stringCountCommands}<br/>
            <span data-action-tone="set-offset-up" style="${btnStl}">up</span>&emsp;
            <span data-action-tone="set-offset-down" style="${btnStl}">down</span><br/>
            <span data-action-tone="open-guitar-board" style="${btnStl}">sound</span><br/><br/>            
            <span data-action-tone="fix-board-cell" style="${btnStl} font-size: 1.4rem; background-color: yellow; ">fix</span><br/><br/>
            <span data-action-tone="unfix-board-cell" style="${btnStl}">unfix</span><br/><br/>
            <span data-action-tone="memo-mode" style="${btnStl}">memo</span><br/><br/>
            <span data-action-tone="memo-clear" style="${btnStl} color: red;">&times;mem</span><br/><br/>
        `.trim();
    }

    getHarmonicaBoard(boardType: ToneKeyboardType): string {
        let baseKeys = hlp.harmonicaKeys.slice(3);
        let soloKeys = hlp.harmonicaKeys.slice(0, 12);

        if (boardType === 'solo34' || boardType === 'soloSolo34') {
            baseKeys = hlp.harmonicaKeys.slice(0, 13);
            soloKeys = hlp.harmonicaKeys.slice(0, 13);
        } else if (boardType === 'bass34' || boardType === 'bassBass34') {
            baseKeys = hlp.harmonicaKeys.slice(3);
            soloKeys = hlp.harmonicaKeys.slice(3);
        }

        return `
            <div style="
                margin: 0;
                padding: 1rem 1rem 1rem .5rem;
                user-select: none;
                touch-action: none;
                display: flex;
                justify-content: space-between;
                position: relative;"
            >
                ${hlp.getVerticalKeyboard('base', boardType, baseKeys)}
                ${hlp.getVerticalKeyboard('solo', boardType, soloKeys)}
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
                ></div>            
            </div>`.trim();
    }

    getHarmonicaContent(boardType: ToneKeyboardType): string {
        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;

        let result = `
            ${this.getHarmonicaBoard(boardType)}
            <div style="
                width: 90%;
                margin: 0;
                padding: .5rem;
                padding-left: 1rem;
                user-select: none;"
            >
                <span data-action-tone="memo-mode" style="${btnStl}">memo</span>&emsp;
                <span data-action-tone="memo-clear" style="${btnStl} color: red;">&times;mem</span>&emsp;
                <span data-get-note-for-cell-action style="${btnStl}">pop</span>                
            </div>
            
            ${this.getBeatContent()}
            ${this.getTopCommandPanel()}
            ${this.getMetronomeContent()}
            ${this.getRowActionsCommands()}
            
            ${this.getDurationCommandPanel()}            
            ${this.getMoveCommandPanel()}                                                
            <div data-name="chess-wrapper" style="width: 100%;"></div>
            ${this.getMoveCommandPanel()}
            ${this.getDurationCommandPanel()}
            
            <div data-edit-parts-wrapper>
                ${this.getIdeContent()}                
            </div>
            
            <div style="margin: 1rem;">
                use board:
                <span data-use-board-type="soloSolo34">SS</span>&nbsp;
                <span data-use-board-type="bassSolo34">BS</span>&nbsp;
                <span data-use-board-type="bassBass34">BB</span>&nbsp;
            </div>            
        `.trim();

        return result;
    }

    getGuitarContent(type?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
        settings = settings || this.getGuitarSettings();
        type = type || <any>this.boardType;

        let result = `
            <div style="display: flex; margin: .5rem; justify-content: space-between; position: relative;">
                <div data-guitar-board-wrapper style="user-select: none; touch-action: none;">
                    ${this.getGuitarBoard(type, settings)}
                </div>
                <div style="padding-left: .5rem; padding-top: .5rem;">
                    ${this.getGuitarRightSide(type, settings)}                                        
                </div>
            </div>
            
            ${this.getBeatContent()}
            ${this.getTopCommandPanel()}
            ${this.getMetronomeContent()}            
            ${this.getRowActionsCommands()}
            
            ${this.getDurationCommandPanel()}            
            ${this.getMoveCommandPanel()}                        
            <div data-name="chess-wrapper" style="width: 100%;"></div>
            ${this.getMoveCommandPanel()}
            ${this.getDurationCommandPanel()}
            
            <div data-edit-parts-wrapper>
                ${this.getIdeContent()}                
            </div>

            <br/>            
            ${this.getMusicInfoContent()}
        `.trim();

        return result;
    }

    getContent(boardType?: ToneKeyboardType, trackName = ''): string {
        boardType = boardType || 'soloSolo34';

        if (this.isMy) {
            const song = SongStore.getSong(this.songId);
            const tracks = song.tracks.filter(track => track.name === trackName);
            this.trackName = tracks[0] ? tracks[0].name: '';
        }

        this.realBoardType = boardType;
        const localStoreBoard = localStorage.getItem('useThisBoard') as ToneKeyboardType;

        if (hlp.isT34(boardType) || hlp.isT34(localStoreBoard)) {
            this.realBoardType = localStoreBoard || boardType;
            return this.getHarmonicaContent(localStoreBoard || boardType);
        }
        else if(boardType === 'bassGuitar') {
            return this.getGuitarContent('bassGuitar');
        }
        else if(boardType === 'guitar') {
            return this.getGuitarContent('guitar');
        }
    }

    setKeysColor() {
        let baseNote = this.playingNote.base || '';
        let baseChar = baseNote[0];

        getWithDataAttr('note-key', this.page.pageEl).forEach((el: HTMLElement) => {
            el.style.backgroundColor = el.dataset['bgColor'] || 'white';

            const data = (el?.dataset || {}) as {
                keyboardId: string;
                noteLat: string;
                row: string;
            };
            const note = data.noteLat || '';

            if (isT34(this.realBoardType) && baseNote) {
                el.style.boxShadow = null;
            }

            if (data.keyboardId === 'solo') {
                if (note[0] === baseChar) {
                    el.style.boxShadow = 'inset 0px 0px 3px black';
                }
                if (note === baseNote) {
                    el.style.boxShadow = 'inset 0px 0px 3px blue';
                }
            }

            // GUITAR
            if (this.realBoardType === 'bassGuitar' || this.realBoardType === 'guitar') {
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
            this.recData.startTimeMs = Date.now();

            getWithDataAttrValue('action-tone', 'record-mode',pageEl).forEach((el: HTMLElement) => {
                el.style.fontWeight = '700';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl).forEach((el: HTMLElement) => {
                el.style.display = 'block';
            });
        } else {
            this.clearRecordData();

            getWithDataAttrValue('action-tone', 'record-mode',pageEl).forEach((el: HTMLElement) => {
                el.style.fontWeight = '400';
            });
            getWithDataAttrValue('action-tone', 'record-beat-wrapper',pageEl).forEach((el: HTMLElement) => {
                el.style.display = 'none';
            });
        }
    }

    handleRecordResult(bpm: number, data: ToneCtrl['recData'] ) {
        data.sequence.forEach((item, i) => {
            const next = data.sequence[i+1];

            if (next) {
                item.next = next.down;
            } else {
                item.next = data.endTimeMs;
            }
        });

        const lines = LineModel.GetToneLineModelFromRecord(
            bpm, data.startTimeMs, data.sequence
        );

        let oldLine: Line;

        // согласование старого блока с новым
        if (this.hasEditedItems && this.liner.lines) {
            lines.forEach((line, i) => {
                if (this.liner.lines[i]) {
                    oldLine = this.liner.lines[i];
                }
                if (oldLine) {
                    line.rowInPartId = oldLine.rowInPartId
                    line.blockOffsetQ = oldLine.blockOffsetQ;
                    line.startOffsetQ = line.startOffsetQ - line.blockOffsetQ;
                    line.cells.forEach(cell => {
                        cell.startOffsetQ = cell.startOffsetQ - line.blockOffsetQ;
                        cell.notes.forEach(note => {
                            note.instCode = this.instrCode;
                            note.instName = this.instrName;
                        })
                    })
                }
            });
        }

        if (this.liner.lines.length > lines.length) {
            const diff = this.liner.lines.length - lines.length;

            for (let i = this.liner.lines.length - diff; i < this.liner.lines.length; i++) {
                const line = LineModel.CloneLine(this.liner.lines[i]);
                lines.push(line);
            }
        }

        this.liner.setData(lines);
        this.printChess(lines);
    }

    clearRecordData() {
        this.recData = {
            startTimeMs: 0,
            endTimeMs: 0,
            sequence: [],
            keys: {},
        };
    }

    handleKeyRecord(id: string, time: number, type: 0 | 1) {
        const instrCode = this.instrCode;

        if (!this.isRecMode) {
            return;
        }

        if (id !== 'stop' && type === DOWN && this.memoBuffer2.length) {
            const note = this.memoBuffer2.shift();

            this.recData.keys[id] = {
                note,
                char: note[0],
                code: note,
                down: time,
                up: 0,
                next: 0,
                quarterTime: 0,
                quarterNio: 0,
                color: 'gray',
                color2: '#eee',
            }

            this.recData.sequence.push(this.recData.keys[id]);

            ideService.synthesizer.playSound({
                id,
                keyOrNote: note,
                instrCode,
            });

            return;
        }

        if (id !== 'stop' && type === UP && this.recData.keys[id]) {
            this.recData.keys[id].up = time;

            ideService.synthesizer.playSound({
                id,
                keyOrNote: this.recData.keys[id].note,
                onlyStop: true,
            });

            this.recData.keys[id] = null;

            return;
        }

        if ((!this.memoBuffer2.length || id === 'stop') && type === DOWN) {
            this.recData.endTimeMs = time;

            Object.keys(this.recData.keys).forEach(id => {
                const item = this.recData.keys[id];

                if (!item) {
                    return;
                }

                item.next = time;

                ideService.synthesizer.playSound({
                    id,
                    keyOrNote: this.recData.keys[id].note,
                    onlyStop: true,
                });

                this.recData.keys[id] = null;
            });

            this.handleRecordResult(this.page.bpmValue, this.recData);
            this.page.stopTicker();

            setTimeout(() => this.toggleRecord(), 300);

            return;
        }
    }

    pushNoteToMemo(note: string | null) {
        if (note) {
            this.memoBuffer.push(note);
        } else {
            this.memoBuffer = [];
        }

        getWithDataAttrValue('action-tone', 'memo-clear', this.page.pageEl).forEach((el: HTMLElement) => {
            el.style.fontWeight = this.memoBuffer.length ? '700' : '400';
        });
    }

    toggleMemo() {
        this.isMemoMode = !this.isMemoMode;

        getWithDataAttrValue('action-tone', 'memo-mode', this.page.pageEl).forEach((el: HTMLElement) => {
            if (this.isMemoMode) {
                el.style.fontWeight = '700';
            } else {
                el.style.fontWeight = '400';
            }
        });
    }

    updatePopupBoard() {
        const parent = getWithDataAttr('dynamic-tone-board')[0] as HTMLElement;

        getWithDataAttr('instrument-code', parent).forEach(el => {
            el.style.fontWeight = '400';
        });

        getWithDataAttrValue('instrument-code', this.instrCode, parent).forEach(el => {
            el.style.fontWeight = '700';
        });
    }

    subscribePopupBoard(cb?: () => any) {
        let lastNoteEl: HTMLElement;
        let lastPlayingNote = '';
        const playingNote: { [key: string]: string } = {};
        const parent = getWithDataAttr('dynamic-tone-board')[0] as HTMLElement;

        getWithDataAttr('instrument-code', parent).forEach(el => {
            el.addEventListener('pointerdown', () => {
                this._instrCode = un.parseInteger(el.dataset.instrumentCode, DEFAULT_TONE_INSTR);
                this.updatePopupBoard();

                ideService.synthesizer.playSound({
                    keyOrNote: 'do',
                    id: 'popup',
                    instrCode: this.instrCode,
                });
            })
        });

        getWithDataAttr('instrument-code', parent).forEach(el => {
            el.addEventListener('pointerup', () => {
                ideService.synthesizer.playSound({
                    keyOrNote: 'do',
                    id: 'popup',
                    onlyStop: true
                });
            })
        });

        getWithDataAttr('close-popup-board', parent).forEach(el => {
            el.addEventListener('pointerdown', () => {
                this.boardPopup.close(false);
            })
        });

        getWithDataAttr('select-note-action', parent).forEach(el => {
            el.addEventListener('pointerdown', () => {
                if (lastNoteEl) {
                    this.addOrDelNoteClick(lastNoteEl);
                }

                this.boardPopup.close(false);
            });
        });

        getWithDataAttr('note-key', parent).forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.boardType === 'bassGuitar' || this.boardType === 'guitar') {
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

                playingNote[keyId] = keyOrNote;
                lastPlayingNote = keyOrNote;
                lastNoteEl = el;

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    instrCode,
                });

                //this.setKeysColor();
            });

            el.addEventListener('pointerup', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                if (!lastPlayingNote) {
                    return;
                }

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    onlyStop: true,
                });

                playingNote[keyId] = undefined;
            });
        });
    }

    getInstrumentsForChoice(): string {
        const style = `
            display: inline-block;
            margin: 0 .5rem .5rem 0;
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1.1rem;
            user-select: none;`.trim();

        let instruments = '';

        const instrs = [
            {code: 327, label: 'RGtr:Drive'},
            {code: 321, label: 'RGtr:Drive:Mute'},
            {code: 276, label: 'EGtr:Clean'},

            {code: 374, label: 'CBass:Finger'},
            {code: 366, label: 'CBass:Slap'},

            {code: 375, label: 'EBass:Finger'},
            {code: 388, label: 'EBass:Mediator'},
            {code: 405, label: 'EBass:Beat'},

            {code: 182, label: 'Organ:Hard'},
            {code: 162, label: 'Organ:Soft'},
            {code: 235, label: 'Bayan'},

            {code: 136, label: 'Xylo'},

            {code: 617, label: 'Trumpet'},
            {code: 626, label: 'Trombone'},
            {code: 635, label: 'Tuba'},

            {code: 466, label: 'Violin'},
        ];

        instrs.forEach(item => {
            instruments = instruments + `
                <span
                    style="${style}" 
                    data-instrument-code="${item.code}"                    
                >${item.label}</span>&emsp;
            `.trim();
        });

        return instruments;
    }

    openGuitarBoard() {
        const content = `
            <div style="display: flex; margin: .5rem; justify-content: space-between; position: relative;">
                <div style="user-select: none; touch-action: none;">
                    ${this.getGuitarBoard(<any>this.boardType)}
                </div>
                <div style="padding-left: .5rem; padding-top: .5rem;">
                    <div 
                        data-select-note-action
                        style="height: 2rem; padding: .5rem; border: 1px solid gray; border-radius: .25rem;"
                    >OK</div>
                    <br/>
                    <div
                        data-close-popup-board
                        style="height: 2rem; padding: .5rem; border: 1px solid gray; border-radius: .25rem;"
                    >Close</div>
                </div>
        </div>`.trim();

        this.boardPopup = (this.page.context.$f7 as any).popup.create({
            content: `
                <div class="popup">
                    <div class="page">
                        <div class="page-content" data-dynamic-tone-board>
                            ${content}
                            <div style="margin: 1rem;">
                                ${this.getInstrumentsForChoice()} 
                            </div>                            
                        </div>                        
                    </div>
                </div>`.trim(),
            on: {
                opened: () => {
                    this.subscribePopupBoard();
                    this.updatePopupBoard()
                    this.updateFixedCellsOnBoard(getWithDataAttr('dynamic-tone-board')[0]);
                }
            }
        });

        this.boardPopup.open(false);
    }

    openHarmonicaBoard(boardType?: ToneKeyboardType) {
        boardType = (
            boardType ||
            localStorage.getItem('useThisBoard') as ToneKeyboardType ||
            'soloSolo34') as ToneKeyboardType;

        this.boardPopup = (this.page.context.$f7 as any).popup.create({
            content: `
                <div class="popup">
                    <div class="page">
                        <div class="page-content" data-dynamic-tone-board>
                        <div style="margin: 1rem 0 0 1rem;">
                            <div 
                                data-select-note-action
                                style="display: inline-block; height: 1.5rem; padding: .5rem; border: 1px solid gray; border-radius: .25rem;"
                            >OK</div>
                            &emsp;
                            <div
                                data-close-popup-board
                                style="display: inline-block; height: 1.5rem; padding: .5rem; border: 1px solid gray; border-radius: .25rem;"
                            >Close</div>                        
                        </div>
                            ${this.getHarmonicaBoard(boardType)}                           
                            <div style="margin: 0 1rem 0 1rem;">
                                ${this.getInstrumentsForChoice()}
                            </div>
                        </div>
                    </div>
                </div>`.trim(),
            on: {
                opened: () => {
                    this.subscribePopupBoard();
                    this.updatePopupBoard();
                }
            }
        });

        this.boardPopup.open(false);
    }

    subscribeEditCommands() {
        super.subscribeEditCommands();

        // getWithDataAttrValue('edit-row-action', 'test', this.page.pageEl).forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => this.openHarmonicaBoard());
        // });
    }

    getGuitarSettings(): hlp.GuitarSettings {
        if (!localStorage.getItem(`[settings]${this.boardType}`)) {
            let offset = 0;

            if (this.boardType === 'guitar') {
                offset = 12;
            }

            this.setGuitarSettings({
                stringCount: 6,
                offset,
            });
        }

        return JSON.parse(localStorage.getItem(`[settings]${this.boardType}`));
    }

    setGuitarSettings(settings: hlp.GuitarSettings) {
        localStorage.setItem(`[settings]${this.boardType}`, JSON.stringify(settings));
    }

    updateFixedCellsOnBoard(parent?: HTMLElement) {
        parent = parent || this.page.pageEl;

        const board = (ideService.boards[this.boardType] || {}) as {fixedCells: string[]};

        if (!ideService.boards[this.boardType]) {
            ideService.boards[this.boardType] = board;
        }

        if (!board.fixedCells) {
            board.fixedCells = [];
        }

        getWithDataAttr('note-cell-guid', parent).forEach(el => {
            if (board.fixedCells.includes(el.dataset.noteCellGuid)) {
                el.dataset['fixNoteCell'] = 'true';
                el.style.boxShadow = 'inset 0px 0px 6px yellow';
            } else {
                el.style.boxShadow = null;
                el.dataset['fixNoteCell'] = '';
            }
        });
    }

    fixBoardCell(resetFix = false) {
        const board = (ideService.boards[this.boardType] || {}) as {fixedCells: string[]};

        if (!ideService.boards[this.boardType]) {
            ideService.boards[this.boardType] = board;
        }

        if (!board.fixedCells) {
            board.fixedCells = [];
        }

        if (resetFix) {
            ideService.boards[this.boardType]['fixedCells'] = [];
        } else {
            if (board.fixedCells.includes(this.lastNoteCellGuid)) {
                board.fixedCells = board.fixedCells.filter(guid => guid !== this.lastNoteCellGuid);
            } else {
                board.fixedCells.push(this.lastNoteCellGuid);
            }
        }

        this.updateFixedCellsOnBoard();
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

        const boardContent = this.getGuitarBoard(<any>this.boardType, settings);

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

        const boardContent = this.getGuitarBoard(<any>this.boardType, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    subscribeBoardEvents() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('note-key', pageEl).forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.realBoardType === 'bassGuitar' || this.realBoardType === 'guitar') {
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

        getWithDataAttrValue('action-tone', 'open-guitar-board', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.openGuitarBoard());
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

        getWithDataAttrValue('action-tone', 'memo-mode', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleMemo());
        });

        getWithDataAttrValue('action-tone', 'memo-clear',pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.pushNoteToMemo(null));
        });

        getWithDataAttr('use-board-type', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => {
                const name = el.dataset.useBoardType;
                if (localStorage.getItem('useThisBoard')) {
                    localStorage.setItem('useThisBoard', '');
                } else {
                    localStorage.setItem('useThisBoard', name);
                    this.page.setContent();
                }
            });
        });

        // getWithDataAttrValue('action-tone', 'record-stop',pageEl).forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', () => this.toggleRecord())
        // });

        getWithDataAttrValue('action-tone', 'record-beat', pageEl).forEach((el: HTMLElement) => {
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

        getWithDataAttrValue('action-tone', 'record-mode', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleRecord())
        });

        const clearColor = () => {
            getWithDataAttr('note-key', pageEl).forEach((el: HTMLElement) => {
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
        this.subscribeIdeEvents();

        this.subscribeDurationCommands();
        this.subscribeBoardEvents();
    }

    printChess(rows: Line[]) {
        this.chess.printToneChess(rows);
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
        this.updateFixedCellsOnBoard();
    }

    subscribeDurationCommands() {
        super.subscribeDurationCommands();

        getWithDataAttr('get-note-for-cell-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => {
                if (this.realBoardType === 'bassGuitar' || this.realBoardType === 'guitar') {
                    this.openGuitarBoard();
                } else {
                    this.openHarmonicaBoard();
                }
            });
        });
    }
}

// getContent  getTopCommandPanel updateView
//
// BOARD
// getGuitarContent      getHarmonicaContent
// getGuitarBoard        getHarmonicaBoard
// openGuitarBoard       openHarmonicaBoard
// getGuitarRightSide
// getMusicInfoContent
//
// GUITAR BOARD
// getGuitarSettings  setGuitarSettings
// setStringCount  setGuitarOffset setKeysColor
// fixBoardCell  updateFixedCellsOnBoard

//
// CHESS
// printChess getChessLine getChessCellFor
//
// EVENTS
// subscribeEvents
// subscribeCommonCommands subscribeEditCommands
// subscribeBoardEvents    subscribePopupBoard
//
// RECORD
// handleRecordResult
// toggleRecord  handleKeyRecord  clearRecordData  getBeatContent
//
//
// MEMO
// toggleMemo pushNoteToMemo
//
// PLAY
// playOne
