var $ = require('air'),
  HOME = '#!',
  PHOTOS = '#photos'

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
  var Slideshow = require('./slideshow'),
    Gallery = require('./image-gallery')
  this.slideshow = new Slideshow({resize: resize})
  this.gallery = new Gallery(
    {viewport: viewport, navigate: this.navigate.bind(this)})

  this.body = $('#scroll').get(0)
  this.menu = $('.menu')
  this.leader = $('.leader')
  this.controls = $('.controls')
  this.links = $('a[href^="#"]')
  this.info = $('.accomodation > div')

  // make the entire info div click to the gallery image
  this.info.on('click', function (e) {
    var el = $(e.currentTarget),
      href = $(el.find('a[href]').get(0)).attr('href')
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

  var el = $(e.currentTarget),
    href = el.attr('href')

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

  var id = href.replace(/^#/, ''),
    target = $('[id="' + id + '"]'),
    hash = document.location.hash

  // handle home navigation
  if (href === HOME) {
    this.gallery.close()
    if (this.body.scrollTop !== 0) {
      this.scrollTo(0)
    }
  // handle navigation to `id` on the page
  } else if (target.length) {
    var rect = target.get(0).getBoundingClientRect(),
      val = this.body.scrollTop + rect.top

    this.gallery.close()
    this.scrollTo(val)
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
    this.controls.show()
  } else {
    this.menu.addClass('transparent')
    this.leader.addClass('transparent')
    this.controls.hide()
    this.slideshow.stop()
  }
}

function resize (e, el) {
  var max = 726,
    height,
    h = viewport().height
  el = el || $('header .slide')

  if (h > max) {
    height = max + 'px'
    el.css({
      height: height,
      'background-position': '0 0',
      'background-size': 'auto'
    })
  } else {
    height = '100%'
    el.css({
      height: height,
      'background-position': 'center bottom',
      'background-size': 'cover'
    })
  }

  $('header').css({height: height})
}

function start () {
  resize()

  var blurPlaying

  // allow animated scroll on page load
  this.body.scrollTop = 0

  // handle navigation on back button
  function onPopState (e) {
    e.preventDefault()
    if (!e.state) {
      // this.gallery.close();
    } else {
      // this.navigate(e.state.hash);
    }
  }

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

  $(this.body).on('scroll', onScroll.bind(this))
  this.links.on('click', onNavigate.bind(this))

  $(window).on('resize', resize)
  $(window).on('blur', blur.bind(this))
  $(window).on('focus', focus.bind(this))

  this.onHashChange = onHashChange.bind(this)

  $(window).on('load', onLoad.bind(this))
  $(window).on('hashchange', this.onHashChange)
  $(window).on('popstate', onPopState.bind(this))
}

function easeOutQuad (iteration, start, diff, total) {
  return -diff * (iteration /= total) * (iteration - 2) + start
}

function scrollTo (val) {
  var start = this.body.scrollTop,
    body = this.body,
    iteration = 0,
    duration = 50,
    diff = val > start ? start - val : val - start,
    requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame

  // catch when fully scrolled to the bottom and attempting to
  // scroll to last section - which is already visible
  if (body.offsetHeight + body.scrollTop >= body.scrollHeight
    && (start < val)) {
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

proto.start = start
proto.scrollTo = scrollTo
proto.navigate = navigate

module.exports = Application
