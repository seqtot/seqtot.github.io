import * as un from '../libs/muse/utils/utils-note';

export type KeyData = {
    quarterTime: number;
    quarterNio: number;
    //quarterInfo: string;
    code: string;
    note: string;
    down: number;
    up: number;
    next: number;
    color: string;
    color2: string;
    char: string;
};

export type NoteItem = {
    id: number;
    durQ: number;
    note: string;
    headColor?: string;
    bodyColor?: string;
    startOffsetQ: number;
    char: string;
};

export type Cell = {
    id: number;
    startOffsetQ: number;
    notes: NoteItem[]
}

export type Line = {
    //nio: number,
    durQ: number,
    startOffsetQ: number,
    blockOffsetQ: number,
    rowInPartId: string,
    cellSizeQ: number,
    cells: Cell[],
    endLine?: boolean,
}

type CellCoord = {
    row: number,
    ind: number,
    col: number,
}

export class LineModel {
    rows: Line[] = [];

    findRowIndByOffset(offsetQ: number): number {
        return this.rows.findIndex(row => {
            const rowOffsetQ  = row.startOffsetQ + row.blockOffsetQ;
            return offsetQ >= rowOffsetQ && offsetQ < (rowOffsetQ + row.durQ)
        });
    }

    getRowByOffset(offsetQ: number): Line {
        return this.rows[this.findRowIndByOffset(offsetQ)];
    }

    getCellByNoteId(id: number): Cell {
        for (let row of this.rows) {
            for (let cell of row.cells) {
                for (let note of cell.notes) {
                    if (note.id === id) {
                        return cell;
                    }
                }
            }
        }

        return null as any;
    }

    moveCell(id: number, value: number): CellCoord | null {
        const info = this.getRowAndCellIndexes(id);

        if (!info) {
            return null;
        }

        const rows = this.rows;
        const row = rows[info.row];
        const cell = rows[info.row].cells[info.ind];

        let newTotalOffsetQ = row.blockOffsetQ + cell.startOffsetQ + value;
        let oldTotalOffsetQ = row.startOffsetQ + row.blockOffsetQ;

        if (newTotalOffsetQ >= oldTotalOffsetQ && newTotalOffsetQ < (oldTotalOffsetQ + row.durQ)) {
            cell.startOffsetQ = newTotalOffsetQ - row.blockOffsetQ;

            return this.getRowAndCellIndexes(id);
        } else {
            const ind = this.findRowIndByOffset(newTotalOffsetQ);

            if (ind > -1) {
                const newRow = this.rows[ind];
                row.cells = row.cells.filter(item => item != cell);
                cell.startOffsetQ = newTotalOffsetQ - newRow.blockOffsetQ;
                newRow.cells.push(cell);

                return this.getRowAndCellIndexes(id);
            }
        }

        return null;
    }

    setData(rows: Line[]) {
        let noteId = 1;
        let cellId = 1;

        rows.forEach(row => {
            row.cells.forEach(cell => {
                cell.id = cellId++;
                cell.notes.forEach(note => {
                    note.id = noteId++;
                })
            })
        });

        this.rows = rows;
    }

    deleteNoteByNoteAndOffset(offset: number, note: string) {
        const {row, cells} = this.getCellsByOffset(offset);

        if (!row) return;

        cells.forEach(cell => {
            cell.notes = cell.notes.filter(iNote => iNote.note !== note);
        });

        row.cells = row.cells.filter(cell => !!cell.notes.length);

        console.log(row, cells);
    }

    deleteCellByOffset(offsetQ: number) {
        const row = this.rows[this.findRowIndByOffset(offsetQ)];

        if (!row) return;

        offsetQ = offsetQ - row.blockOffsetQ;

        row.cells = row.cells.filter(cell => {
            return cell.startOffsetQ !== offsetQ;
        });
    }

    getAllCells(): Cell[] {
        const result: Cell[] = [];

        this.rows.forEach(row => {
            row.cells.forEach(cell => {
                result.push(cell);
            })
        })

        return  result;
    }

    getMaxCellId(): number {
        const cells = this.getAllCells();
        if (!cells.length) return 0;

        return Math.max(...cells.map(item => item.id));
    }

    getMaxNoteId(): number {
        const notes = this.getAllNotes();
        if (!notes.length) return 0;

        return Math.max(...notes.map(item => item.id));
    }

    getAllNotes(): NoteItem[] {
        const cells = this.getAllCells();

        if (!cells.length) return [];

        return cells.reduce((acc, cell) => {
            return acc = [...acc, ...cell.notes]
        }, []);
    }

