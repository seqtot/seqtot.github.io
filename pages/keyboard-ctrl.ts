import { Dialog } from 'framework7/components/dialog/dialog';
import { Sheet } from 'framework7/components/sheet/sheet';
import { ComponentContext } from 'framework7/modules/component/component';

import { getWithDataAttr, getWithDataAttrValue } from '../src/utils';

import { Muse as m, Line, LineModel, LineNote, StoredRow, Synthesizer, MultiPlayer, SongPartInfo, MidiConfig, TextBlock, OutBlockRowInfo } from '../libs/muse';

import { parseInteger } from '../libs/common';
import { EditedItem, ideService } from './ide/ide-service';
import { sings } from './sings';
import { SongNode, SongStore, StoredSongNodeOld, MY_SONG } from './song-store';
import * as svg from './svg-icons';

import { NoteDetailsDialog } from './dialogs/note-details-dialog';

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
    setContent: () => void,
    initData: () => void,
    songId: string,
}

export const toneBoards = {
    bassGuitar: 'bassGuitar',
    solo34: 'solo34',
    bass34: 'bass34',
    bassSolo34: 'bassSolo34',
    bassBass34: 'bassBass34',
    soloSolo34: 'soloSolo34',
    guitar: 'guitar',
    piano: 'guitar',
}

export const drumBoards = {
    drums: 'drums',
    percussion: 'percussion'
}

export type ToneKeyboardType = 'bassGuitar' | 'solo34' | 'bass34' | 'bassSolo34' | 'soloSolo34' | 'bassBass34' | 'guitar';
export type DrumKeyboardType = 'drums' | 'percussion';
export type KeyboardType = ToneKeyboardType | DrumKeyboardType;

const monoFont = 'font-family: monospace;';

const iconBtnStl = [
    `display: inline-block;`,
    `border: 1px solid lightgray; border-radius: 0.25rem;`,
    `line-height: 0;`,
    `user-select: none;`,
    `padding: 0; margin: 0; margin-right: .4rem;`,
].join('');

export class KeyboardCtrl {
    trackName = '';
    liner = new LineModel();
    confirm: Dialog.Dialog;
    notesForCopy: LineNote[] = [];
    linesForCopy: Line[];

    activeCell: {
        id: number,
        col: number,
        lineInd: number,
        rowCol: string,
        totalOffset: number,
    } = {
        id: 0,
        col: 0,
        lineInd: 0,
        rowCol: '',
        totalOffset: 0,
    };

    get hasIdeItem(): boolean {
        const item = ideService.currentEdit;

        return !!item && !!item.editPartsNio && !!item.allSongParts; //  && !!item.outBlock && !!item.blocks
    }

    get hasEditedItems(): boolean {
        return !!ideService.editedItems.length;
    }

    get isMy(): boolean {
        return !!(ideService.currentEdit && ideService.currentEdit.source === 'my');
    }

    get useLineModel(): boolean {
        return !!(ideService.currentEdit && (ideService.currentEdit.useLineModel));
    }

    get ns(): string {
        return ideService?.currentEdit?.ns || '';
    }

    get songId(): string {
        return ideService.currentEdit.songId;
    }

    constructor(
        public page: KeyboardPage,
        public boardType: DrumKeyboardType | ToneKeyboardType,
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

    getMoveButtons(): string {
        return `
            ${svg.moveLeftBtn('data-action-move-cell="left"', '', 20)}
            ${svg.moveTopBtn('data-action-move-cell="top"', '', 20)}
            ${svg.moveDownBtn('data-action-move-cell="bottom"', '', 20)}
            ${svg.moveRightBtn('data-action-move-cell="right"', '', 20)}
        `.trim();
    }

    addCellDuration(id: number, value: number) {
        if (!id) return;

        const result = this.liner.addCellDuration(id, value);

        if (result) {
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    moveCell(id: number, value: number) {
        if (!id) return;

        const result = this.liner.moveCell(id, value);

        if (result) {
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(`${result.row}-${result.col}`);
            this.activeCell.id = id;
        }
    }

    pasteFromClipboard() {
        if (!this.activeCell.rowCol) {
            return;
        }

        if (this.notesForCopy.length) {
            this.notesForCopy.forEach(note => {
                this.addOrDelNote({
                    note,
                    rowCol: this.activeCell.rowCol,
                    totalOffsetQ: this.activeCell.totalOffset,
                });
            });

            return;
        }

        if (this.linesForCopy.length) {
            let selectedLine = this.liner.lines[this.activeCell.lineInd];

            if (!selectedLine) {
                return;
            }

            const linesForCopy = LineModel.CloneLines(this.linesForCopy);
            let cellId = this.liner.getMaxCellId() + 1;
            let noteId = this.liner.getMaxNoteId() + 1;

            const rowInPartId = selectedLine.rowInPartId;
            const lines = this.liner.lines.filter(item => item.rowInPartId === rowInPartId);

            linesForCopy.forEach((newLine, i) => {
                if (i > lines.length - 1) {
                    return;
                }

                const oldLine = lines[i];
                oldLine.cells = newLine.cells;
                oldLine.cells.forEach(cell => {
                    cell.id = cellId++;
                    cell.notes.forEach(note => {
                        note.id = noteId++;
                    });
                })
            });

            this.updateChess();
        }

        //console.log(this.liner.lines);
    }

    copyToClipboard(type: 'notes' | 'row') {
        this.linesForCopy = [];
        this.notesForCopy = [];

        if (type === 'notes') {
            if (this.activeCell.id) {
                this.notesForCopy = this.liner.getNotesByOffset(this.activeCell.totalOffset);
            }

            return;
        }

        if (type === 'row') {
            const line = this.liner.lines[this.activeCell.lineInd];

            if (line && line.rowInPartId) {
                const rowInPartId = this.liner.lines[this.activeCell.lineInd].rowInPartId;

                const lines = this.liner.lines.filter(item => item.rowInPartId === rowInPartId);
                this.linesForCopy = LineModel.CloneLines(lines);
            }
        }
    }

    subscribeDurationCommands() {
        getWithDataAttrValue('set-cell-duration-action', 'add', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addCellDuration(this.activeCell.id, m.CELL_SIZE));
        });

        getWithDataAttrValue('set-cell-duration-action', 'sub', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addCellDuration(this.activeCell.id, -m.CELL_SIZE));
        });

