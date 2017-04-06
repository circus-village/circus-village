/* global history */

function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

/**
 */
class Scroll {

  constructor (options = {}) {
    this.top = document.querySelectorAll('[href="#top"]')

    this.links = document.querySelectorAll(
      'nav.main a:not([href^="#photos"]), footer a, .permalink[href^="#"]')
    this.scrollTop = this.onScrollTop.bind(this)
    this.scrollToLink = this.onScrollToLink.bind(this)
    this.popstate = options.popstate || this.onPopState.bind(this)
    this.navigate = options.navigate
  }

  onScrollTop (e) {
    e.preventDefault()
    const pos = this.getScrollPosition()
    // don't push a state if we are already at the top
    if (pos.top === 0) {
      return false
    }
    this.scrollToTop(0)
    if (document.location.hash) {
      const url = document.location.pathname
      history.pushState({href: url}, '', url)
    }
  }

  getScrollPosition () {
    let doc = document.documentElement
    let left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
    let top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
    return {left: left, top: top}
  }

  scrollToTop (val) {
    let start = this.getScrollPosition().top
    let iteration = 0
    let duration = 50
    let diff = val === 0 ? -start : val
    let requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame

    // perform the animation
    function doScroll () {
      const value = easeOutQuad(iteration, start, diff, duration)
      const amount = value < 0 ? -value : value
      window.scrollTo(0, amount)
      if (iteration >= duration) {
        window.scrollTo(0, Math.floor(amount))
        return
      }
      requestAnimationFrame(doScroll)
      iteration++
    }

    doScroll()
  }

  onScrollToLink (e) {
    e.preventDefault()
    this.navigate(e.currentTarget.getAttribute('href'))
  }

  scrollToId (id, push = true) {
    const el = document.getElementById(id)
    if (el) {
      const url = document.location.pathname + '#' + id
      if (document.location.hash === ('#' + id)) {
        push = false
      }
      if (push) {
        history.pushState({href: url, id: id}, '', url)
      }
      const bounds = el.getBoundingClientRect()
      this.scrollToTop(bounds.top)
    }
  }

  onPopState (evt) {
    if (evt.state && evt.state.id) {
      this.scrollToId(evt.state.id, false)
    } else {
      // allow hash changes to navigate to named anchors
      // when there are no state items in the history
      if (document.location.hash) {
        const id = document.location.hash.replace(/^#/, '')
        return this.scrollToId(id, false)
      }
      this.scrollToTop(0)
    }
  }

  start () {
    for (let i = 0; i < this.top.length; i++) {
      this.top[i].addEventListener('click', this.scrollTop)
    }
    for (let i = 0; i < this.links.length; i++) {
      this.links[i].addEventListener('click', this.scrollToLink)
    }
    window.addEventListener('popstate', this.popstate)
  }

}

export {Scroll}
