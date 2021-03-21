import { resolve } from 'path';

export const mode = "development";
export const entry = {
  webxr: './src/webxr.js',
  goalie: './src/goalie.js',
};
export const output = {
  path: resolve(__dirname, 'dist'),
  filename: '[name].js',
};