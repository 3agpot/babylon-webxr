const path = require('path');

module.exports = {
  mode: "development",
  entry: {
    webxr: './src/webxr.js',
    goalie: './src/goalie.js',
    sm: './src/sm.js',
    wall: './src/wall.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  /*resolve: {
    fallback: {
      fs: false
    }
  }*/
}