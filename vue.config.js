/* vue.config.js */
module.exports = {
  chainWebpack: (config) => {
    config.plugin('html').tap((args) => {
      args[0].title = 'Contact Map';
      return args;
    });
  },
  pwa: {
    name: 'Contact Map',
    themeColor: '#4DBA87',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      // swSrc is required in InjectManifest mode.
      //swSrc: 'dev/sw.js',
      // ...other Workbox options...
    },
  },
};
