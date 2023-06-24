import { drumInfo } from '../libs/muse/drums';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import * as un from '../libs/muse/utils/utils-note';
import { parseInteger } from '../libs/common';
import { LineModel, Line, NoteItem, KeyData, Cell } from './line-model';
import { MultiPlayer } from '../libs/muse/multi-player';

interface Page {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    //getOut(bpm: number, seq: DrumCtrl['keySequence'] );
    synthesizer: Synthesizer;
    multiPlayer: MultiPlayer;
}

const drumKodes = [
    'bd', 'sn', 'hc',
    'tl', 'tm', 'th',
    'ho', 'hp', 'sr',
    'cc'
];

const someDrum = {
    note: '',
    headColor: 'lightgray',
    bodyColor: 'lightgray',
    char: '?',
}

const drumNotesInfo = {
    hc: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    sn: {
        note: 'sn',
        headColor: 'deeppink',
        bodyColor: 'lightgreen',
        char: 'V',
    },
    bd: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
    }
}


const drumKeysMap = {
    tl: {
        note: 'sr',
        headColor: 'steelblue',
        bodyColor: 'lightblue',
        char: 'k',
    },
    tm: {
        note: 'sr',
        headColor: 'seagreen',
        bodyColor: 'lightgreen',
        char: 't',
    },
    tr: {
        note: 'sn',
        headColor: 'deeppink',
        bodyColor: 'lightgreen',
        char: 'V',
    },

    mtl: {
        note: 'empty',
        headColor: 'whitesmoke',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    mtr: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },

    mbl: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    mbr: {
        note: 'empty',
        headColor: 'whitesmoke',
        bodyColor: 'whitesmoke',
        char: 'x',
    },

    bl: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
    },
    br: {
        note: 'empty',
        headColor: 'white',
        bodyColor: 'white',
        char: '',
    },
};

// const drumsMap = {
//     O: {
//         instr: 'drum_35',
//         note: 'bd',
//
//     },
//     V: {
//         note: 'sn',
//         instr: 'drum_40',
//     },
//     X: {
//         note: 'hc',
//         instr: 'drum_42',
//     },
// }

const mapToLetter = {
    'bd': 'O',
    'hc': 'X',
    'sn': 'V',
    'bd+hc': 'Q',
    'sn+hc': 'A',
    'hc+bd': 'Q',
    'hc+sn': 'A',
};

type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
};

const emptyBpmInfo = (): BpmInfo => {
    //console.log('getEmptyBpm');
    return {
        bpm: 0,
        lastDownTime: 0,
        pressCount: 0,
        totalMs: 0,
    };
};

const DOWN = 1;
const UP = 0;

type PrintCell = {
    id: number,
    color: string,
    text: string,
    startOffsetQ: number,
}