        getWithDataAttr('copy-notes-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.copyToClipboard('notes'));
        });

        getWithDataAttr('copy-row-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.copyToClipboard('row'));
        });

        getWithDataAttr('paste-notes-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.pasteFromClipboard());
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
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, -m.CELL_SIZE));
        });

        getWithDataAttrValue('action-move-cell', 'right', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.moveCell(this.activeCell.id, m.CELL_SIZE));
        });
    }

    getCellId(el: HTMLElement) {
        return m.parseInteger(el.dataset['chessCellId'], 0);
    }

    setActiveCell(el?: HTMLElement) {
        this.activeCell = this.getCellInfo(el);
    }

    getCellInfo(el?: HTMLElement): this['activeCell'] {
        if (!el) {
            return  {
                id: 0,
                col: 0,
                lineInd: 0,
                rowCol: '',
                totalOffset: 0,
            }
        }

        return {
            id: this.getCellId(el), // data-chess-cell-id
            lineInd: parseInteger(el.dataset['chessCellLineInd'], 0), // data-chess-line-ind
            col: parseInteger(el.dataset['chessCellCol'], 0), // data-chess-cell-col
            rowCol: el.dataset['chessCellRowCol'], // data-chess-cell-row-col
            totalOffset: parseInteger(el.dataset['chessTotalOffset'], 0), // data-chess-total-offset
        }
    }

    highlightCellByRowCol(rowCol: string, highlight: boolean = true) {
        rowCol = rowCol || this.activeCell.rowCol;

        getWithDataAttr('chess-cell-row-col', this.page.pageEl).forEach(el => {
            el.style.outline = null;
            el.style.zIndex = '0';
            el.dataset['selected'] = '';
        });

        getWithDataAttr('chess-pony-col-line-ind', this.page.pageEl).forEach(el => {
            el.style.display = 'none';
        });

        if (highlight) {
            this.setActiveCell(null);
            let el = getWithDataAttrValue('chess-cell-with-id-row-col', rowCol)[0];

            // pony cell
            if (el) {
                const cellId = this.getCellId(el);
                const noteForEdit = this.liner.getNoteById(cellId);

                if (!noteForEdit) return;

                getWithDataAttrValue('chess-pony-col-line-ind', el.dataset.chessCellLineInd).forEach(el => {
                    el.style.display = 'block';

                    el.innerHTML = (m.parseInteger(noteForEdit.volume, m.DEFAULT_VOLUME).toString() + (noteForEdit.slides ? '~' : ''));
                });
            }

            el = el || getWithDataAttrValue('chess-cell-row-col', rowCol)[0];

            if (el) {
                this.setActiveCell(el);

                el.style.outline = '3px solid yellow';
                el.style.zIndex = '1';
                el.dataset['selected'] = 'true';

                this.highlightInstruments();
            }
        }
    }

    getRowActionsCommands(): string {
        const display = `display: ${ideService.currentEdit?.freezeStructure ? 'none': 'block'};`;
        const rowStyle = `${display} width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;

        return `
            <div data-edit-row-actions style="${rowStyle}">
                ${svg.addLineBtn('data-edit-row-action="add-line"', '')}
                ${svg.insertLineBtn('data-edit-row-action="insert-line"', '')}&emsp;
                ${svg.deleteLineBtn('data-edit-row-action="delete-line"', 'red')}
            </div>        
        `.trim();
    }

    getMoveCommandPanel(hasDel = true) {
        let rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let delButton = hasDel
            ? `${svg.deleteBtn('data-edit-line-action="delete-cell"')}&emsp;`
            :'';

        return `
            <div style="${rowStyle}">
                ${this.getMoveButtons()}
                ${delButton}
            </div>
        `.trim();
    }

    getEditCellCommandPanel(hasDel = true): string {
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let delButton = hasDel
            ? `${svg.deleteBtn('data-edit-line-action="delete-cell"')}&emsp;`
            :'';

        let result = '';

        result += `
            <div style="${rowStyle}">
                ${svg.minusBtn('data-set-cell-duration-action="sub"', 'orange')}
                ${svg.moveTopBtn('data-action-move-cell="top"', '', 20)}
                ${svg.plusBtn('data-set-cell-duration-action="add"', 'green')}
                ${svg.noteBtn('data-get-note-for-cell-action', 'blue')}
                ${svg.copyBtn('data-copy-notes-action', 'black')}
                ${svg.pasteBtn('data-paste-notes-action', 'black')}
            </div>
        `.trim();

        result += `
            <div style="${rowStyle}">
                ${svg.moveLeftBtn('data-action-move-cell="left"', '', 20)}
                ${svg.moveDownBtn('data-action-move-cell="bottom"', '', 20)}
                ${svg.moveRightBtn('data-action-move-cell="right"', '', 20)}
                ${svg.instrumentBtn('data-get-instrument-action', 'blue')}
                ${svg.copyManyBtn('data-copy-row-action', 'black')}
                ${svg.emptyBtn('', 20)}
                ${delButton}
            </div>
        `.trim();

        return result;
    }

    getDurationCommandPanel() {
        const rowStyle = `width: 90%; font-family: monospace; margin: .5rem 0; padding-left: 1rem; user-select: none;`;
        let additional = '';

        return `
            <div style="${rowStyle}">
                ${svg.plusBtn('data-set-cell-duration-action="add"', 'green')}
                ${svg.minusBtn('data-set-cell-duration-action="sub"', 'orange')}
                ${svg.noteBtn('data-get-note-for-cell-action', 'blue')}
                ${svg.instrumentBtn('data-get-instrument-action', 'blue')}
                ${svg.copyBtn('data-copy-notes-action', 'black')}
                ${svg.copyManyBtn('data-copy-row-action', 'black')}
                ${svg.pasteBtn('data-paste-notes-action', 'black')}
                ${additional}
            </div>
        `.trim();
    }

    getRecordCommandPanel(): string {
        const style = `border-radius: 0.25rem; border: 1px solid lightgray; font-size: 1.1rem; user-select: none;`;
        const rowStyle = `margin: .5rem 0; padding-left: 1rem; width: 90%; user-select: none; ${monoFont}`;
        let result = '';

        result = `
            <div style="${rowStyle}">
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
            </div>
        `.trim();

        return result;
    }

    delete_Cell(el: HTMLElement) {
        const cellEl = getWithDataAttrValue('chess-cell-row-col', this.activeCell.rowCol)[0];

        if (!cellEl) return;

        const totalOffset = parseInteger(cellEl.dataset['chessTotalOffset'], null);

        if (totalOffset === null) return;

        this.liner.delete_CellByOffset(totalOffset);
        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    addLine() {
        const line = this.liner.lines[this.activeCell.lineInd];

        this.liner.addLineAfter(this.activeCell.lineInd, line?.rowInPartId || '');
        this.setEditingItemDurationAndBlockOffsetByLines();

        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    insertLine() {
        const line = this.liner.lines[this.activeCell.lineInd];

        this.liner.addLineAfter(this.activeCell.lineInd - 1, line?.rowInPartId || '');
        this.setEditingItemDurationAndBlockOffsetByLines();

        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    delete_Line() {
        if (!this.activeCell.rowCol) {
            return;
        }

        const line = this.liner.lines[this.activeCell.lineInd];

        if (this.hasEditedItems) {
            const groupLines = this.liner.lines.filter(item => item.rowInPartId === line.rowInPartId);

            if (groupLines.length - 1 < 1) {
                return;
            }
        }

        this.liner.delete_Line(this.activeCell.lineInd, line.rowInPartId);
        this.setEditingItemDurationAndBlockOffsetByLines();
        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(this.activeCell.rowCol);
    }

    getPlayCommandPanel(): string {
        const blank = '<span style="width: .5rem; display: inline-block;"></span>'
        const rowStyle = `
            padding: .5rem 0 .25rem 1rem;            
            user-select: none;
            border-top: 1px solid gray;
        `.trim();
        const cmdStyle = `
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1rem;
            user-select: none; touch-action: none;
        `.trim();

        let result = `
            <div data-play-command-panel>
                <div style="${rowStyle}">
                    %content%                                        
                </div>
            </div>
        `.trim();

        if (this.hasIdeItem) {
            result = result.replace('%content%', `
                ${svg.saveBtn('data-ide-action="save"', '', 20)}${blank}${blank}
                ${svg.stopBtn('data-ide-action="stop"', '', 20)}${blank}
                ${svg.playBtn('data-ide-action="play-solo-action"', '', 20)}${blank}
                ${svg.playBtn2('data-ide-action="play-both"', '', 20)}${blank}
                ${svg.playBtn3('data-ide-action="play-source"', '', 20)}${blank}
                <span style="${cmdStyle}" data-clear-ide-song-action>free</span>
            `.trim());
        } else {
            result = result.replace('%content%', `
                ${svg.stopBtn('data-ide-action="stop"', '', 20)}${blank}
                ${svg.playBtn('data-ide-action="play-solo-action"', '', 20)}${blank}
            `.trim());
        }

        return result;
    }

    setEditingItemDurationAndBlockOffsetByLines() {
        this.sort_ByPartAndRowNio(ideService.editedItems);

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

    getRowsForPart(song: SongNode, part: SongPartInfo): StoredRow[] {
        const partRows = song.dynamic.filter(row => {
            const iPartId = (row.partId || '').trim();
            const iPartNio = m.getPartNio(row.rowInPartId);

            if (part.partId && iPartId) {
                return part.partId === iPartId;
            }

            return part.partNio === iPartNio;
        });

        this.sort_ByPartAndRowNio(partRows);

        return partRows;
    }

    resetBlockOffset(rows: StoredRow[]) {
        rows.forEach(row => {
            LineModel.ClearBlockOffset(row.lines);
        });
    }

    getPartsWithRows(x: {
        song: SongNode,
        parts: SongPartInfo[],
        resetBlockOffset: boolean,
        useEditingItems: boolean
    }): {partId: string, rows: StoredRow[][]}[] {

        const hash = {};
        const list: {partId: string, rows: StoredRow[][]}[] = [];

        x.parts.forEach(part => {
            const partRows = this.getRowsForPart(x.song, part).filter(row => {
                // исключаем текущие редактируемые строки
                if (x.useEditingItems && row.track === this.trackName) {
                    return false;
                }

                return true;
            });

            // добавляем линии текущих редактируемых строк
            if (x.useEditingItems) {
                ideService.editedItems.forEach(row => {
                    if (row.partNio !== part.partNio) {
                        return;
                    }

                    let lines = LineModel.CloneLines(
                        this.liner.lines.filter(line => {
                            return row.rowInPartId === line.rowInPartId;
                        })
                    );

                    partRows.push({
                        type: this.boardType,
                        track: this.trackName,
                        partId: row.partId,
                        rowInPartId: row.rowInPartId,
                        rowNio: m.getRowNio(row.rowInPartId),
                        status: 'unknown',
                        lines
                    });
                });

                this.sort_ByPartAndRowNio(partRows);
            }

            if (x.resetBlockOffset) this.resetBlockOffset(partRows);

            partRows.forEach(row => {
                const iPartNio = m.getPartNio(row.rowInPartId);
                const iRowNio = m.getRowNio(row.rowInPartId);

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

    getNotes(id: string, item: {
        type?: string,
        track: string,
        lines: Line[],
    }): string {
        if (item.type === 'drums' || item.track.startsWith(m.drumChar)) {
            const trackName = item.track || m.drumsTrack;

            return LineModel.GetDrumNotes(id, trackName, item.lines);
        }

        return LineModel.GetToneNotes({
            blockName: id,
            rows: item.lines,
            instrName: '$organ',
            track: item.track || '$unknown',
        });
    }

    buildBlocksForMySong(
        blocks: TextBlock[],
        resetBlockOffset = false,
        useEditingItems = false
    ): TextBlock[] {
        const song = ideService.songStore.data;
        const editingParts: SongPartInfo[] = [];

        ideService.currentEdit.editPartsNio.sort();
        ideService.currentEdit.editPartsNio.forEach(partNio => {
            editingParts.push(
                m.getPartInfo(ideService.currentEdit.allSongParts[partNio - 1])
            );
        });

        const partsWithRows = this.getPartsWithRows({
            song,
            parts: editingParts,
            resetBlockOffset,
            useEditingItems
        });
        let topOutBlocks: string[][] = [];

        partsWithRows.forEach(part => {
            let partSetRows: string[] = [`<${part.partId} set>`];

            part.rows.forEach(row => {
                let maxDurQ = 0;
                let headGuid = `head_${ideService.guid.toString()}`;
                let rowRefs: string[] = [headGuid];

                row.forEach(item => {
                    const guid = `temp_${ideService.guid.toString()}`;
                    const durQ = LineModel.GetDurationQByLines(item.lines);

                    let notes = this.getNotes(guid, item);

                    if(!notes) {
                        notes = `<${guid} $>\n$organ: ${durQ}`;
                    }

                    const block = m.getTextBlocks(notes)[0];

                    blocks = [...blocks, block];

                    maxDurQ = durQ > maxDurQ ? durQ: maxDurQ;

                    rowRefs.push(guid);
                });

                const headBlock = m.getTextBlocks(`<${headGuid} $>\n$organ: ${maxDurQ}`)[0];

                blocks = [...blocks, headBlock];

                partSetRows.push(rowRefs.join(' '));
            });

            topOutBlocks.push(partSetRows);
        });

        topOutBlocks.forEach(part => {
            const partBlock = m.getTextBlocks(part.join('\n'))[0];

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
        const songId = this.songId;
        const song = ideService.songStore.clone();

        ideService.editedItems.forEach(editedItem => {
            let iLines: Line[] = this.liner.lines.filter(row => row.rowInPartId === editedItem.rowInPartId);

            if (!iLines.length && song) {
                song.dynamic.forEach(item => {
                    if (item.rowInPartId === editedItem.rowInPartId && item.track === this.trackName) {
                        iLines = [...iLines, ...item.lines];
                    }
                });
            }

            // if (!this.useLineModel) {
            //     let songNode: StoredSongNodeOld = localStorage.getItem(songId) as any;
            //     if (!iLines.length && songNode) {
            //         songNode = JSON.parse(songNode as any as string);
            //
            //         if (songNode[editedItem.rowInPartId]) {
            //             let items = songNode[editedItem.rowInPartId].items;
            //             let node = items.find(item => item.rowInPartId === editedItem.rowInPartId && item.type === this.boardType);
            //             if (node) {
            //                 iLines = node.rows;
            //             }
            //         }
            //     }
            //
            // } else {
            //     const song = ideService.songStore.clone();
            //
            //     if (!iLines.length && song) {
            //         song.dynamic.forEach(item => {
            //             if (item.rowInPartId === editedItem.rowInPartId && item.track === this.trackName) {
            //                 iLines = [...iLines, ...item.lines];
            //             }
            //         });
            //     }
            // }

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

        if (this.useLineModel) {
            blocks = this.buildBlocksForMySong(blocks, x.resetBlockOffset, x.useEditing);
        }

        const rows = currentEdit.editPartsNio.reduce((acc, partNio) => {
            const part = currentEdit.allSongParts[partNio - 1];
            const info = m.getPartInfo(part);
            let N = '';

            if (!info.partNio) {
                N = ` ${m.getNRowInPartId(partNio)}`;
            }

            acc.push(`> ${part}${N}`);

            return acc;
        }, [] as string[] );

        const outBlock = m.createOutBlock({
            id: 'out',
            type: 'text',
            bpm: this.page.bpmValue,
            rows,
            volume: ideService.outVolume,
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

        m.getMidiConfig(midiConfig);

        return midiConfig;
    }

    getRowsByPartActions(part: SongPartInfo) {
        const cmdStyle = `
            border-radius: 0.25rem;
            border: 1px solid lightgray;
            font-size: 1rem;
            user-select: none; touch-action: none;
        `.trim();

        return `
            <span
                style="${cmdStyle} color: green;"
                data-ide-action="add-row"
                data-part-nio="${part.partNio}"
                data-part-id="${part.partId}"                    
            >${sings.add}</span>&emsp;
            <span
                style="${cmdStyle} color: red;"
                data-ide-action="delete-row"
                data-part-nio="${part.partNio}"
                data-part-id="${part.partId}"                    
            >${sings.delete}</span>&emsp;
            <!--span
                style="${cmdStyle} color: red;"
                data-ide-action="test-sheet"
            >test-sheet</span-->
        `
    }

    getRowsByPartComplexContent(): string {
        if (!this.hasIdeItem) return '';

        return `
            ${this.getRowsByPartContent()}
        `.trim();
    }

    getRowsByPartContent(): string {
        if (!this.hasIdeItem) return '';

        const currentEdit = ideService.currentEdit;
        let itemStyle = `
            display: inline-block;
            padding: .15rem;
            margin-right: .5rem; margin-top: .5rem;
            font-size: .8rem; font-weight: 400;
            user-select: none; touch-action: none;
            border: 1px solid gray; border-radius: .3rem;
        `.trim();

        const midiConfig = this.getMidiConfig();
        const outBlocksInfo = m.getOutBlocksInfo(midiConfig.blocks, midiConfig.playBlockOut);
        const partHash: {
            [key: string]: {
                part: SongPartInfo,
                rows: {row: OutBlockRowInfo, partNio: number, rowNio: number}[]
            }
        } = {};

        const rowsByParts: {
            part: SongPartInfo,
            rows: {row: OutBlockRowInfo, partNio: number, rowNio: number}[]
        }[] = [];

        // ЗАПОЛНЯЕМ ЧАСТИ
        ideService.currentEdit.editPartsNio.sort();
        ideService.currentEdit.editPartsNio.forEach(partNio => {
            const part = m.getPartInfo(currentEdit.allSongParts[partNio - 1]);

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
            const info = m.getPartInfo(row.text);

            if (!info.partNio || !info.rowNio || !partHash[info.partNio]) {
                return;
            }

            partHash[info.partNio].rows.push({
                partNio: info.partNio,
                rowNio: info.rowNio,
                row,
            });
        });

        let result = '';

        // ФОРМИРУЕМ СПИСОК ЧАСТЕЙ
        rowsByParts.forEach(item => {
            const part = item.part;
            let actions = '';

            if (!ideService.currentEdit.freezeStructure) {
                actions = `&emsp;${this.getRowsByPartActions(part)}`;
            }

            result += `
                <div style="padding: .5rem 2rem 0 .5rem; border-top: 1px solid lightgray;">
                    <span style="margin: .5rem; font-weight: 600;"
                    >${part.partNio}-${part.ref}</span>
                    ${actions}       
                </div>
            `.trim();

            result += '<div style="padding: 0 2rem .5rem .5rem; border-bottom: 1px solid lightgray;">'

            item.rows.forEach(info => {
                const row = info.row;
                const rowCount = Math.ceil(row.rowDurationByHeadQ / m.NUM_120);
                let cellCount = 0;

                if (row.rowDurationByHeadQ % m.NUM_120) {
                    cellCount = Math.floor((row.rowDurationByHeadQ % m.NUM_120) / 10);
                }

                result += `<span
                    style="${itemStyle}"
                    data-row-in-part-item
                    data-row-in-part-id="${info.partNio}-${info.rowNio}"                    
                    data-song-name="${currentEdit.songId}"
                    data-part-nio="${info.partNio}"                    
                    data-row-nio="${info.rowNio}"
                    data-part-id="${part.partId}"
                    data-init-duration="${row.rowDurationByHeadQ}"                                                            
                >${info.rowNio}:${rowCount + (cellCount ? '.' + cellCount : '')}</span>`;
            });

            result += '</div>';
        });

        return result;
    }

    remove_EditingItem(rowInPartId: string) {
        ideService.editedItems = ideService.editedItems.filter(iItem => iItem.rowInPartId !== rowInPartId);
    }

    addOrRemoveEditingItem(item: EditedItem, el: HTMLElement) {
        if (ideService.editedItems.find(iItem => iItem.rowInPartId === item.rowInPartId)) {
            ideService.editedItems = ideService.editedItems.filter(iItem => iItem.rowInPartId !== item.rowInPartId);
        } else {
            ideService.editedItems.push(item);
        }
    }

    sort_ByPartAndRowNio(rows: {
        partNio?: number,
        rowNio?: number,
        rowInPartId?: string
    }[]) {
        return KeyboardCtrl.Sort_ByPartAndRowNio(rows);
    }

    static Sort_ByPartAndRowNio(rows: {
        partNio?: number,
        rowNio?: number,
        rowInPartId?: string
    }[]) {
        rows.sort((a, b) => {
            const partNioA = a.partNio ? a.partNio : m.getPartNio(a.rowInPartId);
            const partNioB = b.partNio ? b.partNio : m.getPartNio(b.rowInPartId);

            if (partNioA < partNioB) return -1;
            if (partNioA > partNioB) return 1;

            const rowNioA = a.rowNio ? a.rowNio : m.getRowNio(a.rowInPartId);
            const rowNioB = b.rowNio ? b.rowNio : m.getRowNio(b.rowInPartId);

            if (rowNioA < rowNioB) return -1;
            if (rowNioB > rowNioB) return 1;

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
        this.sort_ByPartAndRowNio(ideService.editedItems);
        this.updateView();
    }

    resetEditingParts() {
        ideService.currentEdit = {} as any;
        ideService.editedItems = [];
        ideService.songStore = null;

        getWithDataAttr('ide-content', this.page.pageEl).forEach((el: HTMLElement) => {
            el.innerHTML = null;
        });
        getWithDataAttr('play-command-panel', this.page.pageEl).forEach((el: HTMLElement) => {
            el.innerHTML = null;
        });
        getWithDataAttr('edit-row-actions', this.page.pageEl).forEach((el: HTMLElement) => {
            el.style.display = 'block';
        });

        this.page.initData();
        this.page.setContent();
        //this.liner.fillLinesStructure('480');
        //this.printChess(this.liner.lines);
    }

    subscribeIdeEvents() {
        getWithDataAttrValue('ide-action', 'play-both', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playBoth());
        });

        getWithDataAttrValue('ide-action', 'save', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.saveEditingItems());
        });

        // jjkl: delete?
        getWithDataAttr('load-song-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.loadFile());
        });

        // jjkl: delete?
        getWithDataAttrValue('ide-action', 'back-to-parts', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.gotoSong());
        });

        getWithDataAttr('row-in-part-item', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerup', () => this.songRowClick(el));
        });

        getWithDataAttr('clear-ide-song-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.resetEditingParts());
        });

        getWithDataAttrValue('ide-action', 'play-source', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playActive());
        });

        getWithDataAttrValue('ide-action', 'play-solo-action', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.playSolo());
        });

        getWithDataAttrValue('ide-action', 'stop', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.page.stop());
        });

        getWithDataAttrValue('ide-action', 'add-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerup', () => this.addRowInPart(el.dataset['partId'], el.dataset['partNio']));
        });

        getWithDataAttrValue('ide-action', 'delete-row', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerup', () => this.delete_RowFromPart(el.dataset['partId'], el.dataset['partNio']));
        });

        getWithDataAttrValue('ide-action', 'test-sheet', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => {
                getWithDataAttr('app-header-second-row-area').forEach(el => {
                    el.innerHTML = this.getRowsByPartContent();
                });

                // app-header-second-row-area
                //this.delete_RowFromPart(el.dataset['partId'], el.dataset['partNio'])

                // const sheet = (this.page.context.$f7 as any).sheet.create({
                //     backdrop: false,
                //
                //     content: `
                //         <div class="sheet-modal sheet-modal-top" style="height: 200px;">
                //             <div class="toolbar toolbar-bottom">
                //                 <div class="toolbar-inner justify-content-flex-end">
                //                     <a  class="link sheet-close">Close</a>
                //                 </div>
                //             </div>
                //             <div class="sheet-modal-inner">
                //                 <div class="page-content">
                //                     <div style="padding: .5rem;">
                //                         ${this.getRowsByPartContent()}
                //                     </div>
                //                 </div>
                //             </div>
                //         </div>
                //     `,
                //     on: {
                //         opened: function () {
                //             console.log('Sheet opened')
                //         }
                //     }
                // }) as Sheet.Sheet;
                //
                // sheet.open(true);

            });
        });
    }

    gotoSong() {
        this.page.context.$f7router.navigate(`/mbox/${this.songId}/`);
    }

    delete_RowFromPart(partId: string, partNio: number | string) {
        partId = (partId || '').trim();
        partNio = m.parseInteger(partNio, 0);

        if (!partId && !partNio) return;

        const song = ideService.songStore.data;
        const rows = SongStore.GetRowsByPart(song.dynamic, partId, partNio);

        const partRowNios = rows.map(item => m.getPartRowNio(item.rowInPartId));
        this.sort_ByPartAndRowNio(partRowNios);

        const rowNioForDel = partRowNios[partRowNios.length - 1].rowNio;

        if (!rowNioForDel) return;

        this.confirm = (this.page.context.$f7 as any).dialog.confirm(
            '',
            `Удалить строку ${rowNioForDel} во всех трэках?`,
            () => {
                SongStore.Delete_RowFromPart(song, partId, <number>partNio, rowNioForDel);
                ideService.songStore.save();

                this.remove_EditingItem(`${partNio}-${rowNioForDel}`)

                getWithDataAttr('edit-parts-wrapper').forEach(el => {
                    el.innerHTML = this.getRowsByPartComplexContent();
                    this.subscribeIdeEvents();
                });

                this.updateView();
            },
            () => {}, // cancel
        );

        this.confirm.open();
    }

    addRowInPart(partId: string, partNio: number | string) {
        partNio = m.parseInteger(partNio, 0);
        partId = (partId || '').trim();

        if (!partId && !partNio) return;

        //console.log(partId, partNio);

        const song = ideService.songStore.clone();

        const rowNios = SongStore.GetRowsByPart(song.dynamic, partId, partNio).map(item => m.getRowNio(item.rowInPartId));
        const rowNio = (rowNios.length ? Math.max(...rowNios) : 0) + 1;
        const rowInPartId = `${partNio}-${rowNio}`;

        song.dynamic.push({
            partId,
            rowInPartId: `${partNio}-${rowNio}`,
            rowNio: rowNio,
            type: this.boardType,
            status: 'draft',
            lines: [
                this.liner.getEmptyLine(rowInPartId),
            ],
            track: this.trackName,
        });

        ideService.songStore.save(song);

        getWithDataAttr('edit-parts-wrapper').forEach(el => {
            el.innerHTML = this.getRowsByPartComplexContent();
            this.subscribeIdeEvents();
        });

        this.updateView();
    }

    loadFile() {
        // https://webtips.dev/download-any-file-with-javascript
        let songName = ideService.currentEdit?.songId || '';

        if (!songName) return;

        const songNode = ideService.songStore.data;

        if (!songNode) return;

        let data = JSON.stringify(songNode, null, 2);
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

    saveEditingItems() {
        if (!ideService.editedItems.length) return;

        let song = ideService.songStore.clone();
        const savedItems = ideService.editedItems.map(item => item.rowInPartId);

        const dynamic = song.dynamic.filter(item => {
            return !savedItems.includes(item.rowInPartId) || (savedItems.includes(item.rowInPartId) && item.track !== this.trackName);
        });

        ideService.editedItems.forEach(item => {
            const lines = this.liner.lines.filter(line => line.rowInPartId === item.rowInPartId);

            if (!lines.length) return;

            dynamic.push({
                track: this.trackName,
                type: this.boardType,
                rowInPartId: item.rowInPartId,
                partId: item.partId,
                rowNio: item.rowNio,
                status: 'unknown',
                lines
            });
        });

        song.dynamic = dynamic;

        ideService.songStore.save(song);
    }

    getMetronomeContent() {
        return `
            <div style="margin: 0 0 1.5rem 1rem; width: 15rem;">
                ${this.page.getMetronomeContent()}
            </div>`.trim();
    }

    subscribeEditCommands() {
        getWithDataAttrValue('edit-line-action', 'delete-cell', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.delete_Cell(el));
        });

        getWithDataAttrValue('edit-row-action', 'add-line', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.addLine());
        });

        getWithDataAttrValue('edit-row-action', 'insert-line', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.insertLine());
        });

        getWithDataAttrValue('edit-row-action', 'delete-line', this.page.pageEl).forEach((el: HTMLElement) => {
            el.addEventListener('pointerdown', () => this.delete_Line());
        });
    }

    getTotalOffsetByRowCol(rowCol: string): number {
        if (!rowCol) return null;

        const cell = getWithDataAttrValue('chess-cell-row-col', rowCol)[0];
        if (!cell) return null;

        const totalOffsetQ = parseInteger(cell.dataset['chessTotalOffset'], null);

        if (totalOffsetQ === null) return null;

        return totalOffsetQ;
    }

    replaceInstrument(el: HTMLElement) {
        const inArea = el.dataset.replaceInstrumentAction;
        const rowCol = this.activeCell.rowCol;
        let notes:LineNote[] = [];

        //console.log('replaceInstrument', inArea, this.activeCell);

        if (inArea === 'note') {
            const totalOffsetQ = this.getTotalOffsetByRowCol(rowCol);

            if (totalOffsetQ === null) return;

            notes = this.liner.getNotesByOffset(totalOffsetQ);
        }
        else if (inArea === 'block') {
            const line = this.liner.lines[this.activeCell.lineInd];

            if (line && line.rowInPartId) {
                const rowInPartId = this.liner.lines[this.activeCell.lineInd].rowInPartId;
                const lines = this.liner.lines.filter(item => item.rowInPartId === rowInPartId);

                lines.forEach(line => {
                    line.cells.forEach(cell => {
                        cell.notes.forEach(note => {
                           notes.push(note);
                        });
                    })
                });
            }
        }
        else if (inArea === 'blocks') {
            notes = this.liner.getAllNotes();
        }

        notes.forEach(note => {
            note.instCode = this.instrCode;
            note.instName = this.instrName;
        });

        this.printChess(this.liner.lines);
        this.highlightCellByRowCol(rowCol);
    }

    addOrDelNote(x: {
        note: string | LineNote,
        rowCol: string,
        totalOffsetQ: number,
        durQ?: number,
        instCode?: string | number,
        instName?: string,
    }) {
        const note = typeof x.note === 'string' ? {note: x.note} : x.note;
        let noteInfo = this.getNoteInfo(note.note) as any as LineNote;

        noteInfo = {
            ...noteInfo,
            durQ: x.durQ || 10,
            instCode: x.instCode || this.instrCode,
            instName: x.instName || this.instrName,
            ...note,
        }

        //console.log('addOrDelNote', x, noteInfo);

        const notes = this.liner.getNotesByOffset(x.totalOffsetQ);

        let isDelete = false;

        for (let iNote of notes) {
            if (iNote.note === note.note) {
                isDelete = true;

                this.liner.delete_NoteByNoteAndOffset(x.totalOffsetQ, note.note);
            }
        }

        if (!isDelete) {
            let info = this.liner.addNoteByOffset(x.totalOffsetQ, noteInfo);
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(x.rowCol);
            this.activeCell.id = info.note.id;
        } else {
            this.printChess(this.liner.lines);
            this.highlightCellByRowCol(x.rowCol);
        }
    }

    addOrDelNoteClick(el: string | HTMLElement) {
        if (!this.activeCell.rowCol) return;

        const rowCol = this.activeCell.rowCol;
        const totalOffsetQ = this.getTotalOffsetByRowCol(rowCol);

        if (totalOffsetQ === null) return;

        const note = typeof el === 'string' ? el : el.dataset['noteLat'];

        if (!note) return;

        this.addOrDelNote({
            note,
            rowCol,
            totalOffsetQ,
            durQ: 10,
        });
    }

    playActive() {
        if (!this.hasEditedItems) return;

        this.page.stop();

        const midiConfig = this.getMidiConfig({ resetBlockOffset: true });
        const playBlock = midiConfig.playBlockOut as TextBlock;
        const playingRows = playBlock.rows.filter(item => {
            const part = m.getPartInfo(item);
            return !!ideService.editedItems.find(item => item.rowInPartId === part.rowInPartId);
        });

        if (!playingRows.length) return;

        const newOutBlock = m.createOutBlock({
            id: 'out',
            type: 'set',
            rows: playingRows,
            bpm: this.page.bpmValue,
            volume: ideService.outVolume,
        });


        this.page.multiPlayer.tryPlayMidiBlock({
            blocks: midiConfig.blocks,
            playBlock: newOutBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            dataByTracks: ideService.dataByTracks,
            //pitchShift: getPitchShiftSetting(ideService.currentEdit?.settings)
        });
    }

    async playSolo() {
        const repeatCount = 1000;

        this.page.stop();

        for (let i = 0; i < repeatCount; i++) {
            const notes = this.getNotes(
                'temp',
                {
                    track: this.trackName || '$unknown',
                    type: this.boardType,
                    lines: this.liner.lines,
                }
            );

            if (!notes) return;

            let blocks = [
                `<out r1 v${ideService.outVolume} >`,
                'temp',
                notes
            ].join('\n');

            const result = await this.page.multiPlayer.tryPlayMidiBlock({
                blocks,
                bpm: this.page.bpmValue,
            });

            this.page.stop();

            if (result === 'break') {
                return;
            }
        }
    }

    playBoth() {
        this.page.stop();

        if (!this.hasEditedItems) return;

        let rowsForPlay: string[] = [];

        const midiConfig = this.getMidiConfig({ resetBlockOffset: true, useEditing: true });
        let blocks = midiConfig.blocks;
        let playBlock = midiConfig.playBlockOut as TextBlock;

        const playingRows = playBlock.rows.filter(item => {
            const part = m.getPartInfo(item);
            return !!ideService.editedItems.find(item => item.rowInPartId === part.rowInPartId);
        });

        playingRows.forEach(rowText => {
            if (!this.useLineModel) {
                const part = m.getPartInfo(rowText);
                let lines = this.liner.lines.filter(line => line.rowInPartId === part.rowInPartId)
                lines = this.liner.cloneRows(lines);
                LineModel.ClearBlockOffset(lines);

                const notes = this.getNotes(ideService.guid.toString(), {
                    track: this.trackName,
                    type: this.boardType,
                    lines
                });

                if (notes) {
                    const block = m.getTextBlocks(notes)[0];

                    rowsForPlay.push(`${rowText} ${block.id}`);
                    blocks = [...blocks, block];
                } else {
                    rowsForPlay.push(`${rowText}`);
                }
            } else {
                rowsForPlay.push(`${rowText}`);
            }
        });

        playBlock = m.createOutBlock({
            id: 'out',
            type: 'set',
            rows: rowsForPlay,
            bpm: this.page.bpmValue,
            volume: ideService.outVolume,
        });

        this.page.multiPlayer.tryPlayMidiBlock({
            blocks,
            playBlock,
            bpm: this.page.bpmValue,
            repeatCount: 1,
            dataByTracks: ideService.dataByTracks,
        });
    }

    ponyCellClicked() {
        const noteForEdit = this.liner.getNoteById(this.activeCell.id);

        if (!noteForEdit) return;

        new NoteDetailsDialog(this.page.context, this).openDialog(noteForEdit, (note:LineNote) => {
            noteForEdit.volume = note.volume;
            noteForEdit.slides = note.slides;

            if (noteForEdit.durQ !== note.durQ) {
                noteForEdit.durQ = note.durQ;
                //this.updateChess();
            }

            //console.log('ponyCellClicked.dialog.ok', noteForEdit);
        });
    }

    updateRowInPartItems() {
        getWithDataAttr('row-in-part-item', this.page.pageEl).forEach(el => {
            const rowInPartId = el.dataset['rowInPartId'];

            if (ideService.editedItems.find(item => item.rowInPartId === rowInPartId)) {
                el.style.backgroundColor = 'lightgray';
            } else {
                el.style.backgroundColor = 'white';
            }
        });
    }

    updateView() {}
    printChess(rows: Line[]) {}
    highlightInstruments() {}
    getNoteInfo(noteLat: string): {
        note: string,
        headColor: string,
        bodyColor: string,
        char: string,
        vocalism: string,
    } {
        return {} as any;
    }
    get instrName(): string {return ''}
    get instrCode(): string | number { return ''}
}

