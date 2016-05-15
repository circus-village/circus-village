var $ = require('air')
  , preloader = require('./preloader');

function Slideshow(opts) {

  var scope = this
    , i
    , item
    , img;

  this.base = 'assets/img/slides/';
  this.slides = require('./slides.json');
  this.playing = false;
  this.index = -1;

  this.controls = $('.controls');

  // initialize the navigation controls for the slideshow
  for(i = 0;i < this.slides.length;i++) {
    item = $.el('li');
    img = $.el('img', {src: 'assets/img/bullet.svg', alt: this.slides[i]});
    item.append(img);
    this.controls.find('ul').append(item);
  }

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

  // pause between slides
  this.delay = 3000;

  // element that triggers play/pause
  this.trigger = $('header');
  this.trigger.on('click', this.toggle.bind(this));
}

var proto = Slideshow.prototype;

function toggle() {
  if(!this.playing) {
    this.start();
  }else{
    this.stop();
  }
}

function preload(index) {

  if(!this.playing) {
    return; 
  }

  this.loading = true;

  var url = this.base + this.slides[index]
    , scope = this
    , el = $.el('img');

  function progress(img, ratio) {
    $('.progress').css(
      {opacity: '' + ratio, width: Math.round(ratio * 100) + '%'});
  }

  preloader(url, progress, function() {
    $('.progress').css({opacity: '0', transition: 'opacity 0.5s ease'});
    scope.show(url);
  });

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

  previous.css({position: 'absolute', 'z-index': '-2', left: '0', top: '0'})
  header.css(style);

  previous.get(0).parentNode.insertBefore(
    header.get(0), this.controls.get(0));

  this.resize(null, header);

  function remove() {
    $('header').removeClass('welcome');
    this.loading = false;
    if(this.queued) {
      this.start(this.queued); 
      this.queued = null;
      return;
    }
    previous.remove();
    this.wait();
  }

  header.on('transitionend', remove.bind(this));

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

  if(this.loading) {
    // queue the item for animation complete
    this.queued = index;
    return;
  }

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