    addNoteByOffset(offsetQ: number, note: NoteItem): {
        note: NoteItem,
        coord: CellCoord,
    } {
        const row = this.getRowByOffset(offsetQ);

        if (!row) return;

        note.id = this.getMaxNoteId() + 1;
        note.startOffsetQ = offsetQ - row.blockOffsetQ;

        const id = this.getMaxCellId() + 1;

        row.cells.push({
           id,
           startOffsetQ: note.startOffsetQ,
           notes: [note]
        });

        return {
            note,
            coord: this.getRowAndCellIndexes(id)
        };
    }

    deleteRow(i: number) {
        if (this.rows.length === 1) {
            this.rows = [];

            return;
        }

        const topArr = this.rows.slice(0, i+1);
        const botArr = this.rows.slice(i+1);
        const delRow = topArr.pop();
        this.addOffset(botArr, -delRow.durQ);

        this.rows = [...topArr, ...botArr];
    }

    addRowAfter(i: number) {
        const newRow: Line = {
            durQ: 120,
            startOffsetQ: 0,
            cells: [],
            cellSizeQ: 10,
            blockOffsetQ: 0,
            rowInPartId: '',
        };

        if (!this.rows.length) {
            this.rows.push(newRow);

            return;
        }

        const topArr = this.rows.slice(0, i+1);
        const lastEl = topArr[topArr.length-1];
        const botArr = this.rows.slice(i+1);

        this.addOffset(botArr, 120);
        newRow.startOffsetQ = lastEl ? lastEl.startOffsetQ + lastEl.durQ : 0;
        topArr.push(newRow);
        this.rows = [...topArr, ...botArr];
    }

    addOffset(arr: Line[], offsetQ: number) {
        for (let i = 0; i < arr.length; i++) {
            const row = arr[i];

            row.startOffsetQ = row.startOffsetQ + offsetQ;
            row.cells.forEach(cell => {
                cell.startOffsetQ = cell.startOffsetQ + offsetQ;
                cell.notes.forEach(note => {
                    note.startOffsetQ = note.startOffsetQ + offsetQ;
                })
            })

        }
    }

