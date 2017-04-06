/* global history */
const PhotoSwipe = require('./photoswipe/photoswipe')
const PhotoSwipeUI = require('./photoswipe/photoswipe-ui-default')

function ImageGallery (opts) {
}

var proto = ImageGallery.prototype

function start (item, hash) {
  var pswp = document.querySelectorAll('.pswp')[0]
  var items = require('./gallery.json')

  var options = {
    history: false,
    galleryPIDS: true,
    escKey: true,
    closeOnScroll: false
  }

  // Initializes and opens PhotoSwipe
  this.gallery = new PhotoSwipe(pswp, PhotoSwipeUI, items, options)
  this.gallery.init()
}

function close () {
  this.gallery.listen('destroy', () => {
    this.gallery = null
    history.back()
  })
  this.gallery.close()
}

proto.start = start
proto.close = close

module.exports = ImageGallery
