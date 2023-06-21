import {EventEmitter} from '../../libs/common/event-emitter';
import {DEFAULT_TONE_INSTR} from '../../libs/muse/keyboards';

const openedFiles: {[key: string]: string} = {

}

class IdeService extends  EventEmitter {
    useToneInstrument: number = DEFAULT_TONE_INSTR;
}

const instance = new IdeService();

export default instance;

export const ideEvents = {
    openFile: 'openFile'
}
