import * as un from '../libs/muse/utils/utils-note';
import {Line, LineNote} from './line-model';
import { drumCodes } from '../libs/muse/drums';
import {guitarCodes, bassGuitarCodes} from '../libs/muse/instruments';

export type StoredRow = {
    partId?: string,
    rowNio?: number, // jjkl
    rowInPartId: string,
    type: string,
    track: string,
    status: string,
    lines: Line[],
}

export type TrackInfo = {
    name: string,
    board: string,
    volume: number,
    label?: string,
}

export type SongNode = {
    content: string,
    break: string,
    drums: string,
    tracks: TrackInfo[],
    hideMetronome?: boolean,
    score: string,
    parts: {name: string, id: string}[],
    dynamic: StoredRow[],
    source: 'my' | 'band',
    isSongList?: boolean,
};

export type StoredItem = {
    rowInPartId: string,
    type: string,
    status: string,
    rows: Line[],
    lines: Line[]
}

export type StoredSongNodeOld = {
    [key: string]: {
        items: StoredItem[]
    }
};

function isDrumNote(val: string): boolean {
    return !!drumCodes[val];
}

function isBassGuitarInst(val: string | number): boolean {
    return !!bassGuitarCodes[val];
}

function isGuitarInst(val: string | number): boolean {
    return !!guitarCodes[val];
}

function asOrganInst(note: LineNote): boolean {
    return !isGuitarInst(note.instCode) && !isBassGuitarInst(note.instCode) && !isDrumNote(note.note);
}

export class SongStore {
    static deletePart(songId: string, partId = '') {
        const song = SongStore.getSong(songId);
        partId = (partId || '').trim();

        if (!song || !partId) return;

        song.parts = song.parts.filter(part => part.id !== partId);
        song.dynamic = song.dynamic.filter(item => item.partId !== partId)

        SongStore.setSong(songId, song);
    }

    static moveSong(songId: string, offset: number) {
        let songs = SongStore.getSongs();
        let songInd = songs.findIndex(song => song.id === songId);

        if (
            songs.length < 2 ||
            songInd < 0 ||
            (songInd + offset) < 0 || ((songInd + offset) > (songs.length - 1))
        ) {
            return;
        }

        let song = songs[songInd];
        songs = songs.filter(song => song.id !== songId);

        let top = songs.slice(0, songInd + offset);
        let bot = songs.slice(songInd + offset);

        songs = [...top, song, ...bot];

        //console.log(top, bot);

        SongStore.setSongs(songs);
    }

    static movePart(songId: string, partId: string, offset: number): boolean {
        let song = SongStore.getSong(songId);

        if (!song) return false;

        let parts = song.parts;

        let partInd = parts.findIndex(part => part.id === partId);

        if (
            parts.length < 2 ||
            partInd < 0 ||
            (partInd + offset) < 0 || ((partInd + offset) > (parts.length - 1))
        ) {
            return false;
        }

        let part = parts[partInd];

        parts = parts.filter(part => part.id !== partId);

        let top = parts.slice(0, partInd + offset);
        let bot = parts.slice(partInd + offset);

        parts = [...top, part, ...bot];

        song.parts = parts;

        SongStore.reindexPartRows(song);
        SongStore.setSong(songId, song);

        return true;
    }

    static reindexPartRows(song: SongNode) {
        song.parts.forEach((part, i) => {
            const partNio = i + 1;
            const rows = song.dynamic.filter(item => item.partId === part.id);

            rows.forEach(row => {
                const rowNio = row.rowNio || un.getPartInfo(row.rowInPartId).rowNio;

                row.rowInPartId = `${partNio}-${rowNio}`;

                row.lines.forEach(line => {
                    const rowNio = un.getPartInfo(line.rowInPartId).rowNio;

                   line.rowInPartId = `${partNio}-${rowNio}`;
                });
            })
        });
    }

    static renameSong(songId: string, songName: string) {
        const songs = SongStore.getSongs();

        songs.forEach(song => {
           if (song.id === songId) {
               song.name = songName;
           }
        });

        SongStore.setSongs(songs);
    }

    static renamePart(songId: string, partId: string, partName: string) {
        const song = SongStore.getSong(songId);

        if (!song) return;

        song.parts.forEach(part => {
            if (part.id === partId) {
                part.name = partName;
            }
        });

        SongStore.setSong(songId, song);
    }

