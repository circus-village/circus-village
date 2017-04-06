const PhotoSwipe = require('./photoswipe/photoswipe')
const PhotoSwipeUI = require('./photoswipe/photoswipe-ui-default')

class ImageGallery {

  constructor (options = {}) {
    this.options = options
  }

  start (item, state) {
    var pswp = document.querySelectorAll('.pswp')[0]
    var items = require('./_gallery.json')
    var options = {
      history: false,
      galleryPIDS: true,
      escKey: true,
      closeOnScroll: false
    }
    this.gallery = new PhotoSwipe(pswp, PhotoSwipeUI, items, options)
    this.gallery.listen('close', () => {
      this.close()
    })
    this.gallery.init()
  }

  close () {
    if (this.gallery) {
      this.gallery.listen('destroy', () => {
        this.gallery = null
      })
      this.gallery.close()
      this.options.back()
    }
  }
}

module.exports = ImageGallery
