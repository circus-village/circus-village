var $ = require('air');

function Slideshow() {
  this.slides = require('./slides');
  this.preloading = false;
  this.playing = false;
  this.index = -1;
}

var proto = Slideshow.prototype;

function preload(index) {
  var slide = this.slides[index]
    , url = slide.url
    , el = $.el('img');

  console.log(url);

  function onImageLoad() {
    console.log('image loaded...');
    $('header').css({'background-image': 'url(' + url +  ')'})
  }

  el.attr({src: url});
  el.addClass('preload');

  el.on('load', onImageLoad.bind(this));

  $('body').append(el);
}

function start() {
  if(this.playing) {
    return;
  }
  console.log('start slideshow..');
  this.preload(this.next());
  this.playing = true;
}

function stop() {
  if(!this.playing) {
    return;
  }
  console.log('stop slideshow..');
  this.playing = false;
}

function next() {
  this.index++;
  if(this.index >= this.slides.length) {
    this.index = -1; 
  }
  return this.index;
}

proto.start = start;
proto.preload = preload;
proto.next = next;
proto.stop = stop;

module.exports = Slideshow;
