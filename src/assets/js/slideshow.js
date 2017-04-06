/* global Swipe */
class Slideshow {
  constructor () {
    const element = document.getElementById('slider')
    this.swipe = new Swipe(element, {
      startSlide: 0,
      // auto: 3000,
      auto: 0,
      draggable: false,
      autoRestart: false,
      continuous: true,
      disableScroll: true,
      stopPropagation: true,
      callback: (index, element) => {},
      transitionEnd: (index, element) => {}
    })

    console.log(this.swipe)
  }

  start () {
    console.log('start slideshow')
    this.swipe.restart()
  }

  stop () {
    console.log('stop slideshow')
    this.swipe.stop()
  }
}

module.exports = Slideshow
