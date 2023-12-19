const Path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const Fs = require('fs');

function writeFileSync (fname, content) {
    fname = Path.resolve(fname);
    const fhnd = Fs.openSync(fname, 'w');
    Fs.writeFileSync(fhnd, content);
    Fs.closeSync(fhnd);
}

//console.log('Path.resolve(__dirname)', Path.join(__dirname, '..', 'node_modules'));

module.exports = (env) =>
    merge(common(env), {
        mode: 'development',
        devtool: 'eval',
        devServer: {
            static: [
                {
                    directory: Path.resolve(__dirname, '../assets'),
                    watch: false,
                }
            ],
            hot: true,
            host: 'localhost',
            port: 5500,
            historyApiFallback: true,

            // заменить на setupMiddlewares
            setupMiddlewares: backendApi,
        },
        //watchOptions: {
            //ignored: ['**/motes', '**/node_modules'],
        //     ignored: [
        //         //Path.join(__dirname, '..', 'node_modules'),
        //         //Path.join(__dirname, '..', 'motes'),
        //         //Path.resolve(__dirname, '../node_modules'),
        //         //Path.resolve(__dirname, '../motes'),
        //     ],
        //},
});

// https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
// https://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express
function backendApi(middlewares, devServer) {
    //app.get('/api/readFile/:filePath', function(req, res){
    const app = devServer.app;

    if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
    }

    app.get('/api/readFile', function(req, res){
        //console.log('req.query', req.query);
        //console.log('req.params', req.params);
        //const root = 'D:/motes';
        //const filePath = req.params.filePath.replace(':', '');

        //const filePath = `${__dirname}/public/${req.query.path}`;
        //const filePath = `${req.query.root}/${req.query.path}`;
        const filePath = `${req.query.path}`;

        //res.json({file});
        res.download(filePath); // Set disposition and send it.
    });

    // https://stackoverflow.com/questions/33997263/express-js-use-variables-in-routes-path
    app.get('/api/readdir', function(req, res) {

        console.log('query:path', req.query.path);
        console.log('query:root', req.query.root);

        let folder = req.query.path || '';
        let root = req.query.root || '';
        
        folder = Path.join(__dirname, '..', root, folder);

        console.log('read folder', folder);

        function readDir(path, result) {
            const files = Fs.readdirSync(path);

            files.forEach(file => {
                if (Fs.lstatSync(path + '/' + file).isFile()) {
                    result.push({
                        name: file,
                        path: path + '/' + file,
                        isFile: true,
                    });
                }
                else if (Fs.lstatSync(path).isDirectory()) {
                    const children = [];

                    result.push({
                        name: file,
                        path: path + '/' + file,
                        children
                    })

                    readDir(path + '/' + file, children);
                }
            });

            return result;
        }

        const result = readDir(folder, []);

        res.json(result);
    });


    app.post('/api/writeFile', function(req, res) {
        // или прикрутить express bodyParser
        const chunks = [];

        req.on('data', (chunk) => chunks.push(chunk));

        req.on('end', () => {
            //console.log("all parts/chunks have arrived");
            const data = Buffer.concat(chunks);
            const buf = Buffer.from(data);
            const json = JSON.parse(buf.toString());

            if (json && json.path && json.text) {
                writeFileSync(json.path, json.text);
            }

            res.json({result: 'OK'});
        });
    });

    return middlewares;
}
