import { EventEmitter } from '../../libs/common/event-emitter';
import { Muse as m, TTextBlock, TDataByTracks, TFileSettings } from '../../libs/muse';
import { drumBoards, KeyboardType, toneBoards } from '../keyboard-ctrl';
import { DEFAULT_OUT_VOLUME, SongStore, TrackInfo } from '../song-store';
import { Deferred } from '../../libs/common';

const multiPlayer = new m.player.MultiPlayer();
const metronome = new m.player.MultiPlayer();
const ticker = new m.ticker.Ticker(m.Sound.ctx);

const synthesizer = new m.synth.Synthesizer();
synthesizer.connect({ ctx: m.Sound.ctx });
synthesizer.setSettings(m.toneAndDrumPlayerSettings);

export type EditedItem = {
    rowInPartId: string, // partNio-rowNio
    songName: string,
    duration: number,
    partId: string,
    partNio: number, // номер части
    rowNio: number,  // номер строки внутри части
}

export const defaultTracks: TrackInfo[] = [
    {
        name: m.drumsTrack,
        board: drumBoards.drums,
        volume: 50
    },
    {
        name: '$bass',
        board: toneBoards.bassGuitar,
        volume: 50
    },
    {
        name: '$guitar',
        board: toneBoards.guitar,
        volume: 50
    },
    {
        name: '$harmonica',
        board: toneBoards.bassSolo34,
        volume: 50
    },
];


export type TSongInfo = {id: string, label: string, dir: string, ns:string};

type SongList = {
    [key: string]: {
        dir: string,
        ns:string,
        items: TSongInfo[]
    }};

const isDev = /localhost/.test(window.location.href);

class IdeService extends  EventEmitter {
    private _lastTrackName: string = '';
    private _lastBoardView: KeyboardType = '' as any;
    private songList: SongList;

    songStore: SongStore;
    dataByTracks = {} as TDataByTracks;

    blocks: TTextBlock[] = [];
    settings: TFileSettings = m.getFileSettings([]);
    pitchShift = 0;

    multiPlayer = multiPlayer;
    metronome = metronome;
    synthesizer = synthesizer;
    ticker = ticker;
    boards: any = {};
    bpmValue = 90;

    get outVolume (): number {
        return m.utils.parseInteger(this.dataByTracks?.total?.volume, DEFAULT_OUT_VOLUME);
    }

    get lastBoardView(): KeyboardType {
        if (!this._lastBoardView) {
            this._lastBoardView = (localStorage.getItem('lastBoardView') || 'drums') as any;
        }

        return this._lastBoardView;
    }

    get lastTrackName(): string {
        if (!this._lastTrackName) {
            this._lastTrackName = localStorage.getItem('lastTrackName') || '';
        }

        return this._lastTrackName;
    }

    set lastBoardView(view: string) {
        this._lastBoardView = (view || 'drums') as any;
        localStorage.setItem('lastBoardView', this._lastBoardView);
    }

    set lastTrackName(trackName: string) {
        this._lastTrackName = trackName || '';
        localStorage.setItem('lastTrackName', this._lastTrackName);
    }

    editedItems: EditedItem[] = [];

    private _guid = 1;
    useToneInstrument: number = m.DEFAULT_TONE_INSTR;
    currentEdit: {
        songId: string,
        blocks: TTextBlock[],
        allSongParts: string[],
        editPartsNio?: number[],
        freezeStructure: boolean,
        settings: TFileSettings,
        ns: string,
    } = { } as any;

    get guid(): number {
        return this._guid++;
    }

    reset() {
        // jjkl: todo
    }

    getDataByTracks(tracks: TrackInfo[], totalVolume?: number): TDataByTracks {
        let dataByTracks = {} as TDataByTracks;

        if (tracks) {
            tracks.forEach(track => {
                const volume = track.isExcluded ? 0: track.volume;
                const items = track.items || [];

                dataByTracks[track.name] = {
                    volume: volume,
                    isExcluded: track.isExcluded,
                    items: items.reduce((acc, item) => {
                        acc[item.name] = {
                            volume: item.volume
                        }

                        return acc;
                    }, {})
                };
            });
        }

        dataByTracks.total = {
            volume: m.utils.isPresent(totalVolume) ? totalVolume : DEFAULT_OUT_VOLUME
        }

        return dataByTracks;
    }

    setDataByTracks(x?: {tracks: TrackInfo[], volume?: number }) {
        const song = x || this.songStore.data;

        const dataByTracks = this.getDataByTracks(song.tracks, song.volume);

        Object.keys(this.dataByTracks).forEach(key => {
           delete this.dataByTracks[key];
        });

        Object.keys(dataByTracks).forEach(key => {
            this.dataByTracks[key] = dataByTracks[key];
        });
    }

    async loadSongList(force?: boolean): Promise<SongList> {
        if (!force) {
            if (this.songList) return Promise.resolve(this.songList);
        }

        const dfr = new Deferred();
        let data: SongList = {};

        try {
            const url = isDev ? '/' + 'song_list.json' : `/assets/song_list.json`;
            const res = await fetch(url); //  // motes/bandit/bell.notes.json

            if (res.ok) {
                data = await res.json(); // res.json(); res.blob();
            } else {
                throw new Error(`${res.status} ${res.statusText}`);
            }
        }
        catch (error){
            console.log('load song_list.json', error);
        }

        Object.keys(data).forEach(key => {
            const item = data[key];
            data[key].items.forEach(song => {
                song.dir = item.dir;
                song.ns = item.ns;
            })
        });

        this.songList = data;

        dfr.resolve(data);

        return dfr.promise;
    }

    async findSong(id: string): Promise<TSongInfo> {
        const dfr = new Deferred();
        await this.loadSongList();
        const songs = Object.values(this.songList).reduce((acc, group) => [...acc, ...group.items], <TSongInfo[]>[]);
        dfr.resolve(songs.find(song => song.id === id));

        return dfr.promise;
    }
}

export const ideService = new IdeService();

export const ideEvents = {
    openFile: 'openFile'
}
