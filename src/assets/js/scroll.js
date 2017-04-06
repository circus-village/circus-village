/* global history */

function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

/**
 *  Animates the scroll which gives the user an idea of how much of
 *  the page has been scrolled thereby indicating how much more content there is
 *  to read.
 */
class Scroll {

  constructor () {
    this.top = document.querySelectorAll('[href="#top"]')

    this.links = document.querySelectorAll(
      'nav.main a, footer a, .permalink[href^="#"]')
    this.scrollTop = this.onScrollTop.bind(this)
    this.scrollToLink = this.onScrollToLink.bind(this)
    this.popstate = this.onPopState.bind(this)
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
    const id = e.currentTarget.getAttribute('href').replace(/^#/, '')
    this.scrollToId(id)
  }

  scrollToId (id, push = true) {
    const el = document.getElementById(id)
    const url = document.location.pathname + '#' + id
    if (document.location.hash === ('#' + id)) {
      push = false
    }
    if (push) {
      history.pushState({href: url, id: id}, '', url)
    }
    const bounds = el.getBoundingClientRect()
    console.log('scroll to top: ' + bounds.top)
    this.scrollToTop(bounds.top)
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
