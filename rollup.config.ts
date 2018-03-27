import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';

const pkg = require('./package.json');

const libraryName = 'shepherd';

const external = [
  'remote-redux-devtools',
  'crypto',
  'redux-saga/effects',
  ...Object.keys(pkg.dependencies || {}),
];

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: libraryName, format: 'umd' },
    { file: pkg.module, format: 'es' },
  ],
  sourcemap: true,

  // exclude all node modules
  external,

  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: './tsconfig.build-es.json',
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
