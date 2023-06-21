import {drumInfo} from '../libs/muse/drums';
import {dyName, getWithDataAttr, getWithDataAttrValue} from '../src/utils';
import {Synthesizer} from '../libs/muse/synthesizer';
import * as un from '../libs/muse/utils/utils-note';

interface Page {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    //getOut(bpm: number, seq: DrumCtrl['keySequence'] );
    synthesizer: Synthesizer;
}

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

type KeyData = {
    quarterTime: number;
    quarterNio: number;
    //quarterInfo: string;
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
    color?: string;
};

type ModelItem = {
    nio: number;
    lineNio: number;
    cellSize: number;
    lineDurQ: number;
    cellInd: number;
    durCell: number;
    durQ: number;
    durForNextCell: number;
    durForNextQ: number;
    note: string;
    colorHead?: string;
    colorBody?: string;
    startOffsetQ: number;
};

type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
};


type Line = {
    ind: number,
    durQ: number,
    startOffsetQ: number,
    notes: ModelItem[],
    cellSizeQ: number,
}

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

export class DrumCtrl {
    bpmInfo: BpmInfo = emptyBpmInfo();
    mode: 'record' | null = null;
    keyData: KeyData | null = null;
    keySequence: KeyData[] = [];
    lastTickTime: number = 0;
    tickStartMs: number = 0;
    model: Line[] = [];

    constructor(public page: Page) {}

