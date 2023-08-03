import {EventEmitter} from '../../libs/common/event-emitter';
import {DEFAULT_TONE_INSTR, defaultSynthSettings, toneAndDrumPlayerSettings} from '../../libs/muse/keyboards';
import {TextBlock} from '../../libs/muse/utils';
import {Sound} from '../../libs/muse/sound';
import {MultiPlayer} from '../../libs/muse/multi-player';
import {Synthesizer} from '../../libs/muse/synthesizer';
import {Ticker} from '../../libs/muse/ticker';

const multiPlayer = new MultiPlayer();
const metronome = new MultiPlayer();
const synthesizer = new Synthesizer();
synthesizer.connect({ ctx: Sound.ctx });
synthesizer.setSettings(toneAndDrumPlayerSettings); // defaultSynthSettings
const ticker = new Ticker(Sound.ctx);

class IdeService extends  EventEmitter {
    multiPlayer = multiPlayer;
    metronome = metronome;
    synthesizer = synthesizer;
    ticker = ticker;

    private _guid = 1;
    useToneInstrument: number = DEFAULT_TONE_INSTR;
    currentEdit: {
        songId: string,
        blocks: TextBlock[],
        bpmValue: number,
        allSongParts: string[],
        editPartsNio?: number[],
        metaByLines: {[key: string]: string},
        freezeStructure: boolean,
        source?: 'my' | 'band' | null | undefined,
    } = { } as any;

    get guid(): number {
        return this._guid++;
    }
}

const instance = new IdeService();

export default instance;

export const ideEvents = {
    openFile: 'openFile'
}
