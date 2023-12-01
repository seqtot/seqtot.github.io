import { Muse as m, LineNote, Line, StoredRow } from '../libs/muse';

export type StoredSongNodeOld = {
    [key: string]: {
        items: {
            rowInPartId: string,
            type: string,
            status: string,
            rows: Line[],
            lines: Line[]
        }[]
    }
};

export type TrackInfo = {
    name: string,
    board: string,
    volume: number,
    items?: {name: string, volume: number}[], // громкость по инструментам трека

    label?: string,
    isHardTrack?: boolean,
    isExcluded?: boolean,
}

export type SongNode = {
    bmpValue: number,
    volume?: number,
    version: number,
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
    ns?: string,
    nsOld?: string,
    exportToLineModel?: boolean,
    pitchShift?: number,
    pitchShiftSrc?: number,
    songNodeHard?: any,
};

function isDrumNote(val: string): boolean {
    return !!m.drumCodes[val];
}

function isBassGuitarInst(val: string | number): boolean {
    return !!m.bassGuitarCodes[val];
}

function isGuitarInst(val: string | number): boolean {
    return !!m.guitarCodes[val];
}

function asOrganInst(note: LineNote): boolean {
    return !isGuitarInst(note.instCode) && !isBassGuitarInst(note.instCode) && !isDrumNote(note.note);
}

const DEFAULT_BPM_VALUE = 90;
export const DEFAULT_OUT_VOLUME = 70;

export const MY_SONG = 'my-song';
export const BAND_SONG = 'band-song';
export const SONG_LIST = 'song-list';

// durQ по умолчанию = 1; instName = @note
function transformV1(song: SongNode): SongNode {
    const version = 1;

    song.dynamic.forEach(item => {
        item.track = item.track || '';
        item.type  = item.type || '';

        if (item.type === 'drums' || item.track.startsWith('@')) {
            item.lines.forEach(line => {
                line.cells.forEach(cell => {
                    cell.notes.forEach(note => {
                        note.durQ = 1;
                        note.instName = `@${note.note}`;
                    });
                })
            });
        }
    });

    song.version = version;

    return song;
}

const versionTransformers: ((song: SongNode) => SongNode)[] = [
  transformV1
];

export class SongStore {
    constructor(
      public songId: string,
      public ns: string,
      public data: SongNode)
    {

    }

    save(data?: SongNode) {
        data = data || this.data;

        if (!data || !this.ns) return;

        SongStore.SetSong(this.songId, this.data, this.ns);
        this.data = data;
    }

    clone(data?: SongNode): SongNode {
        data = data || this.data;

        return JSON.parse(JSON.stringify(data));
    }

    static DeletePart(song: SongNode, partId): boolean {
        partId = (partId || '').trim();

        if (!song || !partId) return false;

        song.parts = song.parts.filter(part => part.id !== partId);
        song.dynamic = song.dynamic.filter(item => item.partId !== partId)

        return true;
    }

    static MoveSong(songId: string, offset: number, ns: string) {
        let songs = SongStore.GetSongs(ns);
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

        SongStore.SetSongs(songs, ns);
    }

    static MovePart(song: SongNode, partId: string, offset: number): boolean {
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

        SongStore.ReindexPartRows(song);

        return true;
    }

    static ReindexPartRows(song: SongNode) {
        song.parts.forEach((part, i) => {
            const partNio = i + 1;
            const rows = song.dynamic.filter(item => item.partId === part.id);

            rows.forEach(row => {
                const rowNio = row.rowNio || m.getPartInfo(row.rowInPartId).rowNio;

                row.rowInPartId = `${partNio}-${rowNio}`;

                row.lines.forEach(line => {
                    const rowNio = m.getPartInfo(line.rowInPartId).rowNio;

                   line.rowInPartId = `${partNio}-${rowNio}`;
                });
            })
        });
    }

    static RenameSong(songId: string, songName: string, ns: string) {
        const songs = SongStore.GetSongs(ns);

        songs.forEach(song => {
           if (song.id === songId) {
               song.name = songName;
           }
        });

        SongStore.SetSongs(songs, ns);
    }

    static RenamePart(song: SongNode, partId: string, partName: string) {
        if (!song) return;

        song.parts.forEach(part => {
            if (part.id === partId) {
                part.name = partName;
            }
        });
    }

    static RenameTrack(song: SongNode, oldTrackName: string, newTrackName: string): boolean {
        if (!song) return false;

        let wasUpdate = false;

        song.tracks.forEach(item => {
            if (item.name === oldTrackName) {
                wasUpdate = true;
                item.name = newTrackName;
            }
        });

        song.dynamic.forEach(item => {
           if (item.track === oldTrackName) {
               wasUpdate = true;
               item.track = newTrackName;
           }
        });

        return wasUpdate;
    }

