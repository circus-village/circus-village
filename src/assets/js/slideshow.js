/* global Swipe */
const $ = require('air')

class Slideshow {
  constructor () {
    const slides = require('./slides.json')
    const wrap = $('.swipe-wrap')
    wrap.hide()

    this.playing = false

    let div, slide
    for (let i = 0; i < slides.length; i++) {
      div = $.el('div')
      slide = $.el('div', {class: 'slide', style: `background-image: url("/assets/img/slides/${slides[i]}")`})
      div.append(slide)
      wrap.append(div)
    }

    const element = document.getElementById('slider')
    this.swipe = new Swipe(element, {
      startSlide: 0,
      auto: 1500,
      draggable: false,
      autoRestart: false,
      continuous: true,
      disableScroll: true,
      stopPropagation: true,
      callback: (index, element) => {},
      transitionEnd: (index, element) => {}
    })

    document.querySelector('header').addEventListener('click', () => { this.toggle() })

    this.swipe.stop()
    this.wrap = wrap
  }

  toggle () {
    !this.playing ? this.start() : this.stop()
    this.playing = !this.playing
  }

  start () {
    this.swipe.restart()
    this.wrap.show()
  }

  stop () {
    this.swipe.stop()
    this.wrap.hide()
  }
}

module.exports = Slideshow
