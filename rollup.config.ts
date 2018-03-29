import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

const libraryName = 'shepherd';

const external = [
  'remote-redux-devtools',
  'crypto',
  'redux-saga/effects',
  ...Object.keys(pkg.dependencies || {}),
];

const globals = {
  redux: 'redux',
  'bn.js': 'bn.js',
  jsonschema: 'jsonschema',
  crypto: 'crypto',
  'url-search-params': 'url-search-params',
  'redux-saga': 'redux-saga',
  'redux-saga/effects': 'redux-saga/effects',
  'remote-redux-devtools': 'remote-redux-devtools',
  btoa: 'btoa',
};

export default {
  input: `src/index.ts`,

  output: [
    {
      file: pkg.main,
      name: libraryName,
      format: 'umd',
      globals,
      sourcemap: true,
    },
    { file: pkg.module, format: 'es', globals, sourcemap: true },
  ],

  // exclude all node modules
  external,

  watch: {
    include: 'src/**',
  },
  plugins: [
    // Compile TypeScript files
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfig: './tsconfig-build.json',
    }),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
