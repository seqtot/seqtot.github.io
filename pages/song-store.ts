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


export class SongStore {
    static getSongs(): {id: string, name: string}[] {
        if (!localStorage.getItem(`my-songs`)) {
            this.setSongs([]);
        }

        return JSON.parse(localStorage.getItem(`my-songs`));
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

    static setSongs(songs: {id: string, name: string}[]) {
        localStorage.setItem(`my-songs`, JSON.stringify(songs));
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
            const guid = un.guid(2);

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
