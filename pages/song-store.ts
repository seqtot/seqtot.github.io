import * as un from '../libs/muse/utils/utils-note';
import {Line} from './line-model';

export type StoredRow = {
    partId?: string,
    rowNio?: number,
    rowInPartId: string,
    type: string,
    status: string,
    lines: Line[],
    isHead?: boolean,
}

export type SongPage = {
    content: string,
    break: string,
    drums: string,
    tracks: { key: string; value: string; name: string }[],
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

export type StoredSongNode = {
    [key: string]: {
        items: StoredItem[]
    }
};

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

    static reindexPartRows(song: SongPage) {
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

    static getSong(id: string, create = false): SongPage {
        function normalize(song: SongPage) {
            if (!song) return song;

            song.parts = Array.isArray(song.parts) ? song.parts : [];
            song.dynamic = Array.isArray(song.dynamic) ? song.dynamic : [];

            return song;
        }

        let song: SongPage = normalize(JSON.parse(localStorage.getItem(`[my-song]${id}`)));

        if (song || !create) {
            return song;
        }

        SongStore.setSong(id, SongStore.getEmptySong());

        return normalize(JSON.parse(localStorage.getItem(`[my-song]${id}`)));
    }

    static setSong(id: string, data: SongPage) {
        localStorage.setItem(`[my-song]${id}`, JSON.stringify(data));
    }

    static getEmptySong(): SongPage {
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
}