    subscribeEvents() {
        const page = this.page;
        const pageEl = page.pageEl;

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

            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                evt.preventDefault();
                evt.stopImmediatePropagation();

                const time = Date.now();

                if (this.mode === 'record') {
                    return this.handleKeyRecord(note1, time, color, DOWN);
                }

                notes.forEach(keyOrNote => {
                    page.synthesizer.playSound({
                        keyOrNote,
                        volume,
                        id: keyboardId,
                        onlyStop: false,
                    });

                    //this.handleKeyRecord(keyOrNote, time, DOWN);
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
                    return this.handleKeyRecord(note1, time, color, UP);
                }

                notes.forEach(keyOrNote => {
                    page.synthesizer.playSound({
                        keyOrNote,
                        id: keyboardId,
                        onlyStop: true,
                    });

                    //this.handleKeyRecord(keyOrNote, time, UP);
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

    getCommandPanel(): string {
        const style="font-size: 1.25rem; user-select: none; touch-action: none;"

        return `
                <div style="width: 90%; padding: .5rem; user-select: none; touch-action: none;">
                    <!--span 
                        style="font-size: 1.5rem; user-select: none; touch-action: none;"
                        data-action-drum="clear"
                    >clr&nbsp;&nbsp;</span-->                
                    <span
                        style="${style}"
                        data-action-drum="record"
                    >rec&nbsp;&nbsp;</span>
                    <span
                        style="${style}"
                        data-action-type="stop"
                    >stop&nbsp;&nbsp;</span>                                        
                    <span
                        style="${style}"
                        data-action-type="tick"
                    >1:4&nbsp;&nbsp;</span>
                    <span
                        style="${style}"
                        data-action-type="tick"
                    >3:4&nbsp;&nbsp;</span>                    
                    <span
                        style="${style}"
                        data-action-out="play"
                    >play&nbsp;&nbsp;</span>
                </div>
                <div style="width: 90%; margin: .5rem; user-select: none;">
                    <span 
                        style="${style}"
                        data-action-out="left"
                    >lft&nbsp;&nbsp;</span>                
                    <span
                        style="${style}"
                        data-action-out="right"
                    >rgt&nbsp;&nbsp;</span>
                    <span
                        style="${style}"
                        data-action-out="clear"
                    >clr&nbsp;&nbsp;</span>                                        
                    <span
                        style="${style}"
                        data-action-out="delete"
                    >del&nbsp;&nbsp;</span>                    
                    <span
                        style="${style}"
                        data-action-out="add"
                    >add&nbsp;&nbsp;</span>
                    <span
                        style="${style}"
                        data-action-out="sub"
                    >sub&nbsp;&nbsp;</span>                    
                </div>
        `.trim();
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
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightblue; user-select: none; touch-action: none;"
                                data-action-drum-key="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"  
                                data-color="steelblue"                              
                            >
                                <!--<br/>&nbsp;K-k-->
                            </div>
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightgreen; user-select: none; touch-action: none;"
                                data-action-drum-key="cowbell"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="seagreen"                                
                            >
                                <!--<br/>&nbsp;T-t-->
                            </div>
                        </div>                        
                        
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty0"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="lightgray"                                
                            >         
                                <!--<br/>&nbsp;?-->
                            </div>
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="bd+hc"  
                                data-color="lightgray"
                            >  
                                <!--<br/>&nbsp;X-x-->
                            </div>   
                        </div>
                                                 
                        <div
                            style="display: flex; width: 100%; height: ${midRowHeight/2}rem; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="hc"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-highlight-drum="sn+hc"  
                                data-color="lightgray"
                            >       
                                <!--<br/>&nbsp;X-x-->
                            </div>
                            
                        
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}rem; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty1"
                                data-keyboard-id="${keyboardId}-${ind++}"   
                                data-color="lightgray"
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
                        >
                            <!--&nbsp;V-v-->
                        </div>
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}rem; text-align: center; user-select: none; touch-action: none;"                                                            
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

        console.log(drums);

        const content = `
            <div class="page-content" style="padding-top: 0; padding-bottom: 2rem;">
                ${metronome}
                ${this.getDrumBoardContent(keyboardId)}
                ${this.getCommandPanel()}
                
                <div
                    data-name="drum-record-out"
                    style="width: 90%; padding-left: 1%;"
                ></div>

                <div style="font-size: 1.5rem;">
                    ${drums}
                </div>
                
                <div 
                    data-name="drum-patterns"                
                    style="width: 90%; padding-left: 1%;"
                >
                    ${this.getPatternsContent()}               
                </div>                
            </div>`.trim();

        return content;
    }

    handleKeyRecord(code: string, time: number, color: string, type: 0 | 1) {
        //console.log(code, time, type);

        if (this.mode !== 'record') {
            return;
        }

        // ПЕРВОЕ НАЖАТИЕ
        if (!this.keyData && type === DOWN) {
            this.keyData = {
                code,
                down: time,
                note: code,
                up: 0,
                next: 0,
                //quarterTime: this.tickInfo.quarterTime,
                //quarterNio: this.tickInfo.quarterNio,
                quarterTime: 0,
                quarterNio: 0,
                color: color || 'black',
            };

            return;
        }

        if (
            this.keyData
            //&& ((type === UP && code === ctrl.keyData.code) || type === DOWN)
        ) {
            if (type === UP) {
                this.keyData.up = time;
                //this.playSound(this.keyData.note, true);
            }

            if (type === DOWN) {
                this.keyData.next = time;
                this.keySequence.push(this.keyData);

                this.keyData = {
                    code,
                    down: time,
                    note: code,
                    up: 0,
                    next: 0,
                    //quarterTime: this.tickInfo.quarterTime,
                    //quarterNio: this.tickInfo.quarterNio,
                    quarterTime: 0,
                    quarterNio: 0,
                    color: color || 'black',
                };

                //this.playSound(this.keyData.note);
            }
        }
    }

    getLineModel(bpm: number, seq: DrumCtrl['keySequence'] ): Line[] {
        let startTimeMs = this.tickStartMs;
        let qms = Math.round(60000/ bpm); // ms в четверти

        let lines: Line[] = [];

        // начало и номер четверти
        seq.forEach(item => {
            let diffMs = item.down - startTimeMs;
            let quarterNio = Math.floor(diffMs/qms);
            item.quarterTime = startTimeMs + (qms * quarterNio);
            item.quarterNio = quarterNio;
        });

        const lastInd = seq.length - 1;
        const firstTime = seq[0].quarterTime;
        const lastTime = seq[lastInd].next;

        // количество четвертей
        const quarterCount = Math.ceil((lastTime - firstTime)/qms);

        for (let ind = 0; ind < quarterCount; ind++) {
            lines.push({
                ind,
                durQ: 120,
                startOffsetQ: ind * 120,
                notes: [],
                cellSizeQ: 10,
            })
        }

        //console.log('seq', seq);
        //console.log('lines', lines);

        const getLineByStartOffsetQ = (startOffsetQ: number): Line => {
            return lines.find(item => {
                return startOffsetQ >= item.startOffsetQ && startOffsetQ < (item.startOffsetQ + item.durQ);
            });
        }

        seq.forEach((item, i) => {
            let itemNew: ModelItem = {
                nio: i,
                cellInd: 0,
                colorBody: '',
                colorHead: '',
                note: '',
                durForNextCell: 0,
                durForNextQ: 0,
                durCell: 0,
                durQ: 0,
                lineDurQ: 0,
                lineNio: 0,
                cellSize: 10,
                startOffsetQ: 0,
            }

            const startOffsetQ = Math.floor((item.down - firstTime) / qms * un.NUM_120 / 10) * 10;

            itemNew.startOffsetQ = startOffsetQ;
            itemNew.durQ = Math.floor(
                (item.up - item.down) / qms * un.NUM_120 / 10
            ) * 10 || 10;
            itemNew.colorHead = item.color;
            itemNew.note = item.note;

            let quarter = getLineByStartOffsetQ(startOffsetQ);
            if (quarter) quarter.notes.push(itemNew);
        });

        return lines;
    }

    getOut(bpm: number, seq: DrumCtrl['keySequence'] ) {
        const rows = this.getLineModel(bpm, seq);
        this.model = rows;

        const getMask = (count: number): {color: string, nio: string}[] => {
            const arr = Array(count).fill(null);
            return arr.map(() => ({
                color: 'whitesmoke',
                nio: '',
            }));
        }

        let totalOut = '';

        rows.forEach((row, iRow) => {
            totalOut = totalOut +
                '<div style="box-sizing: border-box; margin: 0; padding: 0; line-height: 0; user-select: none; touch-action: none;">';

            const cells = getMask(row.durQ / row.cellSizeQ);

            row.notes.forEach( info => {
                const iCell = (info.startOffsetQ - row.startOffsetQ) / 10;
                const cell = cells[iCell];
                cell.nio = info.nio.toString();
                cell.color = info.colorHead;
            });

            cells.forEach((cell, iCell) => {
                totalOut = totalOut +
                    `<div
                        data-drum-cell-row="${iRow}"
                        data-drum-cell-cell="${iCell}"                        
                        data-drum-cell-nio="${cell.nio}"
                        style="
                            box-sizing: border-box;
                            border: 1px solid white;
                            display: inline-block;
                            width: 7.5%;
                            height: 1.25rem;
                            background-color: ${cell.color};
                            user-select: none;
                            touch-action: none;
                        "
                    ></div>`.trim();

            });

            totalOut = totalOut + '</div>';
        });

        const el = dyName('drum-record-out', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = '' + (rows.length * 1.25) + 'rem';
        }
    }
}
