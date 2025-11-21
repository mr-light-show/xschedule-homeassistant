import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const dev = process.env.ROLLUP_WATCH;

const createConfig = (inputFile, outputFile) => ({
  input: inputFile,
  output: {
    file: outputFile,
    format: 'es',
    sourcemap: dev ? true : false,
    inlineDynamicImports: true,
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
  ],
});

export default [
  createConfig('src/xschedule-card.js', 'dist/xschedule-card.js'),
  createConfig('src/xschedule-card-editor.js', 'dist/xschedule-card-editor.js'),
  createConfig('src/xschedule-playlist-browser.js', 'dist/xschedule-playlist-browser.js'),
];
