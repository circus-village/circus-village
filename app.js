const path = require('path')
const parse = require('makestatic-preset-parse')

module.exports = {

  // indicate the deployment URL
  url: 'https://circus-village.com',

  // change these to your preference
  input: __dirname + '/src',
  output: __dirname + '/public',

  // configure browsersync options
  server: {
    ghostMode: false
  },

  entry: {
    'assets/js/main.js': ['./assets/js/index.js']
  },

  // configure css processing
  styles: () => {
    const std = require('makestatic-css-standard')
    const conf = std()
    // you can add postcss plugins to `conf.plugins` here
    return conf
  },

  // configure template processing
  markup: () => {
    const std = require('makestatic-html-standard')
    const id = require('makestatic-page-id')
    return std(
      {
        locals: (ctx, options) => {
          return {
            pageId: id(ctx, options),
            pkg: require('./package.json')
          }
        }
      }
    )
  },

  // configure javascript transpiling
  script: {
    presets: ['env']
  },

  // configure development mode lifecycle
  lifecycle: {
    build: [
      require('makestatic-build-version')
    ],
    parse: parse({js: false}).concat(),
    graph: require('makestatic-graph-resources'),
    transform: [
      require('makestatic-dom-version'),
      {
        plugin: require('makestatic-permalink'),
        from: 2,
        to: 3
      },
      {
        plugin: require('makestatic-inline-css'),
        options: {
          remove: true
        }
      }
    ],
    verify: [
      require('makestatic-verify-id')
      // require('makestatic-verify-anchor')
    ]
  },

  resolve: {
    modules: [
      'node_modules',
      path.resolve('./node_modules/air/lib')
    ]
  }
}
