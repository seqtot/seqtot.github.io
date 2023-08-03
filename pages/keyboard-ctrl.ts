import { ComponentContext } from 'framework7/modules/component/component';
import { getWithDataAttr, getWithDataAttrValue } from '../src/utils';
import { Synthesizer } from '../libs/muse/synthesizer';
import { MultiPlayer } from '../libs/muse/multi-player';

import { Line, LineModel, CELL_SIZE } from './line-model';
import * as un from '../libs/muse/utils'
import { parseInteger } from '../libs/common';

import ideService from './ide/ide-service';
import { sings } from './sings';
import { SongPage, StoredRow } from './song-store';
import { SongPartInfo } from '../libs/muse/utils';

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
        public page: KeyboardPage
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
        const style2 = `border-radius: 0.25rem; border: 1px solid black; font-size: 1rem; user-select: none; touch-action: none;`;
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
                    data-signature="3:4"                    
                >3:4</span>&nbsp;
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
}
