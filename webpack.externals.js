const paths = require('./main/core/Resources/server/webpack/paths')
const plugins = require('./main/core/Resources/server/webpack/plugins')
const loaders = require('./main/core/Resources/server/webpack/loaders')
const vendors = require('./main/core/Resources/server/webpack/vendors')


module.exports = {
  entry: vendors,
  output: {
    path: paths.output(),
    filename: '[name]-[hash].js'
  },
  resolve: {
    root: paths.bower()
  },
  plugins: [
      plugins.assetsInfoFile('webpack-vendors.json'),
      plugins.bowerFileLookup()
  ],
  module: {
    loaders: [
      loaders.css(),
      loaders.font(),
      loaders.babel(),
      loaders.loadConfig(),
      loaders.rawHtml(),
      loaders.jqueryUiNoAmd(),
      loaders.imageUris(),
      loaders.tinymceImport(),
      loaders.tinymceWrapper(),
      loaders.tinymceJquery(),
    ]
  },
  devtool: false
}