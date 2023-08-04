import { ComponentContext } from 'framework7/modules/component/component';
import { getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import { MultiPlayer } from '../libs/muse/multi-player';

import { Line, LineModel, CELL_SIZE } from './line-model';
import * as un from '../libs/muse/utils'
import { parseInteger } from '../libs/common';

import {EditedItem, ideService} from './ide/ide-service';
import { sings } from './sings';
import { SongPage, SongStore, StoredRow, StoredSongNode } from './song-store';
import { getOutBlocksInfo, OutBlockRowInfo, SongPartInfo, TextBlock } from '../libs/muse/utils';
import { getMidiConfig, MidiConfig } from '../libs/muse/utils/getMidiConfig';

export type BpmInfo = {
    bpm: number;
    lastDownTime: number;
    pressCount: number;
    totalMs: number;
}

export interface KeyboardPage {
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

export const toneBoards = {
    bassGuitar: 'bassGuitar',
    solo34: 'solo34',
    bass34: 'bass34',
    bassSolo34: 'bassSolo34',
    guitar: 'guitar',
    piano: 'guitar',
}

export const drumBoards = {
    drums: 'drums',
    percussion: 'percussion'
}

export type ToneKeyboardType = 'bassGuitar' | 'solo34' | 'bass34' | 'bassSolo34' | 'guitar';
export type DrumKeyboardType = 'drums' | 'percussion';

export class KeyboardCtrl {
    liner = new LineModel();
    activeCell: {
        id: number,
        col: number,
        row: number,
        rowCol: string,
        offset: number,
    } = {
        id: 0,
        col: 0,
        row: 0,
        rowCol: '',
        offset: 0
    };

    get hasIdeItem(): boolean {
        const item = ideService.currentEdit;

        return !!item && !!item.editPartsNio && !!item.allSongParts; //  && !!item.outBlock && !!item.blocks
    }

    constructor(
        public page: KeyboardPage,
        public type: DrumKeyboardType | ToneKeyboardType,
    ) {
    }

    getEmptyBpmInfo (): BpmInfo  {
        return {
            bpm: 0,
            lastDownTime: 0,
            pressCount: 0,
            totalMs: 0,
        };
    }

    getMoveButtons(size: number = 1): string {
        const style = [
            `user-select: none; touch-action: none;`,
            `padding-left: .2rem; padding-right: .2rem;`,
            `font-size: ${size}rem; font-weight: 800;`,
            `border-radius: 0.25rem; border: 1px solid lightgray;`,
        ].join('');

        return `
            <span
                style="${style}"
                data-action-move-cell="left"
            >&lt;</span>&emsp;
            <span
                style="${style}"
                data-action-move-cell="top"
            >&uarr;</span>&emsp;
            <span
                style="${style}"
                data-action-move-cell="bottom"
            >&darr;</span>&emsp;
            <span
                style="${style}"
                data-action-move-cell="right"
            >&gt;</span>
        `.trim();
    }

    addCellDuration(id: number, value: number) {
        const result = this.liner.addCellDuration(id, value);

        if (result) {
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    moveCell(id: number, value: number) {
        const result = this.liner.moveCell(id, value);

        if (result) {
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    subscribeDurationCommands() {
        getWithDataAttrValue('action-set-cell-duration', 'add', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addCellDuration(this.activeCell.id, CELL_SIZE));
        });

        getWithDataAttrValue('action-set-cell-duration', 'sub', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addCellDuration(this.activeCell.id, -CELL_SIZE));
        });
    }

    subscribeMoveCommands() {
        getWithDataAttrValue('action-move-cell', 'top', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, -120));
        });

        getWithDataAttrValue('action-move-cell', 'bottom', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, 120));
        });

        getWithDataAttrValue('action-move-cell', 'left', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, -CELL_SIZE));
        });

        getWithDataAttrValue('action-move-cell', 'right', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, CELL_SIZE));
        });
    }

    highlightInstruments() {}

    getCellId(el: HTMLElement) {
        return un.parseInteger(el.dataset['chessCellId'], 0);
    }

    setActiveCell(el?: HTMLElement) {
        this.activeCell = this.getCellInfo(el);
    }

    getCellInfo(el?: HTMLElement): this['activeCell'] {
        if (!el) {
            return  {
                id: 0,
                col: 0,
                row: 0,
                rowCol: '',
                offset: 0,
            }
        }

        return {
            id: this.getCellId(el), // data-chess-cell-id
            row: parseInteger(el.dataset['chessCellRow'], 0), // data-chess-cell-row
            col: parseInteger(el.dataset['chessCellCol'], 0), // data-chess-cell-col
            rowCol: el.dataset['chessCellRowCol'], // data-chess-cell-row-col
            offset: parseInteger(el.dataset['chessTotalOffset'], 0), // data-chess-total-offset
        }
    }

    highlightCellByRowCol(rowCol: string, highlight: boolean = true) {
        rowCol = rowCol || this.activeCell.rowCol;

        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach(el => {
            el.style.outline = null;
            el.style.zIndex = '0';
            el.dataset['selected'] = '';
        });

        if (highlight) {
            this.setActiveCell(null);
            const el = getWithDataAttrValue('chess-cell-with-id-row-col', rowCol)[0] || getWithDataAttrValue('chess-cell-row-col', rowCol)[0];

            if (el) {
                this.setActiveCell(el);

                el.style.outline = '3px solid yellow';
                el.style.zIndex = '1';
                el.dataset['selected'] = 'true';

                this.highlightInstruments();
            }
        }
    }

    chessCellClick(el: HTMLElement) {
        const offset = parseInteger(el.dataset['chessTotalOffset'], null);

        if (offset === null) {
            return;
        }

        if (!el.dataset['selected']) {
            this.setActiveCell(el);
            this.highlightCellByRowCol(this.activeCell.rowCol);
        } else {
            this.highlightCellByRowCol(this.activeCell.rowCol, false);
            this.setActiveCell(null);
        }
    }

    subscribeChess() {
        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.chessCellClick(el));
        });
    }

    getRowActionsCommands(): string {
        const display = `display: ${ideService.currentEdit?.freezeStructure ? 'none': 'block'};`;
        const style = `font-size: 1.1rem; border-radius: 0.25rem; border: 1px solid lightgray; user-select: none; touch-action: none;`;
        const rowStyle = `${display} width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

        return `
            <div
                data-edit-row-actions
                style="${rowStyle}"
            >
                <span
                    style="${style}"
                    data-edit-row-action="add-row"
                >addR</span>
                <span
                    style="${style}"
                    data-edit-row-action="insert-row"
                >insR</span>&nbsp;&nbsp;
                <span
                    style="${style} color: red;"
                    data-edit-row-action="delete-row"
                >delR</span>                    
            </div>        
        `.trim();
    }

    getMoveCommandPanel(size: number = 1, hasDel = true) {
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: ${size}rem; user-select: none; touch-action: none;`;

        let delButton = '';
        if (hasDel) {
            delButton = `
                &nbsp;&nbsp;<span
                    style="${style} background-color: red; color: white;"
                    data-edit-action="delete-cell"
                >del</span>            
            `;
        }

        return `
            <div style="${rowStyle}">
                ${this.getMoveButtons(size)}
                ${delButton}
            </div>
        `.trim();
    }

    getDurationCommandPanel(size: number = 1) {
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: ${size}rem; user-select: none; touch-action: none;`;

        let additional = '';
        // if (hasDel) {
        //     delButton = `
        //         <span
        //             style="${style} background-color: red; color: white;"
        //             data-edit-action="delete-cell"
        //         >del</span>
        //     `;
        // }

        return `
            <div style="${rowStyle}">
                <span
                    style="${style}"
                    data-action-set-cell-duration="add"
                >&nbsp;+&nbsp;</span>
                <span
                    style="${style}"
                    data-action-set-cell-duration="sub"
                >&nbsp;-&nbsp;</span>
                ${additional}
            </div>
        `.trim();
    }

    getTopCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1rem; user-select: none; touch-action: none;`;
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
                    data-page-action="record"
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

    deleteCell(el: HTMLElement) {
        const cellEl = getWithDataAttrValue('chess-cell-row-col', this.activeCell.rowCol)[0];

        if (!cellEl) return;

        const totalOffset = parseInteger(cellEl.dataset['chessTotalOffset'], null);

        if (totalOffset === null) return;

        this.liner.deleteCellByOffset(totalOffset);
        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    addLine() {
        const line = this.liner.lines[this.activeCell.row];

        this.liner.addLineAfter(this.activeCell.row, line?.rowInPartId || '');
        this.setEditingItemDurationAndBlockOffsetByLines();

        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    insertLine() {
        const line = this.liner.lines[this.activeCell.row];

        this.liner.addLineAfter(this.activeCell.row - 1, line?.rowInPartId || '');
        this.setEditingItemDurationAndBlockOffsetByLines();

        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    deleteLine() {
        if (!this.activeCell.rowCol) {
            return null;
        }

        const line = this.liner.lines[this.activeCell.row];

        this.liner.deleteLine(this.activeCell.row, line.rowInPartId);
        this.setEditingItemDurationAndBlockOffsetByLines();
        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    printChess(rows: Line[]) {}

    drumNoteClick(el: HTMLElement) {}

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
                        data-ide-action="save"
                    >save</span>&nbsp;
                    <span
                        style="${style}"
                        data-ide-action="load"
                    >load</span>&nbsp;
                    <!--span
                        style="${style}"
                        data-ide-action="clear"
                    >clear</span-->
                    <span
                        style="${style} color: gray;"
                        data-ide-action="stop"
                    >${sings.stop}</span>
                    <span
                        style="${style} color: blue; padding-left: .25rem; padding-right: .25rem;"
                        data-ide-action="play-both"
                    >${sings.play1}2</span>
                </div>
            </div>
        `.trim();

        return result;
    }

    setEditingItemDurationAndBlockOffsetByLines() {
        this.sortEditingItems();

        let blockOffsetQ = 0;

        ideService.editedItems.forEach(editedItem => {
            let lines: Line[] = this.liner.lines.filter(row => row.rowInPartId === editedItem.rowInPartId);
            let duration = LineModel.GetDurationQByLines(lines);
            editedItem.duration = duration;

            lines.forEach(row => {
                row.rowInPartId = editedItem.rowInPartId;
                row.blockOffsetQ = blockOffsetQ;
            });

            blockOffsetQ = blockOffsetQ + duration;
        });
    }

    getRowsForPart(song: SongPage, part: SongPartInfo): StoredRow[] {
        const partRows = song.dynamic.filter(row => {
            const iPartId = (row.partId || '').trim();
            const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);

            if (part.partId && iPartId) {
                return part.partId === iPartId;
            }

            return part.partNio === iPartNio;
        });

        partRows.sort((a, b) => {
            const iRowNioA = un.parseInteger(a.rowInPartId.split('-')[1], 0);
            const iRowNioB = un.parseInteger(b.rowInPartId.split('-')[1], 0);

            if (iRowNioA < iRowNioB) return -1;
            if (iRowNioA > iRowNioB) return 1;

            return 0;
        });

        return partRows;
    }

    resetBlockOffset(rows: StoredRow[]) {
        rows.forEach(row => {
            LineModel.ClearBlockOffset(row.lines);
        });
    }

    getPartsWithRows(
        song: SongPage,
        parts: SongPartInfo[],
        resetBlockOffset = false
    ): {partId: string, rows: StoredRow[][]}[] {
        const hash = {};
        const list: {partId: string, rows: StoredRow[][]}[] = [];

        parts.forEach(part => {
            const partRows = this.getRowsForPart(song, part);

            if (resetBlockOffset) this.resetBlockOffset(partRows);

            partRows.forEach(row => {
                const iPartNio = un.parseInteger(row.rowInPartId.split('-')[0], 0);
                const iRowNio = un.parseInteger(row.rowInPartId.split('-')[1], 0);

                if (!hash[iPartNio]) {
                    hash[iPartNio] = {
                        partId: part.partId,
                        rows: [],
                    };
                    list.push(hash[iPartNio]);
                }

                if (!hash[iPartNio][iRowNio]) {
                    hash[iPartNio][iRowNio] = [];
                    hash[iPartNio].rows.push(hash[iPartNio][iRowNio]);
                }

                hash[iPartNio][iRowNio].push(row);
            });
        });

        return list;
    }

    updateView() {

    }

    getNotes(id: string, item: StoredRow): string {
        if (item.type === 'drums') {
            return LineModel.GetDrumNotes(id, item.lines);
        }

        return LineModel.GetToneNotes({
            blockName: id,
            rows: item.lines,
            instr: '$organ',
            chnl: '$organ',
        });
    }

    buildBlocksForMySong(blocks: TextBlock[], resetBlockOffset = false, useEditing = false): TextBlock[] {
        const song = SongStore.getSong(ideService.currentEdit.songId);
        const editingParts: SongPartInfo[] = [];

        ideService.currentEdit.editPartsNio.sort();
        ideService.currentEdit.editPartsNio.forEach(partNio => {
            editingParts.push(
                un.getPartInfo(ideService.currentEdit.allSongParts[partNio - 1])
            );
        });

        const partsWithRows = this.getPartsWithRows(song, editingParts, resetBlockOffset);
        let topOutBlocks: string[][] = [];

        partsWithRows.forEach(part => {
            let partSetRows: string[] = [`<${part.partId} set>`];

            part.rows.forEach(row => {
                let maxDurQ = 0;
                let targetDurQ = 0;
                let headGuid = `head_${ideService.guid.toString()}`;
                let rowRefs: string[] = [headGuid];

                row.forEach(item => {
                    const guid = `temp_${ideService.guid.toString()}`;
                    const durQ = LineModel.GetDurationQByLines(item.lines);

                    let notes = this.getNotes(guid, item);

                    if(!notes) {
                        notes = `<${guid} $>\n$organ: ${durQ}`;
                    }

                    const block = un.getTextBlocks(notes)[0];

                    blocks = [...blocks, block];

                    maxDurQ = durQ > maxDurQ ? durQ: maxDurQ;

                    rowRefs.push(guid);
                });

                const headBlock = un.getTextBlocks(`<${headGuid} $>\n$organ: ${maxDurQ}`)[0];

                blocks = [...blocks, headBlock];

                partSetRows.push(rowRefs.join(' '));
            });

            topOutBlocks.push(partSetRows);
        });

        topOutBlocks.forEach(part => {
            const partBlock = un.getTextBlocks(part.join('\n'))[0];

            blocks = [...blocks, partBlock];
        });

        //jjkl
        //console.log('hash', hash);
        //console.log('list', list);
        //console.log('topOutBlocks', topOutBlocks);
        //console.log('buildBlocksForMySong', blocks);

        return blocks;
    };

    updateChess() {
        let lines = [];
        let blockOffsetQ = 0;
        const songId = ideService.currentEdit.songId;
        const isMy = ideService.currentEdit.source === 'my';

        ideService.editedItems.forEach(editedItem => {
            let iLines: Line[] = this.liner.lines.filter(row => row.rowInPartId === editedItem.rowInPartId);

            if (!isMy) {
                let songNode: StoredSongNode = localStorage.getItem(songId) as any;
                if (!iLines.length && songNode) {
                    songNode = JSON.parse(songNode as any as string);

                    if (songNode[editedItem.rowInPartId]) {
                        let items = songNode[editedItem.rowInPartId].items;
                        let node = items.find(item => item.rowInPartId === editedItem.rowInPartId && item.type === this.type);
                        if (node) {
                            iLines = node.rows;
                        }
                    }
                }

            } else {
                const song = (isMy ? SongStore.getSong(songId, true) : null) as SongPage;
                if (!iLines.length && song) {
                    song.dynamic.forEach(item => {
                        if (item.rowInPartId === editedItem.rowInPartId && item.type === this.type) {
                            iLines = [...iLines, ...item.lines];
                        }
                    });
                }
            }

            if (!iLines.length) {
                iLines = this.liner.getLinesByMask(editedItem.duration);
            }

            iLines.forEach(row => {
                row.rowInPartId = editedItem.rowInPartId;
                row.blockOffsetQ = blockOffsetQ;
            });

            lines = [...lines, ...iLines];
            blockOffsetQ = blockOffsetQ + editedItem.duration;
        });

        this.liner.setData(lines);
        this.printChess(this.liner.lines);
    }

    getMidiConfig(x: {
        resetBlockOffset?: boolean,
        useEditing?: boolean
    } = {}): MidiConfig {
        const currentEdit = ideService.currentEdit;
        let blocks = [...currentEdit.blocks];

        if (currentEdit.source === 'my') {
            blocks = this.buildBlocksForMySong(blocks, x.resetBlockOffset, x.useEditing);
        }

        const rows = currentEdit.editPartsNio.reduce((acc, partNio) => {
            const part = currentEdit.allSongParts[partNio - 1];
            const info = un.getPartInfo(part);
            let N = '';

            if (!info.partNio) {
                N = ` ${un.getNRowInPartId(partNio)}`;
            }

            acc.push(`> ${part}${N}`);

            return acc;
        }, [] as string[] );

        const outBlock = un.createOutBlock({
            id: 'out',
            bpm: this.page.bpmValue,
            rows,
            volume: 50,
            type: 'text'
        });

        const midiConfig: MidiConfig = {
            blocks,
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

        this.page.bpmValue = currentEdit.bpmValue || 90;

        const midiConfig = this.getMidiConfig();
        const outBlocksInfo = getOutBlocksInfo(midiConfig.blocks, midiConfig.playBlockOut);

        const partHash: {
            [key: string]: {
                part: un.SongPartInfo,
                rows: {row: OutBlockRowInfo, partNio: number, rowNio: number}[]
            }
        } = {};

        const rowsByParts: {
            part: un.SongPartInfo,
            rows: {row: OutBlockRowInfo, partNio: number, rowNio: number}[]
        }[] = [];

        // ЗАПОЛНЯЕМ ЧАСТИ
        ideService.currentEdit.editPartsNio.sort();
        ideService.currentEdit.editPartsNio.forEach(partNio => {
            const part = un.getPartInfo(currentEdit.allSongParts[partNio - 1]);

            if (!partHash[part.partNio]) {
                partHash[part.partNio] = {
                    part,
                    rows: []
                };

                rowsByParts.push(partHash[part.partNio]);
            }
        });

        // ДОБАВЛЯЕМ СТРОКИ В ЧАСТИ
        outBlocksInfo.rows.forEach(row => {
            const info = un.getPartInfo(row.text);

            if (!info.partNio || !info.rowNio || !partHash[info.partNio]) {
                return;
            }

            partHash[info.partNio].rows.push({
                partNio: info.partNio,
                rowNio: info.rowNio,
                row,
            });
        });

        let editingPartsContent = '';

        // ФОРМИРУЕМ СПИСОК ЧАСТЕЙ
        rowsByParts.forEach(item => {
            const part = item.part;

            editingPartsContent += `
                <div >
                    <span style="margin: .5rem; font-weight: 600;"
                    >${part.partNio}-${part.ref}</span>
            `.trim();

            item.rows.forEach(info => {
                const row = info.row;
                const rowCount = Math.ceil(row.rowDurationByHeadQ / un.NUM_120);
                let cellCount = 0;

                if (row.rowDurationByHeadQ % un.NUM_120) {
                    cellCount = Math.floor((row.rowDurationByHeadQ % un.NUM_120) / 10);
                }

                editingPartsContent += `<span
                    style="padding: .25rem; margin: .25rem; display: inline-block; background-color: #d7d4f0;"
                    data-row-in-part-item
                    data-row-in-part-id="${info.partNio}-${info.rowNio}"                    
                    data-song-name="${currentEdit.songId}"
                    data-part-nio="${info.partNio}"                    
                    data-row-nio="${info.rowNio}"
                    data-part-id="${part.partId}"
                    data-init-duration="${row.rowDurationByHeadQ}"                                                            
                >${info.rowNio}:${rowCount + (cellCount ? '.' + cellCount : '')}</span>`;
            });

            if (!ideService.currentEdit.freezeStructure) {
                editingPartsContent += `&emsp;<span
                    style="${cmdStyle}"
                    data-ide-action="add-row"
                    data-part-nio="${part.partNio}"
                    data-part-id="${part.partId}"                    
                >add</span>`.trim();
            }

            editingPartsContent += '</div>';
        });

        return `
            ${this.getBottomCommandPanel()}
            <div style="padding-left: 1rem;">
                <span
                    style="${cmdStyle}"
                    data-ide-action="back"
                >back</span>&nbsp;&nbsp;
                <span
                    style="${cmdStyle} color: blue;"
                    data-ide-action="play-active"
                >${sings.play}</span>
                <span
                    style="${cmdStyle} color: gray;"
                    data-ide-action="stop"
                >${sings.stop}</span>&nbsp;&nbsp;                
                <span
                    style="${cmdStyle}"
                    data-ide-action="clear"
                >clear</span>
            </div>
            
            <div style="margin-top: .5rem;">
                ${editingPartsContent}
            </div>
        `.trim();
    }

    addOrRemoveEditingItem(item: EditedItem, el: HTMLElement) {
        if (ideService.editedItems.find(iItem => iItem.rowInPartId === item.rowInPartId)) {
            ideService.editedItems = ideService.editedItems.filter(iItem => iItem.rowInPartId !== item.rowInPartId);
        } else {
            ideService.editedItems.push(item);
        }
    }

    sortEditingItems() {
        ideService.editedItems.sort((a, b) => {
            if (a.partNio < b.partNio) return -1;
            if (a.partNio > b.partNio) return 1;

            if (a.rowNio < b.rowNio) return -1;
            if (a.rowNio > b.rowNio) return 1;

            return 0;
        });
    }

    songRowClick(el: HTMLElement) {
        const item: EditedItem = {
            rowInPartId: el.dataset['rowInPartId'],
            songName: el.dataset['songName'],
            partNio: parseInteger(el.dataset['partNio'], 0),
            rowNio: parseInteger(el.dataset['rowNio'], 0),
            duration: parseInteger(el.dataset['initDuration'], 0),
            partId: el.dataset['partId'] || '',
        };

        this.addOrRemoveEditingItem(item, el);
        this.sortEditingItems();
        this.updateView();
    }

    resetEditingParts() {
        ideService.currentEdit = {} as any;
        ideService.editedItems = [];
        getWithDataAttr('ide-content', this.page.pageEl).forEach((el: HTMLElement) => {
            el.innerHTML = null;
        });
        getWithDataAttr('bottom-command-panel', this.page.pageEl).forEach((el: HTMLElement) => {
            el.innerHTML = null;
        });
        getWithDataAttr('edit-row-actions', this.page.pageEl).forEach((el: HTMLElement) => {
            el.style.display = 'block';
        });
        this.liner.fillLinesStructure('480');
        this.printChess(this.liner.lines);
    }

    subscribeIdeEvents() {
        getWithDataAttrValue('ide-action', 'play-both', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playBoth());
        });

        getWithDataAttrValue('ide-action', 'save', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.saveEditingItems());
        });

        getWithDataAttrValue('ide-action', 'load', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.loadFile());
        });

        getWithDataAttrValue('ide-action', 'back', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.gotoSong());
        });

        getWithDataAttr('row-in-part-item', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.songRowClick(el));
        });

        getWithDataAttrValue('ide-action', 'clear', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.resetEditingParts());
        });

        getWithDataAttrValue('ide-action', 'play-active', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playActive());
        });

        getWithDataAttrValue('ide-action', 'stop', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.page.stop());
        });

        getWithDataAttrValue('ide-action', 'add-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addRowInPart(el.dataset['partId'], el.dataset['partNio']));
        });
    }

    gotoSong() {
        this.page.context.$f7router.navigate(`/mbox/${ideService.currentEdit.songId}/`);
    }

    addRowInPart(partId: string, partNio: number | string) {
        partNio = un.parseInteger(partNio, 0);
        partId = (partId || '').trim();

        if (!partId && !partNio) return;

        const songName = ideService.currentEdit.songId;
        const song = SongStore.getSong(songName);

        const rowNios = song.dynamic.reduce((acc, item) => {
            const iPartId = (item.partId || '').trim();
            const iPartNio = un.parseInteger(item.rowInPartId.split('-')[0], 0);
            const iRowNio = un.parseInteger(item.rowInPartId.split('-')[1], 0);

            if (partId && iPartId && partId !== iPartId) {
                return acc;
            }
            else if(partNio && iPartNio && partNio !== iPartNio) {
                return acc;
            }

            if (!iRowNio) {
                return acc;
            }

            acc.push(iRowNio);

            return acc;
        }, []);

        const rowNio = (rowNios.length ? Math.max(...rowNios) : 0) + 1;
        const rowInPartId = `${partNio}-${rowNio}`;

        song.dynamic.push({
            partId,
            rowInPartId: `${partNio}-${rowNio}`,
            type: this.type,
            status: 'draft',
            lines: [
                this.liner.getEmptyLine(rowInPartId),
            ]
        });

        SongStore.setSong(ideService.currentEdit.songId, song);

        getWithDataAttr('edit-parts-wrapper').forEach(el => {
            el.innerHTML = this.getIdeContent();
            this.subscribeIdeEvents();
        });

        this.updateView();
    }

    loadFile() {
        // https://webtips.dev/download-any-file-with-javascript
        let songName = ideService.currentEdit?.songId || '';

        if (!songName) return;

        let songNode: StoredSongNode;

        if (!localStorage.getItem(songName)) {
            songNode = {};
        } else {
            songNode = JSON.parse(localStorage.getItem(songName));
        }

        let data = JSON.stringify(songNode);
        //let type = 'application/json';
        let type = 'application/text';
        let name = `${songName}.txt`;

        downloader(data, type, name)

        function downloader(data, type, name) {
            let blob = new Blob([data], {type});
            let url = (window as any).URL.createObjectURL(blob);
            downloadURI(url, name);
            (window as any).URL.revokeObjectURL(url);
        }

        function downloadURI(uri, name) {
            let link = document.createElement("a");
            link.download = name;
            link.href = uri;
            link.click();
        }
    }

    saveEditingItemsMy() {
        if (!ideService.editedItems.length) return;

        let songName = ideService.editedItems[0].songName;
        let song = SongStore.getSong(songName);

        const savedItems = ideService.editedItems.map(item => item.rowInPartId);

        const dynamic = song.dynamic.filter(item => {
            return !savedItems.includes(item.rowInPartId) || (savedItems.includes(item.rowInPartId) && item.type !== this.type);
        });

        ideService.editedItems.forEach(item => {
            const lines = this.liner.lines.filter(line => line.rowInPartId === item.rowInPartId);

            if (!lines.length) return;

            dynamic.push({
                type: this.type,
                rowInPartId: item.rowInPartId,
                lines,
                partId: item.partId,
                rowNio: item.rowNio,
                status: 'unknown',
            });
        });

        song.dynamic = dynamic;

        SongStore.setSong(songName, song);
    }

    saveEditingItems() {
        if (!ideService.editedItems.length) return;

        if (ideService.currentEdit.source === 'my') {
            this.saveEditingItemsMy();

            return;
        }

        let songName = ideService.editedItems[0].songName;
        let songNode: StoredSongNode;

        if (!localStorage.getItem(songName)) {
            songNode = {};
        } else {
            songNode = JSON.parse(localStorage.getItem(songName));
        }

        ideService.editedItems.forEach(item => {
            const rows = this.liner.lines.filter(row => row.rowInPartId === item.rowInPartId);
            if (!rows.length) return;

            let itemsNode = songNode[item.rowInPartId];
            if (!itemsNode) {
                itemsNode = {
                    items: []
                };
                songNode[item.rowInPartId] = itemsNode;
            }

            let drumsNode = itemsNode.items.find(iItem => iItem.rowInPartId === item.rowInPartId && iItem.type === this.type);
            if (!drumsNode) {
                drumsNode = {
                    rowInPartId: item.rowInPartId,
                    type: this.type,
                    status: 'draft',
                    rows: [],
                    lines: [],
                };
                itemsNode.items.push(drumsNode);
            }

            drumsNode.rows = rows;
        });

        localStorage.setItem(songName, JSON.stringify(songNode));
    }


    getMetronomeContent() {
        return `
            <div style="margin: 0 0 1.5rem 1rem; width: 80%;">
                ${this.page.getMetronomeContent()}
            </div>`.trim();
    }

    playBoth(){}
    playActive(){}
}