// CONTENT
//  getRowsByPartComplexContent getRowsByPartContent
//  getRowActionsCommands
//  getMetronomeContent
//  getMoveCommandPanel
//  getDurationCommandPanel
//  getTopCommandPanel
//  getBottomCommandPanel

// SUBSCRIBE
//  subscribeEditCommands
//  subscribeIdeEvents
//  subscribeDurationCommands
//  subscribeMoveCommands
//  subscribeChess

//  saveEditingItems
//  loadFile
//  addRowInPart
//  resetEditingParts
//  songRowClick
//  sortByPartAndRowNio
//  addOrRemoveEditingItem
//  getMidiConfig

// updateChess
// buildBlocksForMySong
// getPartsWithRows  getRowsForPart
// getNotes
// resetBlockOffset

// EDITING ITEMS
// setEditingItemDurationAndBlockOffsetByLines
// addOrDelNoteClick -> addOrDelNote
// getEmptyBpmInfo
// getMoveButtons
//
//
// CELL
// getCellInfo  setActiveCell  getCellId  moveCell  addCellDuration
// highlightCellByRowCol
// ponyCellClicked

// CHESS LINE
// addLine insertLine


// remove_EditingItem
// delete_Line delete_RowFromPart delete_Cell

// PLAY
// playActive playOne playBoth
