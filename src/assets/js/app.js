/* global history */

import {Scroll} from './scroll'

var $ = require('air')
var HOME = ''
var PHOTOS = '#photos'

$.plugin([
  require('air/append'),
  require('air/attr'),
  require('air/class'),
  require('air/create'),
  require('air/css'),
  require('air/data'),
  require('air/event'),
  require('air/find'),
  require('air/hidden'),
  require('air/parent'),
  require('air/prepend'),
  require('air/remove')
])

class Application {

  constructor () {
    const navigate = this.navigate.bind(this)
    const Slideshow = require('./slideshow')
    const Gallery = require('./image-gallery')

    this.history = []
    this.body = $('body').get(0)
    this.menu = $('.menu')
    this.leader = $('.leader')

    this.scroller = new Scroll({
      navigate: navigate,
      popstate: (evt) => {
        let id = HOME
        if (evt.state && evt.state.id) {
          id = '#' + evt.state.id
        // allow hash changes to navigate to named anchors
        // when there are no state items in the history
        } else if (document.location.hash) {
          id = document.location.hash
        }
        this.navigate(id)
      }})

    this.slideshow = new Slideshow()
    this.gallery = new Gallery({navigate: navigate, back: this.back.bind(this)})
  }

  back () {
    this.replace = true
    history.go(-1)
  }

  navigate (href) {
    // console.log('navigate: ' + href)
    const id = href.replace(/^#/, '')
    const target = id ? $('#' + id) : null
    const hash = document.location.hash
    let url = document.location.pathname
    if (id) {
      url += '#' + id
    }
    const state = {id: id, href: href, url: url}

    if (this.replace) {
      history.replaceState(state, null, href)
      this.replace = false
      return
    }

    // handle home navigation
    if (href === HOME || id === 'top') {
      this.gallery.close()
      if (this.body.scrollTop !== 0) {
        if (document.location.hash) {
          const url = document.location.pathname
          history.pushState(state, '', url)
        }
        this.scroller.scrollToTop(0)
      }
    // handle navigation to `id` on the page
    } else if (target.length) {
      this.scroller.scrollToId(id)
    // show photo gallery
    } else if (href === PHOTOS) {
      this.gallery.start(null, hash)
    /*
    // handle deep-link to specific photo in the gallery
    } else {
      var item = this.gallery.find(id)
      if (item) {
        this.gallery.start(item, hash)
      }
    */
    }

    let push = true
    if (document.location.hash === ('#' + id)) {
      push = false
    }
    if (push) {
      history.pushState(state, '', url)
    }
  }

  onScroll () {
    //var val = $(window).scrollTop
    var doc = document.documentElement
    var val = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0)

    if (val === 0) {
      this.menu.removeClass('transparent')
      this.leader.removeClass('transparent')
      this.slideshow.start()
    } else if (!this.menu.hasClass('transparent')) {
      console.log('calling stop')
      this.slideshow.stop()
      this.menu.addClass('transparent')
      this.leader.addClass('transparent')
    }
  }

  start () {
    var blurPlaying

    // allow animated scroll on page load
    this.body.scrollTop = 0

    // check for hash on load
    function onLoad (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      var hash = document.location.hash
      if (hash) {
        this.navigate(hash)
      } else {
        this.navigate(HOME, true)
      }
    }

    // stop slideshow on blur
    function blur () {
      blurPlaying = this.slideshow.playing
      this.slideshow.stop()
    }

    // restart slideshow on focus
    function focus () {
      if (blurPlaying) {
        this.slideshow.start()
      }
    }

    window.addEventListener('scroll', this.onScroll.bind(this))

    this.scroller.start()

    // read more links
    const more = $('a.read-more')
    more.on('click', (e) => {
      e.preventDefault()
      const link = e.currentTarget
      const para = link.parentNode
      $(para).remove()
      const text = $('p.hidden', para.parentNode)
      text.removeClass('hidden')
    })

    $(window).on('blur', blur.bind(this))
    $(window).on('focus', focus.bind(this))
    $(window).on('load', onLoad.bind(this))
  }
}

module.exports = Application
