/* global Swipe */
const $ = require('air')

class Slideshow {
  constructor (options = {}) {
    const slides = require('./_slides.js')
    const wrap = $('.swipe-wrap')
    wrap.hide()

    this.playing = false

    let div, slide
    for (let i = 0; i < slides.length; i++) {
      div = $.el('div')
      slide = $.el('div', {
        class: 'slide', style: `background-image: url("/assets/img/slides/${slides[i]}")`})
      div.append(slide)
      wrap.append(div)
    }

    const element = document.getElementById('slider')

    // no slideshow on this page
    if (!element) {
      return
    }

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

    const header = document.querySelector('header')
    const toggle = (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.toggle()
    }

    header.addEventListener('click', toggle, false)
    // header.addEventListener('touchend', toggle, false)

    this.swipe.stop()
    this.wrap = wrap
    this.options = options
  }

  toggle () {
    !this.playing ? this.start() : this.stop()
  }

  start () {
    if (this.swipe) {
      this.swipe.restart()
      this.wrap.show()
      this.options.invisibles.addClass('transparent')
      this.playing = true
    }
  }

  stop () {
    if (this.swipe) {
      this.swipe.stop()
      this.wrap.hide()
      this.options.invisibles.removeClass('transparent')
      this.playing = false
    }
  }
}

module.exports = Slideshow
