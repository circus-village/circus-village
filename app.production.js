const optimize = require('makestatic-preset-optimize')

module.exports = {
  // disable source maps
  devtool: false,

  // generate manifest file
  manifest: true,

  // always clean files in production
  clean: true,

  // configure optimization lifecycle
  lifecycle: {
    transform: [
      {
        plugin: require('makestatic-inline-css'),
        remove: true,
        prune: true
      }
    ],
    verify: [
      require('makestatic-verify-id'),
      require('makestatic-verify-anchor'),
      require('makestatic-verify-link')
    ],
    emit: [
      {
        plugin: require('makestatic-fingerprint'),
        rules: [/main\.js$/]
      },
      {
        plugin: require('makestatic-sitemap'),
        formats: ['xml'],
        robots: true
      }
    ],
    optimize: optimize(),
    audit: [
      require('makestatic-validate-html'),
      require('makestatic-audit-files'),
      require('makestatic-archive-zip')
    ]
  },

  deploy: {
    production: {
      s3: {
        domain: 'circus-village.com',
        credentials: {
          profile: 'circus-village'
        },
        prefix: 'production',
        region: 'ap-southeast-1',
        error: 'production/404.html',
        redirects: [
          'www.circus-village.com'
        ],
        publish: true,
        cloudfront: {
          key: 'cloudfront_distribution_production',
          invalidate: true
        }
      }
    }
  }
}
