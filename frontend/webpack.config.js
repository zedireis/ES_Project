const path = require('path');
const WatchExternalFilesPlugin = require('webpack-watch-files-plugin').default;

module.exports = {
  entry : "./src/index.js",
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  output: {
    path: path.resolve(__dirname,'static/frontend'),
  },
  plugins: [
    // ....
    new WatchExternalFilesPlugin({
      files: [
        './src/components/*.js',
      ],
      verbose : true
    })
  ]
};