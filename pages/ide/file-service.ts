import {Deferred} from '../../libs/muse/utils';

export type FileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FileInfo[],
}

class FileService {
    async readFile(path: string): Promise<string> {
        const dfr: Deferred = new Deferred<any>();
        const root = 'D:/motes'; // TODO: delete ???

        //const reader = new FileReader();
        fetch(`api/readFile?path=${path}&root=${root}`)
            .then( res => {
                return res.text();
                //return res.json();
                //return res.blob();
            } )
            .then( data => {
                dfr.resolve(data);
                //reader.readAsDataURL(blob);
                // https://learn.javascript.ru/blob
                // var file = window.URL.createObjectURL(blob);
                // window.location.assign(file);
            }).catch(err => {
                dfr.reject(err);
            });

        return dfr.promise;
    }

    async readdir(path: string): Promise<FileInfo[]> {
        const dfr: Deferred = new Deferred<any>();
        const root = 'D:/motes';

        //const reader = new FileReader();
        fetch(`api/readdir?path=${path}&root=${root}`)
            .then( res => {
                //return res.text();
                return res.json();
                //return res.blob();
            } )
            .then( data => {
                dfr.resolve(data);
                //reader.readAsDataURL(blob);
                // https://learn.javascript.ru/blob
                // var file = window.URL.createObjectURL(blob);
                // window.location.assign(file);
            }).catch(err => {
                dfr.reject(err);
        });

        return dfr.promise;
    }
}

const Fs = new FileService()

export default Fs;
