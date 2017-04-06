const PhotoSwipe = require('./photoswipe/photoswipe')
const PhotoSwipeUI = require('./photoswipe/photoswipe-ui-default')

function ImageGallery (opts) {
}

var proto = ImageGallery.prototype

function start (item, hash) {
  var pswp = document.querySelectorAll('.pswp')[0]
  var items = require('./gallery.json')

  var options = {
    history: true,
    galleryPIDS: true
  }

  // Initializes and opens PhotoSwipe
  var gallery = new PhotoSwipe(pswp, PhotoSwipeUI, items, options)
  gallery.init()
}

function close () {
  console.log('close gallery')
}

proto.start = start
proto.close = close

/*
proto.item = item
proto.load = load
proto.next = next
proto.find = find
proto.previous = previous
proto.constrain = constrain
proto.layout = layout
*/

module.exports = ImageGallery
