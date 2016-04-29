var $ = require('air');

function Slideshow(opts) {
  this.slides = require('./slides');
  this.preloading = false;
  this.playing = false;
  this.index = -1;

  this.resize = opts.resize;

  // must match css animation duration
  this.duration = 1050;

  // pause before showing first slide
  this.initial = 5000;

  // pause between slides
  this.delay = 3000;
}

var proto = Slideshow.prototype;

function preload(index) {

  if(!this.playing) {
    return; 
  }

  var slide = this.slides[index]
    , url = slide.url
    , el = $.el('img');

  function onImageLoad() {
    this.show(url);
  }

  el.attr({src: url});
  el.addClass('preload');

  el.on('load', onImageLoad.bind(this));

  $('body').append(el);
}

function wait(delay) {
  delay = delay || this.delay;
  function pause() {
    this.preload(this.next());
  }
  this.waiter = setTimeout(pause.bind(this), delay);
}

function show(url) {
  var previous = $('header')
    , header = $.el('header')
    , style = {
        'background-image': 'url(' + url +  ')',
        opacity: '0',
        'z-index': '1'
      };

  previous.css({position: 'absolute', 'z-index': '-2'})
  header.css(style);

  previous.get(0).parentNode.insertBefore(
    header.get(0), previous.get(0));

  this.resize(null, header);

  function remove() {
    previous.remove();
    this.wait();
  }

  setTimeout(remove.bind(this), this.duration);

  setTimeout(function() {
    style.opacity = '1';
    header.css(style);
  }, 10);
}

function start() {
  if(this.playing) {
    return;
  }
  this.playing = true;
  this.wait(this.initial);
}

function stop() {
  if(!this.playing) {
    return;
  }
  clearTimeout(this.waiter);
  this.playing = false;
}

function next() {
  this.index++;
  if(this.index >= this.slides.length) {
    this.index = 0; 
  }
  return this.index;
}

proto.start = start;
proto.preload = preload;
proto.show = show;
proto.next = next;
proto.stop = stop;
proto.wait = wait;

module.exports = Slideshow;
