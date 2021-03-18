const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/webxr.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.js',
  },
};