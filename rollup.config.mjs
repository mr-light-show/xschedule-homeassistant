import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
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
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['last 2 versions', 'not dead'],
            },
          },
        ],
      ],
    }),
    !dev && terser(),
  ],
});

export default [
  createConfig('src/xschedule-card.js', 'dist/xschedule-card.js'),
  createConfig('src/xschedule-playlist-browser.js', 'dist/xschedule-playlist-browser.js'),
];
