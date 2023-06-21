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
    color?: string;
};

export type NoteItem = {
    id: number;
    durQ: number;
    note: string;
    colorHead?: string;
    colorBody?: string;
    startOffsetQ: number;
};

export type Line = {
    //nio: number,
    durQ: number,
    startOffsetQ: number,
    notes: NoteItem[],
    cellSizeQ: number,
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
        const note = rows[ind.row].notes[ind.childInd];

        let newStartOffsetQ = note.startOffsetQ + value;

        if (newStartOffsetQ >= row.startOffsetQ && newStartOffsetQ < (row.startOffsetQ + row.durQ)) {
            note.startOffsetQ = newStartOffsetQ;

            return this.getRowAndCellIndexes(id);
        } else {
            const ind = this.findRowByOffset(newStartOffsetQ);

            if (ind > -1) {
                note.startOffsetQ = newStartOffsetQ;
                row.notes = row.notes.filter(item => item != note);
                this.rows[ind].notes.push(note);

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
            for (let j = 0; j < rows[i].notes.length; j++) {
                if (rows[i].notes[j].id === id) {
                    return {
                        row: i,
                        childInd: j,
                    };
                }
            }
        }

        return null;
    }

    getItemById(id: number): NoteItem | null {
        if (!id) {
            return null;
        }

        for (let row of this.rows) {
            for (let item of row.notes) {
                if (item.id === id) {
                    return item;
                }
            }
        }

        return null;
    }

    static GetLineModelFromRecord(bpm: number, startTimeMs, seq: KeyData[] ): Line[] {
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
                //nio:  ind,
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
            let itemNew: NoteItem = {
                id: i + 1,
                colorBody: '',
                colorHead: '',
                note: '',
                durQ: 0,
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
}
