var $ = require('air');

$.plugin([
  require('air/append'),
  require('air/attr'),
  require('air/class'),
  require('air/create'),
  require('air/css'),
  require('air/event'),
  require('air/find'),
  require('air/parent'),
  require('air/prepend'),
  require('air/remove')
])

function Application() {
  var Slideshow = require('./slideshow');
  this.slideshow = new Slideshow({resize: resize});
  this.body = $('#scroll').get(0);
  this.menu = $('.menu');
  this.leader = $('.leader');
  this.controls = $('.controls');
  this.links = $('a[href^="#"]');
}

var proto = Application.prototype;

function viewport() {
  var w = Math.max(
    document.documentElement.clientWidth, window.innerWidth || 0);
  var h = Math.max(
    document.documentElement.clientHeight, window.innerHeight || 0);
  return {width: w, height: h}
}

function onNavigate(e) {
  e.preventDefault();
  var el = $(e.currentTarget)
    , href = el.attr('href');

  this.scrollToHash(href);

  if(history) {
    history.pushState({hash: href}, el.attr('title'), href); 
  }

  return false;
}

function scrollToHash(href) {
  var target = $('[id="' + href.replace(/^#/, '') + '"]');
  if(target.length) {
    var rect = target.get(0).getBoundingClientRect()
      , val = this.body.scrollTop + rect.top;
    this.scrollTo(val);
  }
}

function onScroll() {
  var val = this.body.scrollTop;
  if(!val) {
    this.menu.removeClass('transparent');
    this.leader.removeClass('transparent');
    this.controls.removeClass('transparent');
    //this.slideshow.start();
  }else{
    this.menu.addClass('transparent'); 
    this.leader.addClass('transparent');
    this.controls.removeClass('transparent');
    //this.slideshow.stop();
  }
}

function resize(e, el) {
  var max = 726
    , height
    , h = viewport().height;
  el = el || $('header .slide');

  if(h > max) {
    height = max + 'px';
    el.css({
      height: height,
      'background-position': '0 0',
      'background-size': 'auto'
    });
  }else{
    height = '100%';
    el.css({
      height: height,
      'background-position': 'center bottom',
      'background-size': 'cover'
    });
  }

  $('header').css({height: height});
}

function start() {
  $(this.body).on('scroll', onScroll.bind(this));

  this.links.on('click', onNavigate.bind(this))

  function onPopState(e) {
    e.preventDefault();
    if(!e.state) {
      return this.scrollTo(0);
    }
  }

  resize();

  $(window).on('resize', resize);

  // allow animated scroll on page load
  this.body.scrollTop = 0;

  function onLoad(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var hash = document.location.hash;
    if(hash) {
      this.scrollToHash(hash);
    }

    if(this.body.scrollTop === 0) {
      //this.slideshow.start();
    }
  }

  $(window).on('load', onLoad.bind(this))
  $(window).on('popstate', onPopState.bind(this));

}

function easeOutQuad(iteration, start, diff, total) {
	return -diff * (iteration /= total) * (iteration - 2) + start;
}

function scrollTo(val) {
  var start = this.body.scrollTop
    , body = this.body
    , iteration = 0
    , duration = 50
    , diff = val > start ? start - val : val - start
    , requestAnimationFrame = window.requestAnimationFrame || 
                              window.mozRequestAnimationFrame || 
                              window.webkitRequestAnimationFrame || 
                              window.msRequestAnimationFrame;

  // catch when fully scrolled to the bottom and attempting to 
  // scroll to last section - which is already visible
  if(body.offsetHeight + body.scrollTop >= body.scrollHeight
    && (start < val)) {
    return;
  }

  // nothing to do
  if(val === start) {
    return; 
  }

  // perform the animation
  function doScroll() {
    var value = easeOutQuad(iteration, start, diff, duration);
    body.scrollTop = value < 0 ? -value : value;
    if(iteration >= duration) {
      body.scrollTop = val;
      return; 
    }
    requestAnimationFrame(doScroll);
    iteration++;
  }

  doScroll();
}

proto.start = start;
proto.scrollTo = scrollTo;
proto.scrollToHash = scrollToHash;

module.exports = Application;
