var $ = require('air');

$.plugin([
  require('air/attr'),
  require('air/class'),
  require('air/create'),
  require('air/css'),
  require('air/event'),
  require('air/parent'),
  require('air/prepend'),
  require('air/remove')
])

function Application() {
  this.body = $('#scroll').get(0);
  this.menu = $('.menu');
  this.links = $('a[href^="#"]');
  this.images = $('.info > p > img');
}

var proto = Application.prototype;

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
  }else{
    this.menu.addClass('transparent'); 
  }
  this.previous = val;
}

function start() {
  var images = this.images;
  $(this.body).on('scroll', onScroll.bind(this));

  this.links.on('click', onNavigate.bind(this))

  function onPopState(e) {
    e.preventDefault();
      //console.log('has state: ' + e.state);
    if(!e.state) {
      return this.scrollTo(0);
    }else if(
      e.state && document.location.hash && this.previous !== undefined) {
      //console.log('has state: ' + this.body.scrollTop);
      //console.log('has state: ' + this.previous);
      //console.log('has state: ' + document.location.hash);
      
      //this.body.scrollTop = this.previous;
      //this.scrollToHash(document.location.hash);
    }
  }

  // allow animated scroll on page load
  this.body.scrollTop = 0;

  function onLoad(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var hash = document.location.hash;
    if(hash) {
      this.scrollToHash(hash);
    }
  }

  //$(window).on('hashchange', function(e) {
    //e.preventDefault();
    //e.stopImmediatePropagation();
    //console.log('hash change: ' + document.location.hash); 
  //});

  $(window).on('load', onLoad.bind(this))
  $(window).on('popstate', onPopState.bind(this));

  function isComplete() {
    var completed = true;
    images.each(function(el) {
      completed = completed && el.complete;
    })
    return completed;
  }

  function onImageLoad() {
    if(isComplete()) {
      this.switchImages(); 
    }
  }

  var completed = isComplete();
  if(!completed) {
    this.images.on('load', onImageLoad.bind(this));
  }else{
    this.switchImages();  
  }
}

function switchImages() {
  if(this.switched) {
    return; 
  }

  this.images.each(function(el) {
    el = $(el);
    var src = el.attr('src')
      , img = $.create('img', {});
    $(img).css(
      {width: '280px', height: '187px', background: 'url(' + src + ')'});
    el.parent().prepend(img);
    el.remove();
  })
  this.switched = true;
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
proto.switchImages = switchImages;

module.exports = Application;
