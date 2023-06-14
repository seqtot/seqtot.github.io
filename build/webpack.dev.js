const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const Fs = require('fs');

module.exports = (env) =>
    merge(common(env), {
        mode: 'development',
        devtool: 'eval',
        devServer: {
            // contentBase: path.join(__dirname, 'dist'),
            // contentBase: [
            //   path.join(__dirname, 'public'),
            //   path.join(__dirname, 'assets'),
            // ],
            //inline: true,
            hot: true,
            host: 'localhost',
            port: 5500,
            historyApiFallback: true,
            // заменить на setupMiddlewares
            //before: backendApi, setupMiddlewares
        },
});

// https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
// https://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express

function backendApi(app, server) {
    //app.get('/api/readFile/:filePath', function(req, res){
    app.get('/api/readFile', function(req, res){
        console.log('req.query', req.query);
        console.log('req.params', req.params);
        //const root = 'D:/motes';
        //const filePath = req.params.filePath.replace(':', '');

        //const filePath = `${__dirname}/public/${req.query.path}`;
        const filePath = `${req.query.root}/${req.query.path}`;

        //res.json({file});
        res.download(filePath); // Set disposition and send it.
    });

    // https://stackoverflow.com/questions/33997263/express-js-use-variables-in-routes-path
    // app.use('/:companyName/something', function(req, res, next) {
    //   console.log(req.params.companyName);
    //   next();
    // })

    app.get('/api/readdir', function(req, res) {
        let folder = req.query.path || '';
        folder = folder ? '/' + folder :  '';
        folder = `${req.query.root}${folder}`;

        function readDir(path, result) {
            const files = Fs.readdirSync(path);

            files.forEach(file => {
                if (Fs.lstatSync(path + '/' + file).isFile()) {
                    result.push({
                        name: file,
                        path: path + '/' + file,
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

    // app.get('/api', function (req, res) {
    //   res.json({ custom: 'response' });
    // });
}



// OLD BEFORE
// before: function (app, server) {

//   app.get('/api', function (req, res) {
//     res.json({ custom: 'response' });
//   });

//   app.get('/api/readFile/:filePath', function(req, res){
//     console.log(req.params.path);
//     const filePath = req.params.filePath.replace(':', '');

//     const file = `${__dirname}/public/${filePath}`;

//     console.log('FILE', file);

//     res.download(file); // Set disposition and send it.
//   });

//   // https://stackoverflow.com/questions/33997263/express-js-use-variables-in-routes-path
//   // app.use('/:companyName/something', function(req, res, next) {
//   //   console.log(req.params.companyName);
//   //   next();
//   // })

// },
// proxy: {
//   '/api': {
//     target: 'http://localhost:3000',
//     bypass: function (req, res, proxyOptions) {
//       if (req.headers.accept.indexOf('html') !== -1) {
//         console.log('Skipping proxy for browser request.');
//         return '/index.html';
//       }
//     },
//   },
// },
