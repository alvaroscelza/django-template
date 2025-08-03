const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'static/bundles'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true
  },
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
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html'
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/img/favicon.png',
            to: 'img/favicon.png'
          }
        ]
      })
    ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'static'),
      publicPath: '/static/'
    },
    hot: true,
    port: 3000,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/api', '/tenants'],
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    ]
  }
}; 