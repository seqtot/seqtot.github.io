import { EventEmitter } from '../../libs/common/event-emitter';
import { Muse as m, Synthesizer, TextBlock, DataByTracks, FileSettings } from '../../libs/muse';
import { drumBoards, KeyboardType, toneBoards } from '../keyboard-ctrl';
import { DEFAULT_OUT_VOLUME, SongNode, SongStore, TrackInfo } from '../song-store';

const multiPlayer = new m.MultiPlayer();
const metronome = new m.MultiPlayer();
const ticker = new m.Ticker(m.Sound.ctx);

const synthesizer = new Synthesizer();
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

class IdeService extends  EventEmitter {
    private _lastTrackName: string = '';
    private _lastBoardView: KeyboardType = '' as any;

    songStore: SongStore;
    dataByTracks = {} as DataByTracks;

    blocks: TextBlock[] = [];
    settings: FileSettings = m.getFileSettings([]);
    pitchShift = 0;

    multiPlayer = multiPlayer;
    metronome = metronome;
    synthesizer = synthesizer;
    ticker = ticker;
    boards: any = {};
    bpmValue = 90;

    get outVolume (): number {
        return m.parseInteger(this.dataByTracks?.total?.volume, DEFAULT_OUT_VOLUME);
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
        blocks: TextBlock[],
        allSongParts: string[],
        editPartsNio?: number[],
        freezeStructure: boolean,
        source?: 'my' | 'band' | null | undefined,
        settings: FileSettings,
        ns: string,
        useLineModel: boolean,
    } = { } as any;

    get guid(): number {
        return this._guid++;
    }

    reset() {
        // jjkl: todo
    }

    getDataByTracks(tracks: TrackInfo[], totalVolume?: number): DataByTracks {
        let dataByTracks = {} as DataByTracks;

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
            volume: m.isPresent(totalVolume) ? totalVolume : DEFAULT_OUT_VOLUME
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
}

export const ideService = new IdeService();

export const ideEvents = {
    openFile: 'openFile'
}
