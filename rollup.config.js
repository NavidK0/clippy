import { createRequire } from 'node:module';

import buble from '@rollup/plugin-buble';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import fs, { readdirSync } from 'fs';
import path, { dirname } from 'path';
import styles from 'rollup-plugin-styles';
import { fileURLToPath } from 'url';
import copy from 'rollup-plugin-copy';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));

const { dependencies } = require('./package.json');

const dist = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

// prepare agent configs
const agentDir = path.resolve(__dirname, 'src/assets/agents');

const agentInputs = getDirectories(agentDir)
  .map((agent) => {
    return {
      [`assets/agents/${agent}`]: `${agentDir}/${agent}/index.ts`,
    };
  })
  .reduce((acc, cur) => {
    return { ...acc, ...cur };
  }, {});

console.log(agentInputs);

export default [
  {
    strictDeprecations: true,
    input: {
      index: 'src/index.ts',
      ...agentInputs,
    },
    external: Object.keys(dependencies || {}),
    plugins: [
      typescript(),
      styles(),
      buble(),
      nodeResolve({
        browser: true,
      }),
      image({
        dom: false,
        include: /\.(png|jpg)$/,
      }),
      commonjs(),
      terser(),
      copy({
        targets: [
          { src: 'src/clippy.css', dest: 'dist' },
          {
            src: ['src/**/*.mp3', 'src/**/*.ogg'],
            dest: 'dist',
          },
        ],
        flatten: false,
      }),
    ],
    output: [
      {
        dir: dist,
        format: 'es',
        sourcemap: true,
      },
    ],
  },
];
