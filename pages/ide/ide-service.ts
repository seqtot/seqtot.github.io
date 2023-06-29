import {EventEmitter} from '../../libs/common/event-emitter';
import {DEFAULT_TONE_INSTR} from '../../libs/muse/keyboards';
import {TextBlock} from '../../libs/muse/utils';

const openedFiles: {[key: string]: string} = {

}

class IdeService extends  EventEmitter {
    useToneInstrument: number = DEFAULT_TONE_INSTR;
    currentEdit: {
        blocks: TextBlock[],
        outBlock: TextBlock,
        outList: string[],
        editIndex: number,
        name: string
    } = { } as any;
}

const instance = new IdeService();

export default instance;

export const ideEvents = {
    openFile: 'openFile'
}
