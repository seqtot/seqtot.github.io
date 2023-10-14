import {EventEmitter} from '../../libs/common/event-emitter';
import {DEFAULT_TONE_INSTR, defaultSynthSettings, toneAndDrumPlayerSettings} from '../../libs/muse/keyboards';
import {TextBlock} from '../../libs/muse/utils';
import {Sound} from '../../libs/muse/sound';
import {MultiPlayer} from '../../libs/muse/multi-player';
import {Synthesizer} from '../../libs/muse/synthesizer';
import {Ticker} from '../../libs/muse/ticker';
import {FileSettings, getFileSettings} from '../../libs/muse/utils/getFileSettings';
import * as un from '../../libs/muse/utils';
import {drumBoards, KeyboardType, toneBoards} from '../keyboard-ctrl';
import {SongStore, TrackInfo} from '../song-store';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();

const synthesizer = new Synthesizer();
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(toneAndDrumPlayerSettings); // defaultSynthSettings

const ticker = new Ticker(Sound.ctx);

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
        name: '@drums',
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
    blocks: un.TextBlock[] = [];
    settings: FileSettings = getFileSettings([]);
    pitchShift = 0;

    multiPlayer = multiPlayer;
    metronome = metronome;
    synthesizer = synthesizer;
    ticker = ticker;
    boards: any = {};
    bpmValue = 90;

    outVolume = 70;

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
    useToneInstrument: number = DEFAULT_TONE_INSTR;
    currentEdit: {
        songId: string,
        blocks: TextBlock[],
        //bpmValue: number,
        allSongParts: string[],
        editPartsNio?: number[],
        dataByTracks: {[key: string]: string},
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
}

export const ideService = new IdeService();

export const ideEvents = {
    openFile: 'openFile'
}