    static renameTrack(songId: string, oldTrackName: string, newTrackName: string) {
        const song = SongStore.getSong(songId);

        if (!song) return;

        song.tracks.forEach(item => {
            if (item.name === oldTrackName) {
                item.name = newTrackName;
            }
        });

        song.dynamic.forEach(item => {
           if (item.track === oldTrackName) {
               item.track = newTrackName;
           }
        });

        SongStore.setSong(songId, song);
    }

    static deleteSong(songId: string) {
        let songs = SongStore.getSongs();
        songs = songs.filter(song => song.id !== songId);

        SongStore.setSongs(songs);

        localStorage.removeItem(`[my-song]${songId}`);
    }

    static getSongs(): {id: string, name: string}[] {
        if (!localStorage.getItem(`my-songs`)) {
            this.setSongs([]);
        }

        return JSON.parse(localStorage.getItem(`my-songs`));
    }

    static setSongs(songs: {id: string, name: string}[]) {
        localStorage.setItem(`my-songs`, JSON.stringify(songs));
    }

    static getSong(id: string, create = false): SongNode {
        function normalize(song: SongNode) {
            if (!song) return song;

            song.parts = Array.isArray(song.parts) ? song.parts : [];
            song.dynamic = Array.isArray(song.dynamic) ? song.dynamic : [];
            song.tracks = Array.isArray(song.tracks) ? song.tracks : [];

            // костыль
            song.dynamic.forEach(item => {
                if (!item.track && item.type === 'drums') {
                    item.track = '@drums';
                }
            });

            if (!song.tracks.length) {
                song.tracks = [
                    {
                        name: '@drums',
                        board: 'drums',
                        volume: 50,
                    },
                    {
                        name: '$bass',
                        board: 'bassGuitar',
                        volume: 30,
                    },
                    {
                        name: '$guitar',
                        board: 'guitar',
                        volume: 50,
                    },
                    {
                        name: '$organ',
                        board: 'bassSolo34',
                        volume: 50,
                    },
                ]
            }

            return song;
        }

        let song: SongNode = normalize(JSON.parse(localStorage.getItem(`[my-song]${id}`)));

        if (song || !create) {
            return song;
        }

        SongStore.setSong(id, SongStore.getEmptySong());

        return normalize(JSON.parse(localStorage.getItem(`[my-song]${id}`)));
    }

    static setSong(id: string, data: SongNode) {
        localStorage.setItem(`[my-song]${id}`, JSON.stringify(data));
    }

    static getEmptySong(): SongNode {
        return {
            content: '',
            break: '',
            drums: '',
            tracks: [],
            hideMetronome: false,
            parts: [],
            score: `
            <settings>
            $bass: v30; $organ: v50; $guit: v50;
            <out b100>
            `.trim(),
            dynamic: [],
            source: 'my'
        };
    }

    static clonePart(songId: string, sourceId: string): {name: string, id: string} {
        let song = SongStore.getSong(songId);

        if (!song) return;

        const sourcePart = song.parts.filter(item => item.id === sourceId)[0];

        if (!sourcePart) return;

        const name = sourcePart.name.trim();

        if (!name) return;

        let id = '';
        while (!id) {
            const guid = un.guid(2);

            let parts = song.parts.filter(item => item.id === guid);

            if (!parts.length) {
                id = guid;
            }
        }

        const part = {name, id};

        song.parts.push(part);

        const partNio = song.parts.length;

        let items = song.dynamic.filter(item => item.partId === sourceId);

        items.forEach(item => {
            const rowNio = un.getRowNio(item.rowInPartId);
            const rowInPartId = `${partNio}-${rowNio}`;

            item = JSON.parse(JSON.stringify(item));
            item.partId = id;
            item.rowInPartId = rowInPartId;
            item.lines.forEach(line => {
                line.rowInPartId = rowInPartId;
            });
            song.dynamic.push(item);
        });

        SongStore.setSong(songId, song);

        return part;
    }

    static deleteTrack(songId: string, name: string): boolean {
        const song = SongStore.getSong(songId);

        if (!song) return false;

        const track = song.tracks.find(item => item.name === name);

        if (!track) return false;

        song.tracks = song.tracks.filter(item => item.name !== name);
        song.dynamic = song.dynamic.filter(item => item.track !== name);

        this.setSong(songId, song);

        return true;
    }

