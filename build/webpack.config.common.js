const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env) => {
  return {
    resolve: {
      extensions: ['.js', '.ts'],
      alias: {
        '@src': path.resolve(__dirname, 'src'),
        '@muse': path.resolve(__dirname, 'muse'),
        '@data': path.resolve(__dirname, 'sets'),
        // '@components': path.resolve(__dirname, 'src_au/components'),
        // '@style': path.resolve(__dirname, 'src_au/common/style'),
        // '@util': path.resolve(__dirname, 'src_au/common/util'),
        // '@types': path.resolve(__dirname, 'src_au/common/types'),
        // '@store': path.resolve(__dirname, 'src_au/store'),
        // '@model': path.resolve(__dirname, 'src_au/model'),
        // '@controllers': path.resolve(__dirname, 'src_au/controllers'),
        // '@command': path.resolve(__dirname, 'src_au/common/command'),
        // '@audio': path.resolve(__dirname, 'src_au/common/audio'),

        // '@gl': path.resolve(__dirname, 'src_gl'),
        // '@ss': path.resolve(__dirname, 'src_ss'),
        // '@cm': path.resolve(__dirname, 'src_cm'),
      },
    },
    entry: {
      index: './index.ts',
    },
    module: {
      rules: [
        {
          test: /\.ts$/, // (ts|tsx)
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
            },
            // {
            //     loader: 'ifdef-loader',
            //     options: {
            //         env: isProduction ? 'production' : 'development'
            //     }
            // }
          ],
        },
        // {
        //   test: /\.(js|ts)/,
        //   loader: 'babel-loader',
        //   exclude: /node_modules/,
        // },
        // {
        //   test: /\.scss$/,
        //   use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        // },
        // {
        //   test: /\.less$/,
        //   use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
        // },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        // {
        //   test: /\.(svg)$/, // \.(png|svg|jpg|gif)$
        //   use: [
        //     'file-loader',
        //   ],
        // },
        // {
        //   test: /\.(png|jpe?g|gif)$/i,
        //   use: {
        //     loader: 'url-loader',
        //     options: {
        //       publicPath: '/',
        //       // name: '[name].[ext]?[hash]',
        //       name: '[name].[ext]',
        //       limit: 10000
        //     }
        //   }
        // }
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './build/index.html',
        filename: 'index.html',
        chunks: ['index'],
        // favicon: './public/favicon.ico',
        hash: false,
      }),
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],
    output: {
      path: path.join(__dirname, './dist'),
      publicPath: '', // / route в заголовке
      filename: '[name].js',
    },
  };
};
