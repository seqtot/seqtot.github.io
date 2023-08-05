import { Dialog } from 'framework7/components/dialog/dialog';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { ideService } from './ide/ide-service';
import * as un from '../libs/muse/utils/utils-note';
import { KeyData, Line, LineModel, LineNote, CELL_SIZE } from './line-model';
import { KeyboardCtrl, ToneKeyboardType, KeyboardPage } from './keyboard-ctrl';
import * as hlp from './keyboard-tone-ctrl-helper';
import { sings } from './sings';

const DOWN = 1;
const UP = 0;
const rem = 'rem';

export class ToneCtrl extends KeyboardCtrl {
    _instrCode = 162;
    playingNote: { [key: string]: string } = {};
    lastPlayingNote = '';
    offset = 0;
    isMemoMode = false;

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

    get instrName(): string {
        return hlp.instrName[this._instrCode] || '';
    }

    get instrCode(): string | number { return this._instrCode}

    constructor(
        public page: KeyboardPage,
        public type: ToneKeyboardType
    ) {
        super(page, type);

        if (type === 'bassGuitar') {
            this._instrCode = hlp.bassGuitarInstr; // bassGuitarInstr;
        }
        else if (type === 'guitar') {
            this._instrCode = hlp.rockGuitarInstr;
        }
        else {
            this._instrCode = hlp.organInstr;
        }
    }

