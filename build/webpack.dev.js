const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');

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
    },
  });

// https://stackoverflow.com/questions/32545632/how-can-i-download-a-file-using-window-fetch
// https://stackoverflow.com/questions/7288814/download-a-file-from-nodejs-server-using-express