    static addPart(songId: string, name: string): {name: string, id: string} {
        name = (name || '').trim();

        if (!name) return;

        let id = '';
        let song = SongStore.getSong(songId, true);
        song.parts = Array.isArray(song.parts) ? song.parts : [];

        while (!id) {
            const guid = un.guid(2);

            let parts = song.parts.filter(item => item.id === guid);

            if (!parts.length) {
                id = guid;
            }
        }

        const part = {name, id};
        song.parts.push(part);

        SongStore.setSong(songId, song);

        return part;
    }

    static addSong(name: string): {name: string, id: string} {
        name = (name || '').trim();

        if (!name) return;

        let id = '';
        let items = SongStore.getSongs();

        while (!id) {
            const guid = un.guid(3);

            let songs = items.filter(item => item.id === guid);

            if (!songs.length) {
                id = guid;
            }
        }

        const song = {name, id};
        items.push(song);

        SongStore.setSongs(items);

        return song;
    }

    static getRowsByPart(rows: StoredRow[], partId: string, partNio: number): StoredRow[] {
        const result = rows.reduce((acc, item) => {
            const iPartId = (item.partId || '').trim();
            const iPartNio = un.getPartNio(item.rowInPartId);
            const iRowNio = un.getRowNio(item.rowInPartId);

            if (partId && iPartId && partId !== iPartId) {
                return acc;
            }
            else if(partNio && iPartNio && partNio !== iPartNio) {
                return acc;
            }

            if (!iRowNio) {
                return acc;
            }

            acc.push(item);

            return acc;
        }, <StoredRow[]>[]);

        return result;
    }

    static delRowFromPart(
        songId: string,
        song: SongNode,
        partId: string,
        partNio: number,
        rowNio: number
    ): SongNode {
        song.dynamic = song.dynamic.filter(item  => {
            const iPartId = (item.partId || '').trim();
            const iPartNio = un.getPartNio(item.rowInPartId);
            const iRowNio = un.getRowNio(item.rowInPartId);

            if (partId && iPartId && partId !== iPartId) {
                return true;
            }
            else if(partNio && iPartNio && partNio !== iPartNio) {
                return true;
            }

            if (iRowNio !== rowNio) {
                return true;
            }

            return false;
        });

        SongStore.setSong(songId, song);

        return song;
    }

    static GetRowsByInstrument(rows: StoredRow[], check: (note: LineNote) => boolean): StoredRow[] {
        const result: StoredRow[] = [];

        rows.forEach(row => {
            let rowNoteCount = 0;

            row.lines.forEach(line => {
                line.cells = line.cells.filter(cell => {
                    let cellNoteCount = 0;

                    cell.notes = cell.notes.filter(note => {
                        const add = check(note) ? 1 : 0;
                        rowNoteCount = rowNoteCount + add;
                        cellNoteCount = cellNoteCount + add;

                        return !!add;
                    });

                    return !!cellNoteCount;
                });
            });

            if (rowNoteCount) {
                result.push(row);
            }
        });

        return result;
    }

    static Transform(val: string): SongNode {
        val = (val || '').trim();

        if (!val) return null;

        let songNode: SongNode;

        // DRUMS
        songNode = JSON.parse(val) as SongNode;
        const drumRows = SongStore.GetRowsByInstrument(songNode.dynamic, (note) => isDrumNote(note.note));
        drumRows.forEach(row => {
            row.track = '@drums';
            row.type = 'drums';
        });

        // BASS
        songNode = JSON.parse(val) as SongNode;
        const bassRows = SongStore.GetRowsByInstrument(songNode.dynamic, (note) => isBassGuitarInst(note.instCode));
        bassRows.forEach(row => {
            row.track = '$bass';
            row.type = 'bassGuitar';
        });

        // GUITAR
        songNode = JSON.parse(val) as SongNode;
        const guitarRows = SongStore.GetRowsByInstrument(songNode.dynamic, (note) => isGuitarInst(note.instCode));
        guitarRows.forEach(row => {
            row.track = '$guitar';
            row.type = 'guitar';
        });

        // ORGAN
        songNode = JSON.parse(val) as SongNode;
        const organRows = SongStore.GetRowsByInstrument(songNode.dynamic, (note) => asOrganInst(note));
        organRows.forEach(row => {
            row.track = '$organ';
            row.type = 'guitar';
        });

        songNode.dynamic = [...organRows, ...bassRows, ...guitarRows, ...drumRows];
        //songNode.dynamic = [...guitarRows];

        return songNode;
    }
}
