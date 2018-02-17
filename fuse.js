const { FuseBox, WebIndexPlugin, JSONPlugin } = require('fuse-box');
const fuse = FuseBox.init({
  homeDir: 'src',
  target: 'browser@es2017',
  sourceMaps: { inline: false, vendor: false }, //Not needed as we are debugging with vscode
  output: 'dist/$name.js',
  log: true,
  debug: true,
  plugins: [WebIndexPlugin(), JSONPlugin()],
  ensureTsConfig: true,
  alias: {
    '@src': '~',
  },
});
fuse.dev(); // launch http server
fuse
  .bundle('app')
  .instructions(' > index.ts')
  .hmr()
  .watch();
fuse.run();
