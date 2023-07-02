import { drumInfo } from '../libs/muse/drums';
import { dyName, getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import * as un from '../libs/muse/utils/utils-note';
import { parseInteger } from '../libs/common';
import { LineModel, Line, NoteItem, KeyData, Cell } from './line-model';
import { MultiPlayer } from '../libs/muse/multi-player';
import { getMidiConfig, MidiConfig } from '../libs/muse/utils/getMidiConfig';
import ideService from './ide/ide-service';
import { getOutBlocksInfo } from '../libs/muse/utils/getOutBlocksInfo';
import { ComponentContext } from 'framework7/modules/component/component';
import {createOutBlock, TextBlock} from '../libs/muse/utils/utils-note';

const ids = {
    editingItem: 'editing-item',
    duration: 'duration',
    rowInPart: 'row-in-part',
    partIndex: 'part-index',
    songName: 'song-name',
    ideAction: 'ide-action',
    ideContent: 'ide-content',
    bottomCommandPanel: 'bottom-command-panel',
};

interface Page {
    bpmValue: number;
    pageEl: HTMLElement;
    getMetronomeContent(): string;
    stopTicker();
    stop();
    //getOut(bpm: number, seq: DrumCtrl['keySequence'] );
    synthesizer: Synthesizer;
    multiPlayer: MultiPlayer;
    context: ComponentContext,
}

const drumKodes = [
    'bd', 'sn', 'hc',
    'tl', 'tm', 'th',
    // 'ho', 'hp', 'sr',
    // 'cc'
];

const someDrum = {
    note: '',
    headColor: 'lightgray',
    bodyColor: 'lightgray',
    char: '?',
}

// black deeppink sienna
const drumNotesInfo = {
    bd: {
        note: 'bd',
        headColor: 'sienna',
        bodyColor: 'tan',
        char: 'O',
    },
    sn: {
        note: 'sn',
        headColor: 'deeppink',
        bodyColor: 'lightgreen',
        char: 'V',
    },
    hc: {
        note: 'hc',
        headColor: 'lightgray',
        bodyColor: 'whitesmoke',
        char: 'x',
    },
    tl: {
        note: 'tl',
        headColor: 'lightgray',
        bodyColor: 'lightgray',
        char: 'l',
    },
    tm: {
        note: 'tm',
        headColor: 'seagreen',
        bodyColor: 'lightgreen',
        char: 'm',
    },
    th: {
        note: 'th',
        headColor: 'steelblue',
        bodyColor: 'lightblue',
        char: 'h',
    },
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
}

type EditedItem = {
    rowInPartId: string,
    rowInPart: number,
    songName: string,
    duration: number,
    partIndex: number,
}

type PrintCell = {
    noteId: number,
    cellId: number,
    bgColor: string,
    char: string,
    startOffsetQ: number,
    totalOffsetQ: number,
    underline: boolean,
}

type StoredItem = {
    rowInPartId: string,
    type: string,
    status: string,
    rows: Line[]
}

type StoredSongNode ={
    [key: string]: {
        items: StoredItem[]
    }
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
    editedItems: EditedItem[] = [];

    constructor(public page: Page) {}

    highlightCellById(id: number | string) {
        id = parseInteger(id, 0);

        getWithDataAttr('drum-cell-id', this.page.pageEl).forEach(el => {
            el.style.outline = null;
            el.style.zIndex = '0';
            el.dataset['selected'] = '';
        });

        if (id) {
            getWithDataAttrValue('drum-cell-id', id).forEach(el => {
                el.style.outline = '3px solid yellow';
                el.style.zIndex = '1';
                el.dataset['selected'] = 'true';
            });
        }
    }

    highlightCellByRowNio(rowNio: string, highlight: boolean = true) {
        rowNio = rowNio || this.activeCellRowNio;

        getWithDataAttr('drum-cell-row-nio', this.page.pageEl).forEach(el => {
            el.style.outline = null;
            el.style.zIndex = '0';
            el.dataset['selected'] = '';
        });

        if (highlight) {
            getWithDataAttrValue('drum-cell-row-nio', rowNio).forEach(el => {
                el.style.outline = '3px solid yellow';
                el.style.zIndex = '1';
                el.dataset['selected'] = 'true';
            });
        }
    }

    get hasEditedItems(): boolean {
        return !!this.editedItems.length;
    }

    get hasIdeItem(): boolean {
        const item = ideService.currentEdit;

        return !!item && !!item.editIndex && !!item.outList &&  !!item.outBlock && !!item.blocks;
    }

    saveEditingItems() {
        if (!this.hasEditedItems) return;

        let songName = this.editedItems[0].songName;
        let songNode: StoredSongNode;

        if (!localStorage.getItem(songName)) {
            songNode = {};
        } else {
            songNode = JSON.parse(localStorage.getItem(songName));
        }

        this.editedItems.forEach(item => {
            const rows = this.liner.rows.filter(row => row.rowInPartId === item.rowInPartId);
            if (!rows.length) return;

            let itemsNode = songNode[item.rowInPartId];
            if (!itemsNode) {
                itemsNode = {
                    items: []
                };
                songNode[item.rowInPartId] = itemsNode;
            }

            let drumsNode = itemsNode.items.find(iItem => iItem.rowInPartId === item.rowInPartId && iItem.type === 'drums');
            if (!drumsNode) {
                drumsNode = {
                    rowInPartId: item.rowInPartId,
                    type: 'drums',
                    status: 'draft',
                    rows: []
                };
                itemsNode.items.push(drumsNode);
            }

            drumsNode.rows = rows;
        });

        localStorage.setItem(songName, JSON.stringify(songNode));
    }

    addEditingItem(item: EditedItem, el: HTMLElement) {
        if (this.editedItems.find(iItem => iItem.rowInPart === item.rowInPart)) {
            this.editedItems = this.editedItems.filter(iItem => iItem.rowInPart !== item.rowInPart);
            el.style.fontWeight = '400';

            return;
        }

        this.editedItems.push(item);
        el.style.fontWeight = '600';
        this.liner.sortByField(this.editedItems, 'rowInPart');

        // let offsetFromStart = 0;
        // this.editedItems.forEach(item => {
        //     item.offsetFromStart = offsetFromStart;
        //     offsetFromStart = offsetFromStart + item.duration;
        // });
    }

    songRowClick(el: HTMLElement) {
        const item: EditedItem = {
            rowInPartId: el.dataset['editingItem'],
            songName: el.dataset['songName'],
            duration: parseInteger(el.dataset['duration'], 0),
            partIndex: parseInteger(el.dataset['partIndex'], 0),
            rowInPart: parseInteger(el.dataset['rowInPart'], 0),
        };

        this.addEditingItem(item, el);

        let rows = [];
        let blockOffsetQ = 0;

        this.editedItems.forEach(editedItem => {
            let iRows: Line[] = this.liner.rows.filter(row => row.rowInPartId === editedItem.rowInPartId);

            let songNode: StoredSongNode = localStorage.getItem(editedItem.songName) as any;
            if (!iRows.length && songNode) {
                songNode = JSON.parse(songNode as any as string);

                if (songNode[editedItem.rowInPartId]) {
                    let items = songNode[editedItem.rowInPartId].items;
                    let node = items.find(item => item.rowInPartId === editedItem.rowInPartId && item.type === 'drums');
                    if (node) {
                        iRows = node.rows;
                    }
                }
            }

            if (!iRows.length) {
                iRows = this.liner.getLinesByMask(editedItem.duration);
            }

            iRows.forEach(row => {
                row.rowInPartId = editedItem.rowInPartId;
                row.blockOffsetQ = blockOffsetQ;
            });

            rows = [...rows, ...iRows];
            blockOffsetQ = blockOffsetQ + editedItem.duration;
        });

        this.liner.setData(rows);
        this.printModel(this.liner.rows);
    }

    playBoth() {
        if (!this.hasEditedItems) return;

        let playRows: string[] = [];

        const midiConfig = this.getMidiConfig();
        let blocks = midiConfig.blocks;
        let playBlock = midiConfig.playBlockOut as TextBlock;

        this.editedItems.forEach(item => {
            let playRow = un.clearEndComment(playBlock.rows[item.rowInPart + 1]);
            const rows = this.liner.rows.filter(row => row.rowInPartId === item.rowInPartId)
            const notes = this.liner.getDrumNotes(ideService.guid.toString(), rows);

            if (notes) {
                const block = un.getTextBlocks(notes)[0];

                playRows.push(`${playRow} ${block.id}`);
                blocks = [...blocks, block];
            } else {
                playRows.push(`${playRow}`);
            }
        });

        playBlock = createOutBlock({
            id: 'out',
            type: 'set',
            rows: playRows,
            bpm: this.page.bpmValue
        });

        this.page.stop();
        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            playBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            metaByLines: ideService.currentEdit.metaByLines,
        });
    }

    subscribeIdeEvents() {
        getWithDataAttrValue(ids.ideAction, 'play-both', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => this.playBoth());
        });

        getWithDataAttrValue(ids.ideAction, 'draft', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => this.saveEditingItems());
        });

        getWithDataAttrValue(ids.ideAction, 'back', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                this.page.context.$f7router.navigate(`/mbox/${ideService.currentEdit.name}/`);
            });
        });

        getWithDataAttr(ids.editingItem, this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => this.songRowClick(el));
        });

        getWithDataAttrValue(ids.ideAction, 'clear', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                ideService.currentEdit = {} as any;
                this.editedItems = [];
                getWithDataAttr(ids.ideContent, this.page.pageEl)?.forEach((el: HTMLElement) => {
                    el.innerHTML = null;
                });
                getWithDataAttr('bottom-command-panel', this.page.pageEl)?.forEach((el: HTMLElement) => {
                    el.innerHTML = null;
                });
                getWithDataAttr('row-actions', this.page.pageEl)?.forEach((el: HTMLElement) => {
                    el.style.display = 'block';
                });
                this.liner.fillLinesStructure('480');
                this.printModel(this.liner.rows);
            });
        });

        getWithDataAttrValue(ids.ideAction, 'play-active', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                if (!this.hasEditedItems) return;

                const midiConfig = this.getMidiConfig();
                const playBlock = midiConfig.playBlockOut as TextBlock;
                const playingRows = this.editedItems.map(item => {
                    return playBlock.rows[item.rowInPart + 1]
                })

                const newOutBlock = createOutBlock({
                    id: 'out',
                    type: 'set',
                    rows: playingRows,
                    bpm: this.page.bpmValue
                });

                this.page.stop();
                this.page.multiPlayer.tryPlayMidiBlock({
                    blocks: midiConfig.blocks,
                    playBlock: newOutBlock,
                    bpm: this.page.bpmValue,
                    repeatCount: 1,
                    metaByLines: ideService.currentEdit.metaByLines,
                });
            });
        });

        getWithDataAttrValue(ids.ideAction, 'stop', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', evt => {
                this.page.stop();
            });
        });
    }

    subscribeOutCells() {
        getWithDataAttr('drum-cell-row-nio', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('click', evt => {
                //console.log(el.dataset);

                if (!el.dataset['selected']) {
                    this.activeCellId = parseInteger(el.dataset['drumCellId'], 0); // data-drum-cell-id
                    this.activeCellNio = parseInteger(el.dataset['drumCellNio'], 0); // data-drum-cell-nio
                    this.activeCellRow = parseInteger(el.dataset['drumCellRow'], 0); // data-drum-cell-row
                    this.activeCellRowNio = el.dataset['drumCellRowNio']; // data-drum-cell-row-nio
                    this.highlightCellByRowNio(this.activeCellRowNio);
                } else {
                    this.highlightCellByRowNio(this.activeCellRowNio, false);

                    this.activeCellId = 0;
                    this.activeCellNio = 0;
                    this.activeCellRow = 0;
                    this.activeCellRowNio = '';
                }
            });
        });
    }

    subscribeEditCommands() {
        const moveItem = (id: number, value: number) => {
            const result = this.liner.moveCell(id, value);

            //console.log(result);
            //console.log(this.liner.rows);

            if (result) {
                this.printModel(this.liner.rows);
                this.highlightCellById(this.activeCellId);
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

        getWithDataAttrValue('action-out', 'play-one', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const notes = this.liner.getDrumNotes('temp');

                if (!notes) return;

                let blocks = [
                    '<out r100>',
                    'temp',
                    notes
                ].join('\n');

                this.page.stop();
                this.page.multiPlayer.tryPlayMidiBlock({
                    blocks,
                    bpm: this.page.bpmValue,
                });
            });
        });

        getWithDataAttrValue('action-out', 'test', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                // 3*(2*120+1*60)_2*60
                //this.liner.fillLinesStructure('1*120_1*60_1*120_1*60');
                this.liner.fillLinesStructure('480');
                this.printModel(this.liner.rows);

            });
        });

        getWithDataAttrValue('action-out', 'delete', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const cell = getWithDataAttrValue('drum-cell-id', this.activeCellId)[0];

                if (!cell) return;

                const totalOffset = parseInteger(cell.dataset['totalOffset'], null);

                if (totalOffset === null) return;

                this.liner.deleteCellByOffset(totalOffset);
                this.printModel(this.liner.rows);
                this.highlightCellByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttr('action-drum-note', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                const cell = getWithDataAttrValue('drum-cell-row-nio', this.activeCellRowNio)[0];

                if (!cell) return;

                const totalOffsetQ = parseInteger(cell.dataset['totalOffset'], null);

                if (totalOffsetQ === null) return;

                const note = el.dataset['actionDrumNote'];

                if (!note) return;

                let noteInfo = (drumNotesInfo[note] || someDrum) as NoteItem;
                noteInfo = {
                    ...noteInfo,
                    note,
                    durQ: 10,
                }

                const notes = this.liner.getNotesByOffset(totalOffsetQ);

                for (let iNote of notes) {
                    if (iNote.note === note) {
                        return;
                    }
                }

                noteInfo = this.liner.addNoteByOffset(totalOffsetQ, noteInfo);
                this.activeCellId = noteInfo.id;
                this.printModel(this.liner.rows);
                this.highlightCellByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttrValue('action-out-row', 'add', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.addRowAfter(this.activeCellRow);
                this.printModel(this.liner.rows);
                this.highlightCellByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttrValue('action-out-row', 'insert', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.addRowAfter(this.activeCellRow - 1);
                this.printModel(this.liner.rows);
                this.highlightCellByRowNio(this.activeCellRowNio);
            });
        });

        getWithDataAttrValue('action-out-row', 'delete', this.page.pageEl)?.forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', (evt: MouseEvent) => {
                this.liner.deleteRow(this.activeCellRow);
                this.printModel(this.liner.rows);
                this.highlightCellByRowNio(this.activeCellRowNio);
            });
        });
    }


    subscribeEvents() {
        const page = this.page;
        const pageEl = page.pageEl;

        this.subscribeEditCommands();
        this.subscribeIdeEvents();

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

    getBottomCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let result = '';

        result = `
            <div data-bottom-command-panel>
                <div style="${rowStyle}">
                    <!--span 
                        style="${style}"
                        data-ide-action="ready"
                    >ready</span-->
                    <span
                        style="${style}"
                        data-ide-action="draft"
                    >save</span>
                    &nbsp;                    
                    <!--span
                        style="${style}"
                        data-ide-action="clear"
                    >clear</span-->
                    <span
                        style="${style}"
                        data-ide-action="stop"
                    >stop</span>
                    <span
                        style="${style}"
                        data-ide-action="play-both"
                    >play2</span>
                </div>
            </div>
        `.trim();

        return result;
    }

    getRowActionsCommands(): string {
        const display = `display: ${this.hasIdeItem ? 'none': 'block'};`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `${display} width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

        return `
            <div
                data-row-actions
                style="${rowStyle}"
            >
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
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
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
                    data-action-out="play-one"
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
                    style="${style2}"
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
                    style="${style2}"
                    data-action-out="left"
                >&nbsp;&lt;&nbsp;</span>  
                <span
                    style="${style2}"
                    data-action-out="bottom"
                >&nbsp;&darr;&nbsp;</span>                                  
                <span
                    style="${style2}"
                    data-action-out="right"
                >&nbsp;&gt;&nbsp;</span>
                <span
                    style="${style}"
                    data-action-out="test"
                >tst</span>                
                <span
                    style="${style}"
                    data-action-out="delete"
                >del</span>                                                                        
            </div>
            ${this.getRowActionsCommands()}            
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
        instrPanel = `<div
            data-drum-instruments
            style="${rowStyle}"
        >${instrPanel}</div>`;

        return result + instrPanel;
    }


    getDrumBoardContent(keyboardId: string): string {
        const topRowHeight = 5;
        const midRowHeight = 10;
        const botRowHeight = 5;
        let ind = 0;
        const rem = 'rem';

        const content = `
                <div style="display: flex; user-select: none; touch-action: none; position: relative;">
                    <div style="width: 66%;">
                        <div style="display: flex; width: 100%;">
                            <!-- cowbell sr -->
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightblue; user-select: none; touch-action: none;"
                                data-action-drum-key="th"
                                data-keyboard-id="${keyboardId}-${ind++}"  
                                data-color="steelblue"
                                data-color2="lightblue"
                                data-char="h"
                            >
                                <!--<br/>&nbsp;K-k-->
                            </div>
                            <!-- cowbell sr -->
                            <div 
                                style="width: 50%; height: ${topRowHeight}rem; text-align: center; background-color: lightgreen; user-select: none; touch-action: none;"
                                data-action-drum-key="tm"
                                data-keyboard-id="${keyboardId}-${ind++}"
                                data-color="seagreen"                                
                                data-color2="lightgreen"
                                data-char="m"
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
                            style="display: flex; width: 100%; height: ${midRowHeight/2}${rem}; background-color: whitesmoke; user-select: none; touch-action: none;"                        
                        >
                            <div 
                                style="width: 50%; height: ${midRowHeight/2}${rem}; box-sizing: border-box; text-align: center; background-color: lightgray; user-select: none; touch-action: none;"
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
                                style="width: 50%; height: ${midRowHeight/2}${rem}; box-sizing: border-box; text-align: center; background-color: whitesmoke; user-select: none; touch-action: none;"
                                data-action-drum-key="empty"
                                data-keyboard-id="${keyboardId}-${ind++}"   
                                data-color="lightgray"
                                data-color2="whitesmoke"
                            >     
                                <!--<br/>&nbsp;?-->
                            </div>   
                        </div>                        
                        
                        <div
                            style="width: 100%; height: ${botRowHeight}${rem}; background-color: tan; user-select: none; touch-action: none;"
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
                            style="height: ${midRowHeight}${rem}; width: 100%; background-color: lightpink; user-select: none; touch-action: none;"
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
                            style="background-color: antiquewhite; width: 100%; height: ${botRowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
                            data-action-drum-key="tl"
                            data-keyboard-id="${keyboardId}-${ind++}"
                            data-color="lightgray"
                            data-color2="lightgray"
                            data-char="l"
                        >
                            <!--data-action-drum-key="sn+hc"
                            data-keyboard-id="${keyboardId}-${ind++}"-->
                            <!--<br/>&nbsp;A-a-->
                        </div>                        
                        
                        <div 
                            style="width: 100%; height: ${botRowHeight}${rem}; text-align: center; user-select: none; touch-action: none;"
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

    getMidiConfig(): MidiConfig {
        const currentEdit = ideService.currentEdit;

        const outBlock = un.createOutBlock({
            id: 'out',
            bpm: this.page.bpmValue,
            rows: [`> ${currentEdit.outList[currentEdit.editIndex - 1]}`],
            volume: 50,
            type: 'text'
        });

        //console.log('outBlock', outBlock);

        const midiConfig: MidiConfig = {
            blocks: currentEdit.blocks,
            excludeIndex: [],
            currRowInfo: {first: 0, last: 0},
            currBlock: outBlock,
            midiBlockOut: null as any,
            playBlockOut: null as any,
            topBlocksOut: [],
        };

        getMidiConfig(midiConfig);

        return midiConfig;
    }

    getIdeContent(): string {
        if (!this.hasIdeItem) return '';

        const currentEdit = ideService.currentEdit;
        const cmdStyle = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
        this.page.bpmValue = currentEdit.outBlock.bpm;

        //console.log('this.page.bpmValue', this.page.bpmValue);

        const midiConfig = this.getMidiConfig();
        //console.log('midiConfig', midiConfig);

        const outBlocksInfo = getOutBlocksInfo(midiConfig.blocks, midiConfig.playBlockOut);
        //console.log('outBlocksInfo', outBlocksInfo);

        // const loopsInfo = this.page.multiPlayer.getLoopsInfo({
        //     blocks: currentEdit.blocks,
        //     playBlock: midiConfig.playBlockOut,
        // });
        // console.log('loopsInfo', loopsInfo);

        const innerContent = outBlocksInfo.rows.reduce((acc, row, i) => {
            if (i === 0) {
                return acc;
            }

            const rowCount = Math.ceil(row.rowDurationByHeadQ / un.NUM_120);
            let cellCount = 0;
            if (row.rowDurationByHeadQ % un.NUM_120) {
                cellCount = Math.floor((row.rowDurationByHeadQ % un.NUM_120) / 10);
            }

            const rowInPartId = `${currentEdit.editIndex}-${i}`

            acc = acc + `<span
                style="padding: .25rem; margin: .25rem; display: inline-block; background-color: #d7d4f0;"
                data-editing-item="${rowInPartId}"
                data-duration="${row.rowDurationByHeadQ}"
                data-row-in-part="${i}"
                data-part-index="${currentEdit.editIndex}"
                data-song-name="${currentEdit.name}"
            >${i}:${rowCount + (cellCount ? '.' + cellCount : '')}</span>`;

            return acc
        }, '');

        return `
            <div data-ide-content>
                <span
                    style="${cmdStyle}"
                    data-ide-action="back"
                >back</span>            
                <span 
                    style="padding: .5rem;"
                >${currentEdit.name}-${currentEdit.outList[currentEdit.editIndex - 1]}-${currentEdit.editIndex}</span>
                <!--span
                    style="${cmdStyle}"
                    data-ide-action="play-all"
                >playAll</span-->                
                <span
                    style="${cmdStyle}"
                    data-ide-action="play-active"
                >playActive</span>                
                <span
                    style="${cmdStyle}"
                    data-ide-action="stop"
                >stop</span>
                ${innerContent}
                <span
                    style="${cmdStyle}"
                    data-ide-action="clear"
                >clear</span>
            </div>
        `.trim();
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
                    style="width: 90%; padding-left: 1rem;"
                ></div>
                
                ${ideService.currentEdit && ideService.currentEdit.editIndex ? this.getBottomCommandPanel() : ''}
                ${this.getIdeContent()}                
                
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
        const rem = 'rem';
        const getMask = (count: number): PrintCell[] => {
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

        const getTextAndColor = (arr: NoteItem[]): PrintCell => {
            const result: PrintCell = {
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
                result.char = arr[0].char || '?';
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
                result.bgColor = 'sienna';
            } else if (map.sn) {
                result.noteId = map.sn;
                result.bgColor = 'deeppink';
            } else if (arr.length) {
                result.bgColor = 'darkgray';
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
                    border-bottom: 1px solid lightgray;
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
                        data-drum-cell-row="${iRow}"
                        data-drum-cell-nio="${iCol}"
                        data-drum-cell-row-nio="${iRow}-${iCol}"
                        data-drum-cell-id=""
                        data-total-offset="${col.totalOffsetQ}"                        
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
                        data-drum-cell-row="${iRow}"
                        data-drum-cell-nio="${iCell}"
                        data-drum-cell-row-nio="${iRow}-${iCell}"                                                
                        data-drum-cell-id="${cell.cellId}"
                        data-total-offset="${cell.totalOffsetQ}"                        
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

        const el = dyName('drum-record-out', this.page.pageEl);
        if (el) {
            el.innerHTML = totalOut;
            el.style.height = `${rows.length * rowHeight}rem`;
        }

        this.subscribeOutCells();
    }
}