    static DeleteSong(songId: string, ns: string) {
        let songs = SongStore.GetSongs(ns);
        songs = songs.filter(song => song.id !== songId);

        SongStore.SetSongs(songs, ns);

        localStorage.removeItem(`[${ns}]${songId}`);
    }

    static GetSongs(ns: string): {id: string, name: string}[] {
        if (ns === 'my-song') {
            if (localStorage.getItem(`my-songs`)) {
                localStorage.setItem(`[${SONG_LIST}]my-song`, localStorage.getItem(`my-songs`));
                localStorage.removeItem('my-songs');
            }
        }

        if (!localStorage.getItem(`[${SONG_LIST}]${ns}`)) {
            this.SetSongs([], ns);
        }

        return JSON.parse(localStorage.getItem(`[${SONG_LIST}]${ns}`));
    }

    static SetSongs(songs: {id: string, name: string}[], ns: string) {
        localStorage.setItem(`[song-list]${ns}`, JSON.stringify(songs));
    }

    static NormalizeSongNode(song: SongNode): SongNode {
        if (!song) return song;

        song.version = m.parseInteger(song.version, 0);
        song.parts = Array.isArray(song.parts) ? song.parts : [];
        song.dynamic = Array.isArray(song.dynamic) ? song.dynamic : [];
        song.tracks = Array.isArray(song.tracks) ? song.tracks : [];
        song.bmpValue = song.bmpValue ? song.bmpValue : DEFAULT_BPM_VALUE;

        // костыль ???
        song.dynamic.forEach(item => {
            if (!item.track && item.type === 'drums') {
                item.track = m.drumsTrack;
            }
        });

        if (!song.tracks.length) {
            song.tracks = [
                {
                    name: m.drumsTrack,
                    board: 'drums',
                    volume: 50,
                },
                {
                    name: '$bass',
                    board: 'bassGuitar',
                    volume: 30,
                },
                {
                    name: '$guit',
                    board: 'guitar',
                    volume: 50,
                },
                {
                    name: '$keys',
                    board: 'bassSolo34',
                    volume: 50,
                },
            ]
        }

        return song;
    }

    static TransformVersion(song: SongNode): SongNode {
        const version = m.parseInteger(song.version, 0);

        if (version === versionTransformers.length) {
            return song;
        }

        const transformers = versionTransformers.slice(version);

        transformers.forEach(transformer => {
            song = transformer(song);
        });

        return song;
    }

    static GetOldSong(id: string, ns: string, create = false): SongNode {
        let song: SongNode = SongStore.NormalizeSongNode(
            JSON.parse(localStorage.getItem(`[${ns}]${id}`))
        );

        // ПЕСНИ НЕТ и её не надо создавать
        if (!song && !create) return null;

        // НОВАЯ ПЕСНЯ
        if (!song) {
            song = SongStore.GetEmptySong();
            song.score = '';

            return song;
        }

        // ПЕСНЯ ЕСТЬ
        const version = m.parseInteger(song.version, 0);
        song = SongStore.TransformVersion(song);

        if (song.version !== version) {
            SongStore.SetSong(id, song, ns);
        }

        return song;
    }

    static GetSong(id: string, ns: string, create = false): SongNode {
        let song: SongNode = SongStore.NormalizeSongNode(
            JSON.parse(localStorage.getItem(`[${ns}]${id}`))
        );

        // ПЕСНИ НЕТ и её не надо создавать
        if(!song && !create) return null;

        // ПЕСНЯ ЕСТЬ
        if (song) {
            const version = m.parseInteger(song.version, 0);
            song = SongStore.TransformVersion(song);

            if (song.version !== version) {
                SongStore.SetSong(id, song, ns);
            }

            return song;
        }

        // НОВАЯ ПЕСНЯ
        song = SongStore.NormalizeSongNode(SongStore.GetEmptySong());
        SongStore.SetSong(id, song, ns);

        return song;
    }

    static SetSong(id: string, data: SongNode, ns: string) {
        if (!ns || !data || !id) return;

        localStorage.setItem(`[${ns}]${id}`, JSON.stringify(data));
    }

    static GetEmptySong(): SongNode {
        // <settings>
        // $bass: v30; $organ: v50; $guit: v50;

        return {
            bmpValue: DEFAULT_BPM_VALUE,
            volume: DEFAULT_OUT_VOLUME,
            content: '',
            break: '',
            drums: '',
            tracks: [],
            hideMetronome: false,
            parts: [],
            score: '',
            dynamic: [],
            source: 'my',
            version: versionTransformers.length
        };
    }

