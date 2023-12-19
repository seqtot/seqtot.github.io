import {Deferred} from './utils';

export type FileInfo = {
    path: string,
    name: string,
    isFile?: boolean,
    children?: FileInfo[],
}

class FileService {
    async readTextFile(path: string): Promise<string> {
        const dfr: Deferred = new Deferred<any>();
        const root = 'D:/seqtot.github.io/assets'; // TODO: delete ???

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
        const root = 'assets';

        console.log('Path', path);

        //const reader = new FileReader();
        fetch(`api/readdir?path=${path}&root=${root}`)
            .then( res => {
                //return res.text();
                return res.json();
                //return res.blob();
            } )
            .then( data => {
                dfr.resolve(data);
                console.log('RESULT', data);
                //reader.readAsDataURL(blob);
                // https://learn.javascript.ru/blob
                // var file = window.URL.createObjectURL(blob);
                // window.location.assign(file);
            }).catch(err => {
                dfr.reject(err);
        });

        return dfr.promise;
    }

    async writeTextFile(text: string, path: string): Promise<unknown> {
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
        fetch(`api/writeFile`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({
                path,
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
}

const Fs = new FileService()

export default Fs;
