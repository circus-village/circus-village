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

function Application () {
  var Slideshow = require('./slideshow')
  var Gallery = require('./image-gallery')
  this.scroller = new Scroll()
  this.slideshow = new Slideshow()
  this.gallery = new Gallery(
    {viewport: viewport, navigate: this.navigate.bind(this)})

  this.body = $('body').get(0)
  this.menu = $('.menu')
  this.leader = $('.leader')
  this.links = $('a[href^="#"]')
  this.info = $('.accomodation > div')

  // make the entire info div click to the gallery image
  this.info.on('click', function (e) {
    var el = $(e.currentTarget)
    var href = $(el.find('a[href]').get(0)).attr('href')
    document.location.hash = href
  })
}

var proto = Application.prototype

function viewport () {
  var w = Math.max(
    document.documentElement.clientWidth, window.innerWidth || 0)
  var h = Math.max(
    document.documentElement.clientHeight, window.innerHeight || 0)
  return {width: w, height: h}
}

function onNavigate (e) {
  e.preventDefault()

  var el = $(e.currentTarget)
  var href = el.attr('href')

  this.navigate(href)

  if (history) {
    history.pushState({hash: href}, el.attr('title'), href)
  }

  return false
}

function navigate (href, replace) {
  if (replace) {
    history.replaceState({hash: href}, null, href)
    return
  }

  var id = href.replace(/^#/, '')
  var target = $('#' + id)
  var hash = document.location.hash

  // handle home navigation
  if (href === HOME || id === 'top') {
    this.gallery.close()
    if (this.body.scrollTop !== 0) {
      this.scroller.scrollToTop(0)
    }
  // handle navigation to `id` on the page
  } else if (target.length) {
    this.scroller.scrollToId(id)
  // show photo gallery
  } else if (href === PHOTOS) {
    this.gallery.start(null, hash)
  // handle deep-link to specific photo in the gallery
  } else {
    var item = this.gallery.find(id)
    if (item) {
      this.gallery.start(item, hash)
    }
  }
}

function onScroll () {
  var val = this.body.scrollTop
  if (!val) {
    this.menu.removeClass('transparent')
    this.leader.removeClass('transparent')
  } else {
    this.menu.addClass('transparent')
    this.leader.addClass('transparent')
    this.slideshow.stop()
  }
}

function start () {
  var blurPlaying

  // allow animated scroll on page load
  this.body.scrollTop = 0

  // handle navigation on back button
  /*
  function onPopState (e) {
    e.preventDefault()
    if (!e.state) {
      // this.gallery.close();
    } else {
      // this.navigate(e.state.hash);
    }
  }
  */

  // gallery navigation on hash change
  function onHashChange (e) {
    e.preventDefault()
    e.stopImmediatePropagation()
    var hash = document.location.hash
    if (hash) {
      this.navigate(hash)
    }
  }

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

  this.scroller.start()

  $(this.body).on('scroll', onScroll.bind(this))
  this.links.on('click', onNavigate.bind(this))

  $(window).on('blur', blur.bind(this))
  $(window).on('focus', focus.bind(this))

  this.onHashChange = onHashChange.bind(this)

  $(window).on('load', onLoad.bind(this))
  $(window).on('hashchange', this.onHashChange)
  // $(window).on('popstate', onPopState.bind(this))
}

/*
function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

function scrollTo (val) {
  var start = this.body.scrollTop
  var body = this.body
  var iteration = 0
  var duration = 50
  var diff = val > start ? start - val : val - start
  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame

  // catch when fully scrolled to the bottom and attempting to
  // scroll to last section - which is already visible
  if (body.offsetHeight + body.scrollTop >= body.scrollHeight && (start < val)) {
    return
  }

  // nothing to do
  if (val === start) {
    return
  }

  // perform the animation
  function doScroll () {
    var value = easeOutQuad(iteration, start, diff, duration)
    body.scrollTop = value < 0 ? -value : value
    if (iteration >= duration) {
      body.scrollTop = val
      return
    }
    requestAnimationFrame(doScroll)
    iteration++
  }

  doScroll()
}
*/

proto.start = start
// proto.scrollTo = scrollTo
proto.navigate = navigate

module.exports = Application
