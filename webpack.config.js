var HTMLWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: __dirname + '/client/app/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './client/app/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader:[ 'style-loader', 'css-loader' ]
      }
    ]
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/client/public'
  },
  plugins: [HTMLWebpackPluginConfig]
};
