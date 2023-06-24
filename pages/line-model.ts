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
    colorHead?: string;
    colorBody?: string;
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
    cellSizeQ: number,
    cells: Cell[],
}

export class LineModel {
    rows: Line[] = [];

    findRowByOffset(startOffsetQ: number): number {
        return this.rows.findIndex(row => startOffsetQ >= row.startOffsetQ && startOffsetQ < (row.startOffsetQ + row.durQ));
    }


    moveItem(id: number, value: number): {row: number, childInd: number  } | null {
        const ind = this.getRowAndCellIndexes(id);
        if (!ind) {
            return null;
        }

        const rows = this.rows;
        const row = rows[ind.row];
        const cell = rows[ind.row].cells[ind.childInd];

        let newStartOffsetQ = cell.startOffsetQ + value;

        if (newStartOffsetQ >= row.startOffsetQ && newStartOffsetQ < (row.startOffsetQ + row.durQ)) {
            cell.startOffsetQ = newStartOffsetQ;

            return this.getRowAndCellIndexes(id);
        } else {
            const ind = this.findRowByOffset(newStartOffsetQ);

            if (ind > -1) {
                cell.startOffsetQ = newStartOffsetQ;
                row.cells = row.cells.filter(item => item != cell);
                this.rows[ind].cells.push(cell);

                return this.getRowAndCellIndexes(id);
            }
        }

        return null;
    }

    setData(rows: Line[]) {
        this.rows = rows;
    }

    getRowAndCellIndexes(id: number): {row: number, childInd: number} | null {
        if (!id || !this.rows) {
            return null;
        }

        const rows = this.rows;

        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < rows[i].cells.length; j++) {
                if (rows[i].cells[j].id === id) {
                    return {
                        row: i,
                        childInd: j,
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
                colorBody: '',
                colorHead: '',
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
            itemNew.colorHead = item.color;
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

    getSortedNotes(): NoteItem[] {
        const notes: NoteItem[] = [];

        this.rows.forEach(row => {
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

    getDurationQByRows() {
        if (this.rows.length) {
            return this.rows[this.rows.length-1].startOffsetQ + this.rows[this.rows.length-1].durQ;
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

    // getNoteNames(arr: NoteItem[]): string[] {
    //     let durationQ = 0;
    //
    //     return Object.values(result);
    // }

    getDrumNotes(name?: string): string {
        name = name || 'no_name';

        const totalDurQ = this.getDurationQByRows();
        const notes = this.getSortedNotes();
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
}
