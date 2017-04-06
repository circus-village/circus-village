var $ = require('air')
var preloader = require('./preloader')

function Slideshow (opts) {
  this.base = 'assets/img/slides/'
  this.slides = require('./slides.json')
  this.playing = false
  this.index = -1

  // pause between slides
  this.delay = 1000

  // element that triggers play/pause
  this.trigger = $('header')
  this.trigger.on('click', this.toggle.bind(this))
}

var proto = Slideshow.prototype

function toggle () {
  if (!this.playing) {
    this.start()
  } else {
    this.stop()
  }
}

function preload (index) {
  if (!this.playing) {
    return
  }

  this.loading = true

  var url = this.base + this.slides[index]
  var scope = this
  var el = $.el('img')

  function progress (img, ratio) {
    $('.progress').css(
      {opacity: '' + ratio, width: Math.round(ratio * 100) + '%'})
  }

  preloader(url, progress, function () {
    $('.progress').css({opacity: '0', transition: 'opacity 0.5s ease'})
    scope.show(url)
  })

  $('body').append(el)
}

function wait (delay) {
  delay = delay || this.delay
  function pause () {
    this.preload(this.next())
  }
  this.waiter = setTimeout(pause.bind(this), delay)
}

function show (url) {
  var scope = this
  var previous = $('header .slide')
  var header = $.el('div', {class: 'slide'})
  var style = {
    'background-image': 'url(' + url + ')',
    opacity: '0',
    'z-index': '1'
  }

  // shift previous slide behind
  var prev = {
    position: 'absolute',
    'z-index': '-2',
    left: '0',
    top: '0'
  }
  // NOTE: must maintain previous inline background-image for firefox
  prev['background-image'] = previous.css()['background-image']
  previous.css(prev)

  // set up style for new slide
  header.css(style)

  // inject new slide into the DOM
  previous.get(0).parentNode.insertBefore(
    header.get(0), $('.progress').get(0))

  function remove () {
    $('header').removeClass('welcome')
    this.loading = false
    if (this.queued) {
      this.start(this.queued)
      this.queued = null
      return
    }
    previous.remove()
    this.wait()
  }

  setTimeout(function () {
    header.on('transitionend', remove.bind(scope))
    style.opacity = '1'
    header.css(style)
  }, 10)
}

function start (index) {
  if (this.playing) {
    return
  }

  $('.menu, .leader').addClass('transparent')

  if (this.loading) {
    // queue the item for animation complete
    this.queued = index
    return
  }

  this.playing = true
  this.preload(index !== undefined ? index : this.next())
}

function stop () {
  if (!this.playing) {
    return
  }

  $('.menu, .leader').removeClass('transparent')

  clearTimeout(this.waiter)
  this.playing = false
}

function select (index) {
  if (index < 0) {
    index = 0
  } else if (index >= this.slides.length) {
    index = this.slides.length - 1
  }

  if (index === this.index) {
    return
  }

  this.index = index
  if (this.playing) {
    this.stop()
    this.start(this.index)
  } else {
    this.start(this.index)
  }
}

function next () {
  this.index++
  if (this.index >= this.slides.length) {
    this.index = 0
  }
  return this.index
}

proto.start = start
proto.preload = preload
proto.show = show
proto.select = select
proto.next = next
proto.stop = stop
proto.toggle = toggle
proto.wait = wait

module.exports = Slideshow
