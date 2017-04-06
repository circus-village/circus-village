const PhotoSwipe = require('./photoswipe/photoswipe')
const PhotoSwipeUI = require('./photoswipe/photoswipe-ui-default')

class ImageGallery {

  start (item, hash) {
    // console.log('start gallery')
    var pswp = document.querySelectorAll('.pswp')[0]
    var items = require('./gallery.json')
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
    // console.log('close gallery')
    if (this.gallery) {
      // console.log('closing :' + this.gallery)
      this.gallery.listen('destroy', () => {
        // console.log('gallery destroyed')
        this.gallery = null
      })
      this.gallery.close()
    }
  }
}

module.exports = ImageGallery