export class DrumCtrl {
    bpmInfo: BpmInfo = emptyBpmInfo();
    mode: 'record' | null = null;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];
    lastTickTime: number = 0;
    tickStartMs: number = 0;
    activeCellId = 0;
    activeCellNio = 0;
    activeCellRow = 0;
    activeCellRowNio = '';

    liner = new LineModel();

    constructor(public page: Page) {}

    selectItemById(id: number | string) {
        id = parseInteger(id, 0);

        getWithDataAttr('drum-cell-id', this.page.pageEl).forEach(el => {
            el.style.border = '1px solid white';
        });

        if (id) {
            getWithDataAttrValue('drum-cell-id', id).forEach(el => {
                el.style.border = '2px solid yellow';
            });
        }
    }

    selectItemByRowNio(rowNio?: string) {
        rowNio = rowNio || this.activeCellRowNio;

        getWithDataAttr('drum-cell-row-nio', this.page.pageEl).forEach(el => {
            el.style.border = '1px solid white';
        });

        getWithDataAttrValue('drum-cell-row-nio', rowNio).forEach(el => {
            el.style.border = '2px solid yellow';
        });
    }

    subscribeOutCells() {
        getWithDataAttr('drum-cell-row-nio', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('click', evt => {
                this.activeCellId = parseInteger(el.dataset['drumCellId'], 0); // data-drum-cell-id
                this.activeCellNio = parseInteger(el.dataset['drumCellNio'], 0); // data-drum-cell-nio
                this.activeCellRow = parseInteger(el.dataset['drumCellRow'], 0); // data-drum-cell-row
                this.activeCellRowNio = el.dataset['drumCellRowNio']; // data-drum-cell-row-nio
                this.selectItemByRowNio(this.activeCellRowNio);
            });
        });
    }

    subscribeEditCommands() {
        const moveItem = (id: number, value: number) => {
            const result = this.liner.moveItem(id, value);

            if (result) {
                this.printModel(this.liner.rows);
                this.selectItemById(this.activeCellId);
            }
        }

        getWithDataAttrValue('action-out', 'top', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                moveItem(this.activeCellId, -120);
            });
        });

        getWithDataAttrValue('action-out', 'bottom', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                moveItem(this.activeCellId, 120);
            });
        });

        getWithDataAttrValue('action-out', 'left', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                moveItem(this.activeCellId, -10);
            });
        });

        getWithDataAttrValue('action-out', 'right', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                moveItem(this.activeCellId, 10);
            });
        });

        getWithDataAttrValue('action-out', 'play', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const notes = this.liner.getDrumNotes('temp');

                if (!notes) return;

                let blocks = [
                    '<out r1>',
                    'temp',
                    notes
                ].join('\n');

                this.page.multiPlayer.tryPlayMidiBlock({
                    blocks,
                    bpm: this.page.bpmValue,
                });
            });
        });

        getWithDataAttrValue('action-out', 'delete', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const cell = getWithDataAttrValue('drum-cell-id', this.activeCellId)[0];

                if (!cell) return;

                const offsetQ = parseInteger(cell.dataset['offsetq'], null);

                if (offsetQ === null) return;

                this.liner.deleteCellByOffset(offsetQ);
                this.printModel(this.liner.rows);
                this.selectItemByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttr('action-drum-note', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const cell = getWithDataAttrValue('drum-cell-row-nio', this.activeCellRowNio)[0];

                if (!cell) return;

                const offsetQ = parseInteger(cell.dataset['offsetq'], null);

                if (offsetQ === null) return;

                const note = el.dataset['actionDrumNote'];

                if (!note) return;

                let noteInfo = (drumNotesInfo[note] || someDrum) as NoteItem;
                noteInfo = {
                    ...noteInfo,
                    note,
                    durQ: 10,
                }

                noteInfo = this.liner.addNoteByOffset(offsetQ, noteInfo);
                this.activeCellId = noteInfo.id;
                this.printModel(this.liner.rows);
                this.selectItemByRowNio(this.activeCellRowNio);

                //console.log(el.dataset);
            });
        });

        getWithDataAttrValue('action-out-row', 'add', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.addRowAfter(this.activeCellRow);
                this.printModel(this.liner.rows);
                this.selectItemByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttrValue('action-out-row', 'insert', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.addRowAfter(this.activeCellRow - 1);
                this.printModel(this.liner.rows);
                this.selectItemByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttrValue('action-out-row', 'delete', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.deleteRow(this.activeCellRow);
                this.printModel(this.liner.rows);
                this.selectItemByRowNio(this.activeCellRowNio);
            });
        });
    }


    subscribeEvents() {
        const page = this.page;
        const pageEl = page.pageEl;

        this.subscribeEditCommands();

        getWithDataAttrValue('action-drum', 'get-bpm-or-stop', pageEl)?.forEach((el: HTMLElement) => {
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

        // getWithDataAttrValue('action-drum', 'clear', this.pageEl)?.forEach((el: HTMLElement) => {
        //     el.addEventListener('pointerdown', (evt: MouseEvent) => {
        //         getWithDataAttrValue('action-drum', 'get-bpm-or-stop', this.pageEl)?.forEach((el: HTMLElement) => {
        //             this.drumCtrl.clearBpmInfo();
        //             el.innerText = '';
        //         });
        //     });
        // });

        getWithDataAttrValue('action-drum', 'record', pageEl)?.forEach((el: HTMLElement) => {
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

        getWithDataAttr('action-drum-key', pageEl)?.forEach((el: HTMLElement) => {
            //console.log(el, el.dataset['actionDrum']);

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

    clearRecordData() {
        this.keyData = null;
        this.keySequence = [];
        this.lastTickTime = 0;
    }

    clearBpmInfo() {
        this.bpmInfo = emptyBpmInfo();
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid gray; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 85%; font-family: monospace; margin-top: .5rem; margin-bottom: .5rem; margin-left: 2%; user-select: none;`;
        let result = '';

        result = `
            <div style="${rowStyle}">
                <!--span 
                    style="font-size: 1.5rem; user-select: none; touch-action: none;"
                    data-action-drum="clear"
                >clr&nbsp;&nbsp;</span-->                
                <span
                    style="${style}"
                    data-action-drum="record"
                >rec</span>
                <span
                    style="${style}"
                    data-action-out="empty"
                >&nbsp;&nbsp;&nbsp;</span>                    
                <span
                    style="${style}"
                    data-action-type="stop"
                >stp</span>                                        
                <span
                    style="${style}"
                    data-action-type="tick"
                >1:4</span>
                <!--span
                    style="${style}"
                    data-action-type="tick"
                >3:4&nbsp;</span-->                    
                <span
                    style="${style}"
                    data-action-out="play"
                >ply</span>
            </div>
            <div style="${rowStyle}">
                <!--span 
                    style="font-size: 1.5rem; user-select: none; touch-action: none;"
                    data-action-drum="clear"
                >clr&nbsp;&nbsp;</span-->                
                <span
                    style="${style}"
                    data-action-drum="empty"
                >&nbsp;&nbsp;&nbsp;</span>
                <span
                    style="${style}"
                    data-action-out="top"
                >&nbsp;&uarr;&nbsp;</span>                    
                <span
                    style="${style}"
                    data-action-type="empty"
                >&nbsp;&nbsp;&nbsp;</span>                                        
                <span
                    style="${style}"
                    data-action-type="empty"
                >&nbsp;&nbsp;&nbsp;</span>
                <!--span
                    style="${style}"
                    data-action-type="tick"
                >3:4&nbsp;</span-->                    
                <span
                    style="${style}"
                >&nbsp;&nbsp;&nbsp;</span>                
            </div>
            <div style="${rowStyle}">
                <span 
                    style="${style}"
                    data-action-out="left"
                >&nbsp;&lt;&nbsp;</span>  
                <span
                    style="${style}"
                    data-action-out="bottom"
                >&nbsp;&darr;&nbsp;</span>                                  
                <span
                    style="${style}"
                    data-action-out="right"
                >&nbsp;&gt;&nbsp;</span>
                <span
                    style="${style}"
                >&nbsp;&nbsp;&nbsp;</span>                
                <span
                    style="${style}"
                    data-action-out="delete"
                >del</span>                                                                        
            </div>
            
            <div style="${rowStyle}">
                <span 
                    style="${style}"
                    data-action-out-row="add"
                >addR</span>  
                <span
                    style="${style}"
                    data-action-out-row="insert"
                >insR</span>                                  
                <span
                    style="${style}"
                    data-action-out-row="delete"
                >delR</span>                    
            </div>            
        `.trim();

        let instrPanel = ''

        drumKodes.forEach(note => {
            instrPanel = instrPanel + `
                <span
                    style="${style}"
                    data-action-drum-note="${note}"
                >${note}</span>
            `;
        });
        instrPanel = `<div style="${rowStyle}">${instrPanel}</div>`;

        return result + instrPanel;
    }


    getDrumBoardContent(keyboardId: string): string {
        const topRowHeight = 5;
        const midRowHeight = 10;
        const botRowHeight = 5;
        let ind = 0;

        const content = `
                <div style="display: flex; user-select: none; touch-action: none; position: relative;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <!-- cowbell -->
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightblue; user-select: none; touch-action: none;"
                                data-action-drum-key="sr"
                                data-keyboard-id="${keyboardId}-${ind++}"  
                                data-color="steelblue"
                                data-color2="lightblue"
                                data-char="k"
                            >
                                <!--<br/>&nbsp;K-k-->
                            </div>
                            <!-- cowbell -->                            
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightgreen; user-select: none; touch-action: none;"
                                data-action-drum-key="sr"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="seagreen"                                
                                data-color2="lightgreen"
                                data-char="t"
                            >
                                <!--<br/>&nbsp;T-t-->
                            </div>
                        </div>                        
                        
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="lightgray"
                                data-color2="whitesmoke"                                                                
                            >         
                                <!--<br/>&nbsp;?-->
                            </div>
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: lightgray; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="bd+hc"  
                                data-color="lightgray"
                                data-color2="whitesmoke"
                                data-char="x"
                            >  
                                <!--<br/>&nbsp;X-x-->
                            </div>   
                        </div>
                                                 
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: lightgray; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="sn+hc"  
                                data-color="lightgray"
                                data-color2="whitesmoke"
                                data-char="x"
                            >       
                                <!--<br/>&nbsp;X-x-->
                            </div>
                            
                        
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty"
                                data-keyboard-id="${keyboardId}-${ind++}"   
                                data-color="lightgray"
                                data-color2="whitesmoke"
                            >     
                                <!--<br/>&nbsp;?-->
                            </div>   
                        </div>                        
                        
                        <div
                            style="width: 100%; height: ${botRowHeight}rem; background-color: tan; user-select: none; touch-action: none;"
                            data-action-drum-key="bd"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="bd+hc"
                            data-color="sienna"
                            data-color2="tan"
                            data-char="O"
                        >
                            <!--&nbsp;O-o-->
                        </div>                    
                    </div>

                    <div style="width: 33%; user-select: none; touch-action: none;">
                        <div
                            style="height: ${midRowHeight}rem; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
                            data-action-drum-key="sn"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-highlight-drum="sn+hc"
                            data-color="deeppink"                                                                                    
                            data-color2="lightpink"
                            data-char="V"
                        >
                            <!--&nbsp;V-v-->
                        </div>
                        
                        <div 
                            style="background-color: antiquewhite; width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"                                                            
                        >
                            <!--data-action-drum-key="sn+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;A-a-->
                        </div>                        
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"
                            data-action-drum="get-bpm-or-stop"
                        >
                            <!--data-action-drum-key="bd+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;Q-q-->
                        </div>
                    </div>
                                           
                    <div 
                        style="font-size: 1.7rem; font-family: monospace; height: 20rem; width: 100%; position: absolute; top: 0; pointer-events: none; user-select: none; touch-action: none; padding-left: .5rem;"
                        data-name="drum-text-under-board"
                    >
                    </div>
                </div>
            `.trim();

        return content;
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
        let metronome = `
            <div style="padding: 1rem .5rem 1rem .5rem;">
                &emsp;${this.page.getMetronomeContent()}
            </div>`.trim();

        let drums = Object.keys(drumInfo).reduce((acc, key) => {
            const info = drumInfo[key];
            const label = key === info.noteLat ? key: `${key}:${info.noteLat}`;

            acc = acc + `
                <a data-action-drum-key="${info.noteLat}" style="user-select: none;">${label}</a>&emsp;            
            `.trim();

            return acc;
        }, '');

        //console.log(drums);

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${metronome}
                ${this.getDrumBoardContent(keyboardId)}
                ${this.getTopCommandPanel()}
                
                <div
                    data-name="drum-record-out"
                    style="width: 90%; padding-left: 2%;"
                ></div>

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
        //console.log(code, time, type);

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
        this.printModel(rows);
    }

    printModel(rows: Line[]) {
        const getMask = (count: number): PrintCell[] => {
            const arr = Array(count).fill(null);
            return arr.map(() => ({
                color: 'whitesmoke',
                id: 0,
                text: '',
                startOffsetQ: 0,
            }));
        }

        let totalOut = '';
        let height = 1.25;

        rows.forEach((row, iRow) => {
            const offsets = this.liner.getOffsetsByRow(row);

            totalOut = totalOut +
                `<div style="
                    box-sizing: border-box;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    font-size: 1rem;
                    line-height: 1rem;
                    color: white;                    
                    user-select: none;
                    height: ${height}rem;                    
                ">`;

            const cellSizeQ = 10;
            const cols = getMask(row.durQ / row.cellSizeQ);
            cols.forEach((col, i) => {
               col.startOffsetQ = row.startOffsetQ + (cellSizeQ * i);
            });

            for (let offset of offsets) {
                const iCell = (offset - row.startOffsetQ) / cellSizeQ;
                const notes = this.liner.getNotesListByOffset(row, offset);
                let mainNote = notes.find(item => item.note === 'bd') || notes.find(item => item.note === 'sn');
                let text = '';

                if (mainNote) {
                    text = mainNote.char;
                    if (notes.find(item => item.note === 'hc')) {
                        text = mainNote.note === 'bd' ? 'Q' : 'A';
                    }
                }
                else {
                    mainNote = notes[0];
                    text = mainNote.char;
                }

                const col = cols[iCell];

                col.id = mainNote.id;
                col.color = mainNote.headColor;
                col.text = text;
                col.startOffsetQ = mainNote.startOffsetQ;
            }

            cols.forEach((col, iCol) => {
                totalOut = totalOut +
                    `<span
                        data-drum-cell-row="${iRow}"
                        data-drum-cell-nio="${iCol}"
                        data-drum-cell-row-nio="${iRow}-${iCol}"
                        data-drum-cell-id=""
                        data-offsetq="${col.startOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${height}rem;
                            height: ${height}rem;
                            background-color: ${col.color};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            left: ${iCol * height}rem;
                        "
                    ></span>`.trim();
            });

            cols.forEach((cell, iCell) => {
                if (!cell.id) return;

                totalOut = totalOut +
                    `<span
                        data-drum-cell-row="${iRow}"
                        data-drum-cell-nio="${iCell}"
                        data-drum-cell-row-nio="${iRow}-${iCell}"                                                
                        data-drum-cell-id="${cell.id}"
                        data-offsetq="${cell.startOffsetQ}"                        
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            position: absolute;
                            width: ${height}rem;
                            height: ${height}rem;
                            background-color: ${cell.color};
                            user-select: none;
                            touch-action: none;
                            text-align: center;
                            font-weight: 700;
                            left: ${iCell * height}rem;
                        "
                    >${cell.text}</span>`.trim();
            });

            totalOut = totalOut + '</div>';
        });

        const el = dyName('drum-record-out', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = '' + (rows.length * 1.25) + 'rem';
        }

        this.subscribeOutCells();
    }
}