    getGuitarBoard(type?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
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
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

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
                data-id="beat4"
                style="${actionStyle} height: 7rem;"
            >beat me</div>
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

    getGuitarRightSide(type: 'guitar' | 'bassGuitar', settings: hlp.GuitarSettings): string {
        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;
        let stringCountCommands = '';

        if (type === 'guitar') {
            stringCountCommands = `
                <div>
                    <span data-action-set-string-count="6" style="${btnStl}">6s</span>
                    <span data-action-set-string-count="7" style="${btnStl}">7s</span>                                    
                </div>
            `.trim();
        }

        if (type === 'bassGuitar') {
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
            <span data-action-tone="set-offset-down" style="${btnStl}">down</span><br/><br/>
            <span data-action-tone="fix-board-cell" style="${btnStl} font-size: 1.4rem; background-color: yellow; ">fix</span><br/><br/>
            <span data-action-tone="unfix-board-cell" style="${btnStl}">unfix</span><br/><br/>
            <span data-action-tone="memo-mode" style="${btnStl}">memo</span><br/><br/>
            <span data-action-tone="memo-clear" style="${btnStl} color: red;">&times;mem</span><br/><br/>
        `.trim();
    }

    getHarmonicaBoard(): string {
        return `
            <div style="margin: 0; padding: 1rem .5rem; user-select: none; touch-action: none; display: flex; justify-content: space-between; position: relative;">
                ${hlp.getVerticalKeyboard('base', 'bass34', hlp.bassKeys)}
                ${hlp.getVerticalKeyboard('solo', 'solo34', hlp.soloKeys)}
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

    getHarmonicaContent(): string {
        const btnStl = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.2rem; user-select: none; touch-action: none;`;

        let result = `
            ${this.getHarmonicaBoard()}
            
            <div style="widht: 90%; margin: 0; padding: .5rem; padding-left: 1rem; user-select: none; touch-action: none;">
                <span data-action-tone="memo-mode" style="${btnStl}">memo</span>&emsp;
                <span data-action-tone="memo-clear" style="${btnStl} color: red;">&times;mem</span>
            </div>
            
            ${this.getBeatContent()}
            ${this.getTopCommandPanel()}
            ${this.getMetronomeContent()}
            ${this.getRowActionsCommands()}
            
            ${this.getDurationCommandPanel(1.2)}            
            ${this.getMoveCommandPanel(1.2)}                                                
            <div data-name="chess-wrapper" style="width: 90%; padding-left: 1rem;"></div>
            ${this.getMoveCommandPanel(1.2)}
            ${this.getDurationCommandPanel(1.2)}
            
            <div data-edit-parts-wrapper>
                ${this.getIdeContent()}                
            </div>
        `.trim();

        return result;
    }

    getGuitarContent(type?: 'guitar' | 'bassGuitar', settings?: hlp.GuitarSettings): string {
        settings = settings || this.getGuitarSettings();
        type = type || <any>this.type;

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
            <div style="margin: .5rem;">${this.page.getMetronomeContent()}<br/></div>
            ${this.getRowActionsCommands()}
            
            ${this.getDurationCommandPanel(1.2)}            
            ${this.getMoveCommandPanel(1.2)}                        
            <div data-name="chess-wrapper" style="width: 90%; padding-left: 1rem;"></div>
            ${this.getMoveCommandPanel(1.2)}
            ${this.getDurationCommandPanel(1.2)}
            
            <div data-edit-parts-wrapper>
                ${this.getIdeContent()}                
            </div>

            <br/>            
            ${this.getMusicInfoContent()}
        `.trim();

        return result;
    }

    getContent(type?: ToneKeyboardType): string {
        if (type === 'bassSolo34') {
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

        getWithDataAttr('note-key', this.page.pageEl).forEach((el: HTMLElement) => {
            el.style.backgroundColor = el.dataset['bgColor'] || 'white';

            if (this.type === 'bassSolo34') {
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

    getOut(bpm: number, data: ToneCtrl['recData'] ) {
        data.sequence.forEach((item, i) => {
            const next = data.sequence[i+1];

            if (next) {
                item.next = next.down;
            } else {
                item.next = data.endTimeMs;
            }
        });

        const rows = LineModel.GetToneLineModelFromRecord(
            bpm, data.startTimeMs, data.sequence
        );
        this.liner.setData(rows);
        this.printChess(rows);
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
        const instrCode = this._instrCode;

        if (!this.isRecMode) {
            return;
        }

        if (type === DOWN && this.memoBuffer2.length) {
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

        if (type === UP && this.recData.keys[id]) {
            this.recData.keys[id].up = time;

            ideService.synthesizer.playSound({
                id,
                keyOrNote: this.recData.keys[id].note,
                onlyStop: true,
            });

            this.recData.keys[id] = null;

            return;
        }

        if (!this.memoBuffer2.length && type === DOWN) {
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

            this.getOut(this.page.bpmValue, this.recData);
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

    boardPopup: Dialog.Dialog;

    subscribePopupBoard(cb?: () => any) {
        getWithDataAttr('dynamic-tone-board').forEach(el => {
            el.addEventListener('pointerdown', () => {
                this.boardPopup.close(false);
            })
        });

        const parent = getWithDataAttr('dynamic-tone-board')[0] as HTMLElement;
        const playingNote: { [key: string]: string } = {};

        getWithDataAttr('note-key', parent).forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                keyId = el.dataset.noteCellGuid;
            }

            let lastPlayingNote = '';

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const instrCode = this._instrCode;

                ideService.synthesizer.playSound({
                    keyOrNote: this.playingNote[keyId],
                    id: keyId,
                    onlyStop: true,
                });

                playingNote[keyId] = keyOrNote;
                // this.lastPlayingNote = keyOrNote;
                // this.lastNoteCellGuid = el?.dataset?.noteCellGuid || '';

                lastPlayingNote = keyOrNote;

                ideService.synthesizer.playSound({
                    keyOrNote,
                    id: keyId,
                    instrCode,
                });

                //this.setKeysColor();

                // if (this.isMemoMode) {
                //     this.pushNoteToMemo(keyOrNote);
                // }
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
                this.addOrDelNoteClick(el);
                this.boardPopup.close(false);
            });
        });
    }

    openGuitarBoard() {
        this.boardPopup = (this.page.context.$f7 as any).popup.create({
            content: `
                <div class="popup">
                    <div class="page">
                        <div class="page-content" data-dynamic-tone-board>
                            ${this.getGuitarBoard(<any>this.type)}
                            <br/>
                            <div style="margin-left: 1rem;">
                                <a 
                                    class="link"
                                    data-close-popup-board
                                >Close</a>
                            </div>                            
                        </div>                        
                    </div>
                </div>`.trim(),
            on: {
                opened: () => {
                    this.subscribePopupBoard();
                }
            }
        });

        this.boardPopup.open(false);
    }

    openHarmonicaBoard() {
        this.boardPopup = (this.page.context.$f7 as any).popup.create({
            content: `
                <div class="popup">
                    <div class="page">
                        <div class="navbar">
                            <div class="navbar-bg"></div>
                            <div class="navbar-inner">
                                <div class="title">Dynamic Popup</div>
                                <div class="right"><a  class="link popup-close">Close</a></div>
                            </div>
                        </div>
                        <div class="page-content" data-dynamic-tone-board>
                            ${this.getHarmonicaBoard()}
                        </div>
                    </div>
                </div>`.trim(),
            on: {
                opened: () => {
                    this.subscribePopupBoard();
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

        const boardContent = this.getGuitarBoard(<any>this.type, settings);

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

        const boardContent = this.getGuitarBoard(<any>this.type, settings);

        getWithDataAttr('guitar-board-wrapper').forEach(el => {
            el.innerHTML = boardContent;
        });

        this.subscribeBoardEvents();
    }

    lastNoteCellGuid = '';

    subscribeBoardEvents() {
        const pageEl = this.page.pageEl;

        getWithDataAttr('note-key', pageEl).forEach((el: HTMLElement) => {
            const keyboardId = el.dataset.keyboardId;
            const keyOrNote = el.dataset.noteLat || '';
            let keyId = keyboardId;

            if (this.type === 'bassGuitar' || this.type === 'guitar') {
                keyId = el.dataset.noteCellGuid;
            }

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const instrCode = this._instrCode;

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

        getWithDataAttrValue('action-tone', 'memo-mode', pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.toggleMemo());
        });

        getWithDataAttrValue('action-tone', 'memo-clear',pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.pushNoteToMemo(null));
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

    playOne() {
        this.page.stop();

        const notes = LineModel.GetToneNotes({
            blockName: 'temp',
            instr: hlp.instrName[this._instrCode],
            chnl: this.type === 'bassGuitar' ? '$bass' : '$guit',
            rows: this.liner.lines,
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

    printChess(rows: Line[]) {
        let totalOut = '';
        let height = 1.26;
        let width = 1.26;
        let rowHeight = 1.4;

        const boxedRows: {
            row: Line,
            cols: hlp.ChessCell[],
            cells: hlp.ChessCell[],
            rowBorderBottom: string,
        }[] = rows.map((row, iRow) => {
            const box = { row, cells: [] } as any;
            const nextRow = rows[iRow + 1];
            const hasLine = (!!nextRow && nextRow.blockOffsetQ !== row.blockOffsetQ);

            box.rowBorderBottom = hasLine ? '1px solid gray;' : 'none;';

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
            // ROW
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
                    border-bottom: ${box.rowBorderBottom};
                ">`;

            // COLS
            box.cols.forEach(col => {
                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
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
                            width: ${width}${rem};
                            height: ${height}${rem};
                            background-color: ${col.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${col.colInd * width}${rem};
                        "
                    ></span>`.trim();
            });

            // CELLS
            box.cells.forEach(cell => {
                if (!cell.cellId) return;

                const textDecoration = cell.underline ? 'underline' : 'none';

                totalOut = totalOut +
                    `<span
                        data-chess-cell-row="${iRow}"
                        data-chess-cell-col="${cell.colInd}"
                        data-chess-cell-row-col="${iRow}-${cell.colInd}"                                                
                        data-chess-cell-id="${cell.cellId}"
                        data-chess-total-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-offset="${cell.totalOffsetQ}"
                        data-chess-cell-with-id-row-col="${iRow}-${cell.colInd}"                                                                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${width}${rem};
                            height: ${height}${rem};
                            background-color: ${cell.bgColor};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            z-index: 0;
                            text-decoration: ${textDecoration};
                            left: ${cell.colInd * width}${rem};
                        "
                    >${cell.char}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        // UPDATE CHESS
        const el = dyName('chess-wrapper', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeChess();
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

    subscribeDurationCommands() {
        super.subscribeDurationCommands();

        getWithDataAttr('get-note-for-cell-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => {
                if (this.type === 'bassGuitar' || this.type === 'guitar') {
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
// setStringCount  setGuitarOffset  fixBoardCell  setKeysColor
//
// CHESS
// printChess getChessLine getChessCellFor
//
// EVENTS
// subscribeEvents
// subscribeCommonCommands subscribeEditCommands
// subscribeBoardEvents    subscribePopupBoardEvents
//
// RECORD
// getOut
// toggleRecord handleKeyRecord  clearRecordData  getBeatContent
//
//
// MEMO
// toggleMemo pushNoteToMemo
//
// PLAY
// playOne
