const Swiper = require('swiper/dist/js/swiper.js')

class SlideShow {
  constructor (options = {}) {

    this.playing = true

    this.swiper = new Swiper ('.swiper-container', {
      loop: true,
      //effect: 'slide',
      autoplay: true,
      //autoplay: {
        //delay: 10000,
        //disableOnInteraction: false,
      //},
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: false
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }
    })
  }

  start () {
    this.swiper.autoplay.start()
    this.playing = true
  }

  stop () {
    this.swiper.autoplay.stop()
    this.playing = false
  }
}

module.exports = SlideShow