    static CloneAndAddTrack(song: SongNode, trackName: string): TrackInfo | null {
        if (!song) return null;

        let itemsByTrack = song.dynamic.filter(item => item.track === trackName);
        let track = song.tracks.find(item => item.name === trackName);

        if (!track) return null;

        let i = 0;

        while (true) {
            i++;

            if (song.tracks.find(item => item.name === `${trackName}${i}`)) {
                continue;
            }

            break;
        }

        trackName = `${trackName}${i}`;

        itemsByTrack = JSON.parse(JSON.stringify(itemsByTrack));
        track = JSON.parse(JSON.stringify(track));

        track.name = trackName;
        track.isHardTrack = false;
        song.tracks.push(track);

        itemsByTrack.forEach(item => {
            item.track = trackName;
            song.dynamic.push(item);
        });

        return track;
    }

    static ClonePart(song: SongNode, sourceId: string): {name: string, id: string} | null {
        if (!song) return;

        const sourcePart = song.parts.filter(item => item.id === sourceId)[0];

        if (!sourcePart) return null;

        const name = sourcePart.name.trim();

        if (!name) return null;

        let id = '';
        while (!id) {
            const guid = m.guid(2);

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
            const rowNio = m.getRowNio(item.rowInPartId);
            const rowInPartId = `${partNio}-${rowNio}`;

            item = JSON.parse(JSON.stringify(item));
            item.partId = id;
            item.rowInPartId = rowInPartId;
            item.lines.forEach(line => {
                line.rowInPartId = rowInPartId;
            });
            song.dynamic.push(item);
        });

        return part;
    }

    static DeleteTrack(song: SongNode, name: string): boolean {
        if (!song) return false;

        const track = song.tracks.find(item => item.name === name);

        if (!track) return false;

        song.tracks = song.tracks.filter(item => item.name !== name);
        song.dynamic = song.dynamic.filter(item => item.track !== name);

        return true;
    }

    static AddPartToSong(song: SongNode, name: string): {name: string, id: string} | null {
        name = (name || '').trim();

        if (!name) return null;

        let id = '';
        song.parts = Array.isArray(song.parts) ? song.parts : [];

        while (!id) {
            const guid = m.guid(2);

            let parts = song.parts.filter(item => item.id === guid);

            if (!parts.length) {
                id = guid;
            }
        }

        const part = {name, id};
        song.parts.push(part);

        return part;
    }

    static AddSongToList(name: string, ns: string): {name: string, id: string} {
        name = (name || '').trim();

        if (!name) return;

        let id = '';
        let items = SongStore.GetSongs(ns);

        while (!id) {
            const guid = m.guid(3);

            let songs = items.filter(item => item.id === guid);

            if (!songs.length) {
                id = guid;
            }
        }

        const song = {name, id};
        items.push(song);

        SongStore.SetSongs(items, ns);

        return song;
    }

    static GetRowsByPart(rows: StoredRow[], partId: string, partNio: number): StoredRow[] {
        const result = rows.reduce((acc, item) => {
            const iPartId = (item.partId || '').trim();
            const iPartNio = m.getPartNio(item.rowInPartId);
            const iRowNio = m.getRowNio(item.rowInPartId);

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

    static Delete_RowFromPart(
        song: SongNode,
        partId: string,
        partNio: number,
        rowNio: number,
    ): SongNode {
        song.dynamic = song.dynamic.filter(item  => {
            const iPartId = (item.partId || '').trim();
            const iPartNio = m.getPartNio(item.rowInPartId);
            const iRowNio = m.getRowNio(item.rowInPartId);

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
            row.track = m.drumsTrack;
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

    static GetTracksNodeBySong(song: SongNode): TrackInfo[] {
        if (!song) return [];

        const tracks = song.tracks || [];

        tracks.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return +1;

            return 0;
        });

        if (!tracks.find(item => item.name === 'total')) {
            tracks.unshift({
                name: 'total',
                volume: m.parseInteger(song.volume, DEFAULT_OUT_VOLUME),
                board: ''
            });
        }

        tracks.forEach(track => {
            const instSubitems = [];

            const items = song.dynamic.filter(iTrack => iTrack.track === track.name);

            items.forEach(item => {
                item.lines.forEach(line => {
                    line.cells.forEach(cell => {
                        cell.notes.forEach(note => {
                            if (!instSubitems.includes(note.instName)) {
                                instSubitems.push(note.instName);
                            }
                        })
                    })
                })
            });

            instSubitems.sort();

            const oldInstSubitems = track.items || [];
            track.items = instSubitems.map(name => ({name, volume: 50}));

            if (oldInstSubitems.length) {
                track.items.forEach(newSubitem => {
                    const oldSubitem = oldInstSubitems.find(oldSubitem => oldSubitem.name === newSubitem.name);
                    newSubitem.volume = m.isPresent(oldSubitem?.volume) ? oldSubitem.volume : newSubitem.volume;
                });
            }
        });

        return song.tracks;
    }
}
