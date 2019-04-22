const Swiper = require('swiper/dist/js/swiper.js')

class SlideShow {
  constructor (options = {}) {
    const element = document.querySelector('.swipe')
    const s = new Swiper ('.swiper-container', {
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

  start () {}

  stop () {}
}

module.exports = SlideShow
