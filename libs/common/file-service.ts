import { Deferred } from './utils';
import { TSongInfo } from '../../pages/ide/ide-service';
import { MY_SONG } from '../../pages/song-store';
import { SongDB } from '../../pages/ide/my-song-db';
import { TSongNode } from '../muse';

export type TSongList = {
    [key: string]: {
        dir: string,
        ns:string,
        items: TSongInfo[]
    }};

export type FSFileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FSFileInfo[],
}

const isDev = /localhost/.test(window.location.href);

class FileService {
    async readTextFile(path: string): Promise<string> {
        if (path.startsWith('motes/')) return this.readTextFileFromStatic(path);
        if (path === MY_SONG) return this.readTextFileFromIndexDB(path);

        const dfr: Deferred = new Deferred<any>();
        const root = 'D:/seqtot.github.io/assets'; // TODO: delete ???

        //const reader = new FileReader();
        fetch(`/api/readFile?path=${path}&root=${root}`)
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

    async readTextFileFromIndexDB(path: string): Promise<string> {
        const dfr: Deferred = new Deferred();
        let result = '';

        try {
            const url = isDev ? `/${path}` : `/assets/${path}`;
            const res = await fetch(url);

            if (res.ok) {
                result = await res.text();
            } else {
                console.log(`error on load 1: ${path}`);
            }
        }
        catch (error){
            console.log(`error on load 2: ${path}`, error);
        }

        dfr.resolve(result);

        return dfr.promise;
    }

    async readTextFileFromStatic(path: string): Promise<string> {
        const dfr: Deferred = new Deferred();
        let result = '';

        try {
            const url = isDev ? `/${path}` : `/assets/${path}`;
            const res = await fetch(url);

            if (res.ok) {
                result = await res.text();
            } else {
                console.log(`error on load 1: ${path}`);
            }
        }
        catch (error){
            console.log(`error on load 2: ${path}`, error);
        }

        dfr.resolve(result);

        return dfr.promise;
    }

    async readMotes(): Promise<FSFileInfo[]> {
        const dfr: Deferred = new Deferred();
        const songList = await this.loadSongList();
        const result = [];

        Object.keys(songList).forEach(key => {
            const group = songList[key];

            const folder = {
                name: key,
                path: `motes/${group.dir}`,
                children: []
            };

            group.items.forEach(song => {
                folder.children.push({
                    name: `${song.id}`,
                    path: `motes/${group.dir}/${song.id}.midi`,
                    isFile: true,
                });
            });

            result.push(folder);
        });

        dfr.resolve(result);

        return dfr.promise;
    }

    async readdir(path: string): Promise<FSFileInfo[]> {
        if (path === 'motes' && !isDev) return this.readMotes();

        const dfr: Deferred = new Deferred<any>();
        const root = 'assets';
        //const reader = new FileReader();
        fetch(`/api/readdir?path=${path}&root=${root}`)
            .then( res => {
                //return res.text();
                return res.json();
                //return res.blob();
            } )
            .then( data => {
                dfr.resolve(data);
                //console.log('readdir.RESULT', data);
                //reader.readAsDataURL(blob);
                // https://learn.javascript.ru/blob
                // var file = window.URL.createObjectURL(blob);
                // window.location.assign(file);
            }).catch(err => {
                dfr.reject(err);
        });

        return dfr.promise;
    }

    async writeTextFileInDB(text: string, fileInfo: {path?: string, name?: string}): Promise<TSongNode> {
        let song = await SongDB.GetSongById(fileInfo.name);
        song = song || <TSongNode>{
            id: fileInfo.name!,
            score: text || '',
            tags: [MY_SONG],
        };

        return SongDB.PutSong(<TSongNode>{
            ...song,
            score: text || '',
        });
    }

    async writeTextFile(text: string, fileInfo: {path?: string, name?: string}): Promise<unknown> {
        //console.log('FS.writeTextFile', text, fileInfo);

        if (fileInfo.path === MY_SONG) return this.writeTextFileInDB(text, fileInfo);

        const dfr: Deferred = new Deferred<any>();
        // const root = 'D:/motes';
        // async function postData(url = "", data = {}) {
        //     // Default options are marked with *
        //     const response = await fetch(url, {
        //         method: "POST", // *GET, POST, PUT, DELETE, etc.
        //         mode: "cors", // no-cors, *cors, same-origin
        //         cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        //         credentials: "same-origin", // include, *same-origin, omit
        //         headers: {
        //             "Content-Type": "application/json",
        //             // 'Content-Type': 'application/x-www-form-urlencoded',
        //         },
        //         redirect: "follow", // manual, *follow, error
        //         referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //         body: JSON.stringify(data), // body data type must match "Content-Type" header
        //     });
        //     return response.json(); // parses JSON response into native JavaScript objects
        // }

        //const reader = new FileReader();
        fetch(`/api/writeFile`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
                path: fileInfo.path,
                text
            })
        })
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

    async loadSongList(): Promise<TSongList> {
        const dfr = new Deferred();
        let data: TSongList = {};

        try {
            const url = isDev ? '/' + 'song_list.json' : `/assets/song_list.json`;
            const res = await fetch(url);

            if (res.ok) {
                data = await res.json();
            } else {
                console.log('error on load song_list.json: 1');
            }
        }
        catch (error){
            console.log('error on load song_list.json: 2', error);
        }

        Object.keys(data).forEach(key => {
            const item = data[key];
            data[key].items.forEach(song => {
                song.dir = item.dir;
                song.ns = item.ns;
            })
        });

        dfr.resolve(data);

        return dfr.promise;
    }
}

const Fs = new FileService()

export default Fs;
