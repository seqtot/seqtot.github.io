import {EventEmitter} from '../../libs/common/event-emitter';

const openedFiles: {[key: string]: string} = {

}


class IdeService extends  EventEmitter {



}

const instance = new IdeService();

export default instance;

export const ideEvents = {
    openFile: 'openFile'
}
