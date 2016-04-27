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
    , href = el.attr('href')
    , target = $('[id="' + href.replace(/^#/, '') + '"]');

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
}

function start() {
  var images = this.images;
  $(this.body).on('scroll', onScroll.bind(this));

  this.links.on('click', onNavigate.bind(this))

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
  var startValue = this.body.scrollTop
    , body = this.body
    , iteration = 0
    , duration = 50
    , diff = val > startValue ? startValue - val : val - startValue
    , requestAnimationFrame = window.requestAnimationFrame || 
                              window.mozRequestAnimationFrame || 
                              window.webkitRequestAnimationFrame || 
                              window.msRequestAnimationFrame;

  // nothing to do
  if(val === startValue) {
    return; 
  }

  // perform the animation
  function doScroll() {
    var value = easeOutQuad(iteration, startValue, diff, duration);
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
proto.switchImages = switchImages;

module.exports = Application;
