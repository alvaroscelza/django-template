const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: 'bundle/bundle.js',
    publicPath: '/static/',
    clean: true
  },
  mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'videos/'
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './templates/webpack.html',
      filename: 'index.html' // Output file in static/
    }),
    /*
    Note: This following plugin replaces all process.env.NODE_ENV references in your JavaScript code with the
    actual value at compile time. It's like a global find-and-replace.
    - Without it: process.env.NODE_ENV would be undefined in the browser.
    - With it: It becomes "development" or "production" as appropriate.
    */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'static'), // Serve from static
      publicPath: '/static/'
    },
    hot: true,
    port: 3000,
    historyApiFallback: {
      index: '/static/index.html'
    },
    proxy: [
      {
        context: ['/api', '/tenants'],
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    ]
  }
};