    getRowAndCellIndexes(id: number): CellCoord | null {
        if (!id || !this.rows) {
            return null;
        }

        const rows = this.rows;

        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[i].cells.length; j++) {
                if (rows[i].cells[j].id === id) {
                    const offset = rows[i].cells[j].startOffsetQ - rows[i].startOffsetQ;

                    return {
                        row: i,
                        ind: j,
                        col: Math.ceil(offset / rows[i].cellSizeQ)
                    };
                }
            }
        }

        return null;
    }

    getItemById(id: number): Cell | null {
        if (!id) {
            return null;
        }

        for (let row of this.rows) {
            for (let item of row.cells) {
                if (item.id === id) {
                    return item;
                }
            }
        }

        return null;
    }

    static GetLineModelFromRecord(bpm: number, startTimeMs, seq: KeyData[] ): Line[] {
        let qms = Math.round(60000/ bpm); // ms в четверти
        let rows: Line[] = [];

        // начало и номер четверти
        for (let i = 0; i<seq.length; i++) {
            const item = seq[i];
            const next = seq[i+1];
            let diffMs = item.down - startTimeMs;
            let quarterNio = Math.floor(diffMs/qms);
            item.quarterTime = startTimeMs + (qms * quarterNio);
            item.quarterNio = quarterNio;

            if (next && ((next.down - item.down) < 20) ) {
                next.down = item.down;
            }
        }

        const lastInd = seq.length - 1;
        const firstTime = seq[0].quarterTime;
        const lastTime = seq[lastInd].next;

        // количество четвертей
        const rowCount = Math.ceil((lastTime - firstTime)/qms);

        for (let ind = 0; ind < rowCount; ind++) {
            rows.push({
                durQ: 120,
                startOffsetQ: ind * 120,
                cellSizeQ: 10,
                cells: [],
                blockOffsetQ: 0,
                rowInPartId: '',
            })
        }

        //console.log('seq', seq);
        //console.log('lines', lines);

        const getLineByStartOffsetQ = (startOffsetQ: number): Line => {
            return rows.find(item => {
                return startOffsetQ >= item.startOffsetQ && startOffsetQ < (item.startOffsetQ + item.durQ);
            });
        }

        const getCellByStartOffsetQ = (startOffsetQ: number, row: Line): Cell => {
            return row.cells.find(item => startOffsetQ === item.startOffsetQ);
        }

        let cellId = 1;

        seq.forEach((item, i) => {
            let itemNew: NoteItem = {
                id: i + 1,
                bodyColor: '',
                headColor: '',
                note: '',
                durQ: 0,
                startOffsetQ: 0,
                char: item.char,
            }

            const startOffsetQ = Math.floor((item.down - firstTime) / qms * un.NUM_120 / 10) * 10;

            itemNew.startOffsetQ = startOffsetQ;
            itemNew.durQ = Math.floor(
                (item.up - item.down) / qms * un.NUM_120 / 10
            ) * 10 || 10;
            itemNew.headColor = item.color;
            itemNew.note = item.note;

            let row = getLineByStartOffsetQ(startOffsetQ);

            if (row) {
                //let cell = getCellByStartOffsetQ(startOffsetQ, row) as Cell;
                let cell: Cell;

                if (!cell) {
                    cell = {
                        id: cellId++,
                        startOffsetQ: itemNew.startOffsetQ,
                        notes: []
                    }

                    row.cells.push(cell);
                }

                cell.notes.push(itemNew);
            }
        });

        return rows;
    }

    getSortedNotes(rows: Line[]): NoteItem[] {
        rows = Array.isArray(rows) ? rows : this.rows;
        const notes: NoteItem[] = [];

        rows.forEach(row => {
           row.cells.forEach(cell => {
               cell.notes.forEach(note => {
                   note.startOffsetQ = cell.startOffsetQ;
                   notes.push(note);
               })
           });
        });

        this.sortByStartOffsetQ(notes);

        return notes;
    }


    sortByField(arr: any[], field: string) {
        arr.sort((first, second) => {
            if (first[field] < second[field]) {
                return -1;
            }

            if (first[field] > second[field]) {
                return 1;
            }

            return 0;
        });
    }

    sortByStartOffsetQ(arr: (Cell | NoteItem) []) {
        arr.sort((first, second) => {
            if (first.startOffsetQ < second.startOffsetQ) {
                return -1;
            }

            if (first.startOffsetQ > second.startOffsetQ) {
                return 1;
            }

            return 0;
        });
    }

    getNoteNames(arr: NoteItem[]): string[] {
        const result: {[key: string]: string} = {};

        arr.forEach(item => {
            result[item.note] = item.note;
        })

        return Object.values(result);
    }

    getDurationQByRows(rows?: Line[]) {
        rows = Array.isArray(rows) ? rows : this.rows;

        if (rows.length) {
            return rows[rows.length-1].startOffsetQ + rows[rows.length-1].durQ;
        }

        return 0;
    }

    getOffsetsByRow(row: Line): number[] {
        const result = []
        const map = {};

        row.cells.forEach(cell => {
            if (!map[cell.startOffsetQ]) {
                map[cell.startOffsetQ] = true;
                result.push(cell.startOffsetQ);
            }
        });

        return result;
    }

    getNotesListByOffset(row: Line, startOffsetQ: number): NoteItem[] {
        const result: NoteItem[] = []

        row.cells.forEach(cell => {
            if (cell.startOffsetQ !== startOffsetQ) {
                return
            }

            cell.notes.forEach(note => result.push(note));
        });

        return result;
    }

    getNotesByOffset(offsetQ: number): NoteItem[] {
        const result: NoteItem[] = []

        const row = this.getRowByOffset(offsetQ);

        if (!row) return result

        row.cells.forEach(cell => {
            if ((cell.startOffsetQ + row.blockOffsetQ) !== offsetQ) {
                return;
            }

            cell.notes.forEach(note => result.push(note));
        });

        return result;
    }

    getCellsByOffset(offsetQ: number): {
        row: Line,
        cells: Cell[]
    } {
        const result = {
            row: null as Line,
            cells: [],
        }

        const row = this.getRowByOffset(offsetQ);

        if (!row) return result;

        result.row = row;

        row.cells.forEach(cell => {
            if ((cell.startOffsetQ + row.blockOffsetQ) !== offsetQ) {
                return;
            }

            result.cells.push(cell);
        })

        return result;
    }

    getNotesHashByOffset(row: Line, startOffsetQ: number): {[key: string]: string} {
        const result: {[key: string]: string} = {};

        row.cells.forEach(cell => {
            if (cell.startOffsetQ !== startOffsetQ) {
                return
            }

            cell.notes.forEach(note => {
                result[note.note] = note.note;
            });
        });

        return result;
    }

    recalcAndClearBlockOffset(rows: Line[]): Line[] {
        rows.forEach(row => {
            row.startOffsetQ = row.startOffsetQ + row.blockOffsetQ;
            row.cells.forEach(cell => {
                cell.startOffsetQ = cell.startOffsetQ + row.blockOffsetQ;
            });
            row.blockOffsetQ = 0;
        });

        return rows;
    }

    // getNoteNames(arr: NoteItem[]): string[] {
    //     let durationQ = 0;
    //
    //     return Object.values(result);
    // }

    getDrumNotes(name?: string, rows?: Line[]): string {
        name = name || 'no_name';
        rows = this.cloneRows(rows);
        rows = this.recalcAndClearBlockOffset(rows);

        const totalDurQ = this.getDurationQByRows(rows);
        const notes = this.getSortedNotes(rows);
        const noteNames = this.getNoteNames(notes);
        const map: {[key: string]: string[]} = {};

        if (!totalDurQ || !notes.length || !noteNames.length) {
            return '';
        }

        const cellCount = totalDurQ / 10;
        const quarterCount = Math.floor(cellCount / 12);

        const emptyLine = new Array(cellCount).fill(' ');
        const headerLine = [...emptyLine];

        for (let i = 0; i < quarterCount; i++) {
            headerLine[i*12] = '|';
        }

        noteNames.forEach(note => {
            map[note] = [...emptyLine];
        })

        notes.forEach(note => {
            const i = note.startOffsetQ / 10;

            map[note.note][i] = 'x';
        });

        let result = `<${name} @>` + '\n';

        let noteNameLen = noteNames.reduce((acc, val) => {
            if (val.length > acc) return val.length;

            return acc;
        }, 0);

        result += '-' + new Array(noteNameLen).fill(' ').join('') + ': ' + headerLine.join('') + ':' + '\n';

        Object.keys(map).forEach(key => {
            const emptyStr = new Array(noteNameLen - key.length).fill(' ').join('');

            result += '@' + key + emptyStr + ': ' + map[key].join('') + ':' + '\n';
        });

        // <tick @>
        // -             : 1   2   3   :
        // @cowbell      : 1           :
        // @nil          :     2   3   :

        return result;
    }

    cloneRows(rows?: Line[]): Line[] {
        rows = Array.isArray(rows) ? rows : this.rows;

        return rows.map(row => {
            row = {...row};

            row.cells = row.cells.map(cell => {
                cell = {...cell};

                cell.notes = cell.notes.map(note => {
                    return {...note};
                });

                return cell;
            });

            return row;
        });
    }

    getLinesByMask(pMask: string | number): Line[] {
        const rows: Line[] = [];
        let startOffsetQ = 0;

        if (un.parseInteger(pMask, 0)) {
            const durQ = un.parseInteger(pMask);
            const fullLineCount = Math.floor(durQ / un.NUM_120);
            const endLineDurQ = durQ % un.NUM_120;

            for (let i = 0; i < fullLineCount; i++) {
                rows.push({
                    durQ: 120,
                    cells: [],
                    startOffsetQ,
                    cellSizeQ: 10,
                    blockOffsetQ: 0,
                    rowInPartId: '',
                });
                startOffsetQ = startOffsetQ + 120;
            }

            if (endLineDurQ) {
                rows.push({
                    durQ: endLineDurQ,
                    cells: [],
                    startOffsetQ,
                    cellSizeQ: 10,
                    blockOffsetQ: 0,
                    rowInPartId: '',
                });
            }

            return rows;
        }

        pMask = ('' + pMask).trim();
        // let arr = val.trim().split('\n');
        // arr = arr.filter(item => !!item)
        //     .map(item => item.trim())
        //     .filter(item => item && !item.startsWith('#') && item.includes('['));

        let topArr = pMask.split('_');
        topArr.forEach(row => {
            const arr = row.split('*');
            const durQ = un.parseInteger(arr[arr.length-1], 0);
            let blockCount = 1;
            let rowInBlock = 1;

            if (arr.length === 3 ) {
                blockCount = un.parseInteger(arr[0], 0);
                rowInBlock = un.parseInteger(arr[1], 0);
            }
            else if (arr.length === 2) {
                rowInBlock = un.parseInteger(arr[0], 0);
            }

            for (let i = 0; i < blockCount; i++) {
                for (let j = 0; j < rowInBlock; j++) {
                    rows.push({
                        durQ: durQ,
                        cells: [],
                        startOffsetQ,
                        cellSizeQ: 10,
                        endLine: j === rowInBlock -1,
                        blockOffsetQ: 0,
                        rowInPartId: '',
                    });

                    startOffsetQ = startOffsetQ + durQ;
                }
            }

        });

        return rows;
    }

    fillLinesStructure(mask: string | number) {
        this.rows = this.getLinesByMask(mask);
    }
}
