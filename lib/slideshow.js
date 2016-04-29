var $ = require('air');

function Slideshow(opts) {

  var scope = this;

  this.slides = require('./slides');
  this.playing = false;
  this.index = -1;

  this.controls = $('.controls');

  this.controls.on('click', function(e) {
    e.stopImmediatePropagation();
  })

  this.controls.find('li').each(function(el, index) {
    el = $(el);
    el.on('click', function() {
      scope.select(index);
    })
  })

  this.resize = opts.resize;

  // must match css animation duration
  this.duration = 1050;

  // pause before showing first slide
  this.initial = 0;

  // pause between slides
  this.delay = 3000;

  // element that triggers play/pause
  this.trigger = $('header');
  this.trigger.on('click', this.toggle.bind(this));

  var pause = this.pause = $('.play-pause');

  this.trigger.on('mouseover', function() {
    pause.css({opacity: '1'}); 
  })

  this.trigger.on('mouseout', function() {
    pause.css({opacity: '0'}); 
  })
}

var proto = Slideshow.prototype;

function toggle() {
  if(!this.playing) {
    this.pause.css({opacity: '0'}); 
    this.start();
  }else{
    this.stop();
  }
}

function preload(index) {

  if(!this.playing) {
    return; 
  }

  var url = this.slides[index]
    , el = $.el('img');

  function onImageLoad() {
    this.show(url);
  }

  el.attr({src: url});
  el.addClass('preload');

  el.on('load', onImageLoad.bind(this));

  var items = this.controls.find('li')
    , item = $(items.get(index));

  items.removeClass('selected');
  item.addClass('selected');

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
  var previous = $('header .slide')
    , header = $.el('div', {class: 'slide'})
    , style = {
        'background-image': 'url(' + url +  ')',
        opacity: '0',
        'z-index': '1'
      };

  previous.css({position: 'absolute', 'z-index': '-2'})
  header.css(style);

  previous.get(0).parentNode.insertBefore(
    header.get(0), this.controls.get(0));

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

function start(index) {
  if(this.playing) {
    return;
  }

  $('.menu, .leader').addClass('transparent');

  this.playing = true;
  this.preload(index !== undefined ? index : this.next());
}

function stop() {
  if(!this.playing) {
    return;
  }

  $('.menu, .leader').removeClass('transparent');

  clearTimeout(this.waiter);
  this.playing = false;
}

function select(index) {
  if(index < 0) {
    index = 0;
  }else if(index >= this.slides.length) {
    index = this.slides.length - 1; 
  }

  if(index === this.index) {
    return; 
  }

  this.index = index;
  if(this.playing) {
    this.stop();
    this.start(this.index);
  }else{
    this.start(this.index);
  }
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
proto.select = select;
proto.next = next;
proto.stop = stop;
proto.toggle = toggle;
proto.wait = wait;

module.exports = Slideshow;
