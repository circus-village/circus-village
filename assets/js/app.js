(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = require('air');

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

function Application() {
  var Slideshow = require('./slideshow')
    , Gallery = require('./image-gallery');
  this.slideshow = new Slideshow({resize: resize});
  this.gallery = new Gallery(
    {viewport: viewport, navigate: this.navigate.bind(this)});
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

  this.navigate(href);

  if(history) {
    history.pushState({hash: href}, el.attr('title'), href); 
  }

  return false;
}

function navigate(href, replace) {

  if(replace) {
    history.replaceState({hash: href}, null, href);
    return;
  }

  var id = href.replace(/^#/, '')
    , target = $('[id="' + id + '"]');

  if(target.length) {
    var rect = target.get(0).getBoundingClientRect()
      , val = this.body.scrollTop + rect.top;

    this.gallery.close(); 
    this.scrollTo(val);
  }else if(id === 'gallery') {
    this.gallery.start(null, document.location.hash); 
  }else{
    var item = this.gallery.find(id);
    if(item) {
      this.gallery.start(item, document.location.hash);
    }
  }
}

function onScroll() {
  var val = this.body.scrollTop;
  if(!val) {
    this.menu.removeClass('transparent');
    this.leader.removeClass('transparent');
    this.controls.show();
  }else{
    this.menu.addClass('transparent'); 
    this.leader.addClass('transparent');
    this.controls.hide();
    this.slideshow.stop();
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
  resize();

  var blurPlaying;

  // allow animated scroll on page load
  this.body.scrollTop = 0;

  // handle navigation on back button
  function onPopState(e) {
    e.preventDefault();
    if(!e.state) {
      //this.gallery.close();
    }else{
      //this.navigate(e.state.hash);
    }
  }

  // gallery navigation on hash change
  function onHashChange(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var hash = document.location.hash;
    if(hash) {
      this.navigate(hash);
    }
  }

  // check for hash on load
  function onLoad(e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    var hash = document.location.hash;
    if(hash) {
      this.navigate(hash);
    }
  }

  // stop slideshow on blur
  function blur() {
    blurPlaying = this.slideshow.playing;
    this.slideshow.stop();
  }

  // restart slideshow on focus
  function focus() {
    if(blurPlaying) {
      this.slideshow.start();
    }
  }

  $(this.body).on('scroll', onScroll.bind(this));
  this.links.on('click', onNavigate.bind(this))

  $(window).on('resize', resize);
  $(window).on('blur', blur.bind(this));
  $(window).on('focus', focus.bind(this));

  this.onHashChange = onHashChange.bind(this);

  $(window).on('load', onLoad.bind(this))
  $(window).on('hashchange', this.onHashChange);
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
proto.navigate = navigate;

module.exports = Application;

},{"./image-gallery":3,"./slideshow":7,"air":8,"air/append":10,"air/attr":11,"air/class":12,"air/create":13,"air/css":14,"air/data":15,"air/event":16,"air/find":17,"air/hidden":18,"air/parent":19,"air/prepend":20,"air/remove":21}],2:[function(require,module,exports){
module.exports=[
  {
    "name": "bamboo-hut.jpg",
    "width": 3264,
    "height": 2448
  },
  {
    "name": "bathing.jpg",
    "width": 1068,
    "height": 712
  },
  {
    "name": "bonfire-decorations.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "bonfire-night.jpg",
    "width": 960,
    "height": 640
  },
  {
    "name": "bridge.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "danny-paradise.jpg",
    "width": 3264,
    "height": 2448
  },
  {
    "name": "food.jpg",
    "width": 960,
    "height": 640
  },
  {
    "name": "garden.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "jungle-bungalow.jpg",
    "width": 720,
    "height": 960
  },
  {
    "name": "massage-class.jpg",
    "width": 960,
    "height": 720
  },
  {
    "name": "natural-pool.jpg",
    "width": 960,
    "height": 720
  },
  {
    "name": "pizza-oven.jpg",
    "width": 1088,
    "height": 726
  },
  {
    "name": "pizza.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "pond.jpg",
    "width": 1088,
    "height": 726
  },
  {
    "name": "pool-tube.jpg",
    "width": 1088,
    "height": 726
  },
  {
    "name": "sauna.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "teak-house-interior.jpg",
    "width": 2048,
    "height": 1366
  },
  {
    "name": "teak-house.jpg",
    "width": 2448,
    "height": 2448
  },
  {
    "name": "waterfalls.jpg",
    "width": 1088,
    "height": 726
  }
]
},{}],3:[function(require,module,exports){
var $ = require('air');

function ImageGallery(opts) {
  this.modal = $('.modal');

  var scope = this
    , modal = this.modal;

  this.modal.find('.close').on('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var hash = scope.hash;
    scope.navigate(hash, true);
    scope.close();
  })

  this.modal.find('[href="#previous"]').on('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    scope.previous();
  })

  this.modal.find('[href="#next"]').on('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    scope.next();
  })

  $(window).on('resize', this.constrain.bind(this));

  $(window).on('keyup', function(e) {
    if(!modal.hasClass('hidden')) {
      // dismiss on esc key
      if(e.keyCode === 27) {
        scope.close();
      }else if(e.keyCode === 39) {
        scope.next();
      }else if(e.keyCode === 37) {
        scope.previous();
      }
    }
  })

  this.navigate = opts.navigate;
  this.viewport = opts.viewport;

  this.base = 'assets/img/gallery/';
  this.data = require('./gallery.json')
  this.index = 0;

  this.preview = $('.modal > .preview > .images');
  this.rendered = false;
}

var proto = ImageGallery.prototype;

function start(item, hash) {
  this.modal.removeClass('hidden');
  if(!this.hash) {
    console.log('setting hash: ' + hash);
    this.hash = hash;
  }
  this.layout();
  this.load(item || this.item(this.index));
}

function item(index) {
  return this.data[index];
}

function load(item) {

  if(item === this.current) {
    return;
  }

  var src = this.base + item.name
    , attrs = {src: src}
    , container = $.el('div', {class: 'vignette'})
    , img;

  $('.modal > .viewer > .image > *').remove();

  img = $.el('img', attrs);

  container.append(img);
  this.constrain(null, img, item);
  $('.modal > .viewer > .image').append(container);

  setTimeout(function() {
    img.addClass('opaque');
  }, 10);

  this.current = item;

  // set selected image preview
  $('.preview > .images').find('img').removeClass('selected');
  $('.preview > .images').find(
    'img[data-id="' + key(item.name) + '"]').addClass('selected');
}

function constrain(e, el, item) {

  if(this.modal.hasClass('hidden')) {
    return;
  }

  el = el || $('.modal > .viewer > .image img');
  item = item || this.current;
  if(!item) {
    return; 
  }

  var attrs = {}
    , w
    , h
    , iw = item.width
    , ih = item.height
    , landscape = iw > ih
    , padding = 20
    , ratio = 1
    , preview = $('.modal .preview')
    , viewport = this.viewport();

  // the image cell is 80% so subtract 20% for correct width
  var vw = viewport.width - (viewport.width * 0.2)
    , vh = viewport.height;

  // account for when the thumbnail preview is visible
  if(preview.css('display') !== 'none') {
    vh -= parseInt(preview.css('height').replace(/px$/, '')); 
  }

  // clear previous attributes when resizing
  el.attr('width', null);
  el.attr('height', null);

  // get current remaining attributes (maintains existing `src`)
  attrs = el.attr();

  // constraints including padding
  w = Math.abs(vw - (padding * 2));
  h = Math.abs(vh - (padding * 2));

  // must not go smaller than this size
  w = Math.max(w, 128);
  h = Math.max(h, 128);

  if(iw > w || ih > h) {

    if(landscape) {
      ratio = w / iw; 
      attrs.width = w + 'px';

      // after constrain on width - is the height too large?
      if((ih * ratio) > h) {
        delete attrs.width; 
        attrs.height = h + 'px';
      }

    }else{
      ratio = h / ih;
      attrs.height = h + 'px';

      // after constrain on height - is the width too large?
      if((iw * ratio) > w) {
        delete attrs.height; 
        attrs.width = w + 'px';
      }
    }
  }

  el.attr(attrs);
  
  return attrs;
}

function close() {
  console.log('closing gallery');
  this.modal.addClass('hidden');
  this.hash = null;
}

function layout() {
  if(this.rendered) {
    return; 
  }

  var index = 0
    , list = this.data.slice(0)
    , base = this.base
    , preview = this.preview;

  function next() {
    var item = list.shift();
    if(!item) {
      return; 
    }

    var src = base + item.name
      , id = key(item.name)
      , anchor = $.el('a', {href: '#' + id})
      , img = $.el('img', {src: src});

    img.data('index', '' + index);
    img.data('id', '' + id);

    anchor.append(img);

    preview.append(anchor);
    index++;
    next();
  }

  next();
  this.rendered = true;
}

function key(name) {
  return name.replace(/\.jpg$/, '');
}

function next() {
  this.index++;
  if(this.index >= this.data.length) {
    this.index = 0; 
  }
  var item = this.item(this.index);
  document.location.hash = '#' + key(item.name);
}

function previous() {
  this.index--;
  if(this.index < 0) {
    this.index = this.data.length - 1; 
  }
  var item = this.item(this.index);
  document.location.hash = '#' + key(item.name);
}

function find(id) {
  for(var i = 0;i < this.data.length;i++) {
    if(key(this.data[i].name) === id) {
      return this.data[i];
    }  
  }
}

proto.start = start;
proto.item = item;
proto.load = load;
proto.close = close;
proto.next = next;
proto.find = find;
proto.previous = previous;
proto.constrain = constrain;
proto.layout = layout;

module.exports = ImageGallery;

},{"./gallery.json":2,"air":8}],4:[function(require,module,exports){
var Application = require('./app')
  , app = new Application();
app.start();

},{"./app":1}],5:[function(require,module,exports){
function preloader(url, progress, callback) {
  var img = new Image(),
      req = new XMLHttpRequest();

  img.loaded = 0;

  req.open('GET', url, true);

  req.onload = function() {
    if(callback) {
      callback(img);
    }
  }

  req.onprogress = function(e) {
    if(e.lengthComputable) {
      img.loaded = (e.loaded / e.total);
      if(progress) {
        progress(img, img.loaded); 
      }
    }
  }

  req.onloadstart = function() {
    img.loaded = 0;
    progress(img, img.loaded); 
  }

  req.onloadend = function() {
    img.loaded = 1;
  }

  req.send();
}

module.exports = preloader;

},{}],6:[function(require,module,exports){
var slides = [
  'assets/img/slides/shala.jpg',
  'assets/img/slides/group-massage.jpg',
  'assets/img/slides/green-yoga.jpg',
  'assets/img/slides/shrine.jpg',
  'assets/img/slides/laos-kids.jpg',
  'assets/img/slides/padi.jpg',
  'assets/img/slides/bonfire.jpg',
  'assets/img/slides/kuang-si.jpg'
];

module.exports = slides;

},{}],7:[function(require,module,exports){
var $ = require('air')
  , preloader = require('./preloader');

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

  this.loading = true;

  var url = this.slides[index]
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

  previous.css({position: 'absolute', 'z-index': '-2'})
  header.css(style);

  previous.get(0).parentNode.insertBefore(
    header.get(0), this.controls.get(0));

  this.resize(null, header);

  function remove() {
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

},{"./preloader":5,"./slides":6,"air":8}],8:[function(require,module,exports){
module.exports = require('./lib/air');

},{"./lib/air":9}],9:[function(require,module,exports){
;(function() {
  'use strict'

  var plug = require('zephyr');

  /**
   *  Chainable wrapper class.
   *
   *  This is the core of the entire plugin system and typically you extend
   *  functionality by adding methods to the prototype of this function.
   *
   *  However a plugin may also add static methods to the main function,
   *  see the `create` plugin for an example of adding static methods.
   *
   *  This implementation targets modern browsers (IE9+) and requires that
   *  the array methods `isArray`, `forEach` and `filter` are available,
   *  for older browsers you will need to include polyfills.
   *
   *  @param el A selector, DOM element, array of elements or Air instance.
   *  @param context The context element for a selector.
   */
  function Air(el, context) {
    if(!(this instanceof Air)) {
      return new Air(el, context);
    }
    if(typeof context === 'string') {
      context = document.querySelector(context);
    }else if(context instanceof Air) {
      context = context.get(0);
    }
    context = context || document;
    // NOTE: do not pass empty string to querySelectorAll
    if(!arguments.length || el === '') {
      this.dom = []; 
    }else{
      this.dom = typeof el === 'string' ? context.querySelectorAll(el) : el;
    }
    if(el instanceof Air) {
      this.dom = el.dom.slice(0);
    }else if(!Array.isArray(el)) {
      if(this.dom instanceof NodeList) {
        this.dom = Array.prototype.slice.call(this.dom);
      }else if(el) { 
        this.dom = ((el instanceof Node) || el === window) ? [el] : [];
      }
    }

    // shortcut to Array.prototype.slice
    this.slice = Array.prototype.slice;
  }

  var proto = Air.prototype
    , air = plug({proto: proto, type: Air});

  /**
   *  Get the number of wrapped DOM elements.
   */
  Object.defineProperty(
    proto, 'length', {get: function(){return this.dom.length}});

  /**
   *  Get the DOM element at the specified index.
   */
  proto.get = function get(index) {
    if(index === undefined) {
      return this.dom;
    }
    return this.dom[index];
  }

  /**
   *  Iterate the encapsulated DOM elements.
   */
  proto.each = function each(cb) {
    this.dom.forEach(cb);
    return this;
  }

  // expose class reference
  air.Air = Air;

  // alias main function
  proto.air = air;

  module.exports = air;
})();

},{"zephyr":22}],10:[function(require,module,exports){
/**
 *  Insert content, specified by the parameter, to the end of each
 *  element in the set of matched elements.
 */
function append() {
  var i, l = this.length, el, args = this.slice.call(arguments);
  function it(node, index) {
    // content elements to insert
    el.each(function(ins) {
      ins = (index < (l - 1)) ? ins.cloneNode(true) : ins;
      node.appendChild(ins);
    });
  }
  for(i = 0;i < args.length;i++) {
    // wrap content
    el = this.air(args[i]);
    // matched parent elements (targets)
    this.each(it);
  }
  return this;
}

module.exports = function() {
  this.append = append;
}

},{}],11:[function(require,module,exports){
/**
 *  Get the value of an attribute for the first element in the set of
 *  matched elements or set one or more attributes for every matched element.
 */
function attr(key, val) {
  var i, attrs, map = {};
  if(!this.length || key !== undefined && !Boolean(key)) {
    return this;
  }

  if(key === undefined && val === undefined) {
    // no args, get all attributes for first element as object
    attrs = this.dom[0].attributes;
    // convert NamedNodeMap to plain object
    for(i = 0;i < attrs.length;i++) {
      // NOTE: nodeValue is deprecated, check support for `value` in IE9!
      map[attrs[i].name] = attrs[i].value;
    }
    return map;
  }else if(typeof key === 'string' && !val) {
    // delete attribute on all matched elements
    if(val === null) {
      this.each(function(el) {
        el.removeAttribute(key);
      })
      return this;
    }
    // get attribute for first matched elements
    return this.dom[0].getAttribute(key);
  // handle object map of attributes
  }else {
    this.each(function(el) {
      if(typeof key === 'object') {
        for(var z in key) {
          if(key[z] === null) {
            el.removeAttribute(z);
            continue;
          }
          el.setAttribute(z, key[z]);
        }
      }else{
        el.setAttribute(key, val);
      }
    });
  }
  return this;
}

module.exports = function() {
  this.attr = attr;
}

},{}],12:[function(require,module,exports){
/**
 *  IE9 does not support `Element.classList`, when support for IE9 is
 *  dropped this can be refactored.
 */
var attr = 'class';

/**
 *  Adds the specified class(es) to each of the set of matched elements.
 */
function addClass(className) {
  if(!className) {
    return this;
  }
  var classes = className.split(/\s+/);
  this.each(function(el) {
    var val = el.getAttribute(attr);
    var names = val ? val.split(/\s+/) : [];
    classes.forEach(function(nm) {
      if(!~names.indexOf(nm)) {
        names.push(nm);
      }
    });
    el.setAttribute(attr, names.join(' '));
  });
  return this;
}

/**
 *  Determine whether any of the matched elements are assigned the
 *  given class.
 */
function hasClass(className) {
  var i, val;
  for(i = 0;i < this.length;i++) {
    val = this.get(i).getAttribute(attr);
    val = val ? val.split(/\s+/) : [];
    if(~val.indexOf(className)) {
      return true;
    }
  }
  return false;
}

/**
 *  Remove a single class, multiple classes, or all classes from
 *  each element in the set of matched elements.
 */
function removeClass(className) {
  if(!className) {
    // remove all classes from all matched elements
    this.each(function(el) {
      el.removeAttribute(attr);
    });
    return this;
  }
  var classes = className.split(/\s+/);
  this.each(function(el) {
    var val = el.getAttribute(attr);
    // no class attribute - nothing to remove
    if(!val) {
      return;
    }
    var names = val.split(/\s+/);
    names = names.filter(function(nm) {
      return ~classes.indexOf(nm) ? false : nm;
    });
    el.setAttribute(attr, names.join(' '));
  });
  return this;
}

/**
 *  Add or remove one or more classes from each element in the set of 
 *  matched elements depending on the class's presence.
 */
function toggleClass(className) {
  var classes = className.split(/\s+/)
    , name
    , i;
  for(i = 0;i < classes.length;i++) {
    name = classes[i];
    if(this.hasClass(name)) {
      this.removeClass(name)
    }else{
      this.addClass(name)
    }
  }
}

module.exports = function() {
  this.addClass = addClass;
  this.hasClass = hasClass;
  this.removeClass = removeClass;
  this.toggleClass = toggleClass;
}

},{}],13:[function(require,module,exports){
/**
 *  Create a DOM element.
 *
 *  @param tag The element tag name.
 */
function create(tag) {
  return document.createElement(tag);
}

/**
 *  Create a text node.
 *
 *  @param txt The text for the node.
 */
function text(txt) {
  return document.createTextNode(txt);
}

/**
 *  Create a wrapped DOM element.
 *
 *  @param tag The element tag name.
 *  @param attrs Object map of element attributes.
 */
function el(tag, attrs) {
  var n = el.air(create(tag));
  if(attrs && n.attr) {
    return n.attr(attrs);
  }
  return n;
}

module.exports = function() {
  // static method needs access to main function
  // to wrap the created element
  el.air = this.air;

  this.air.create = create;
  this.air.el = el;
  this.air.text = text;
}

// optional `attr` dependency
//plugin.deps = {attr: false};

},{}],14:[function(require,module,exports){
/**
 *  Get the value of a computed style property for the first element
 *  in the set of matched elements or set one or more CSS properties
 *  for every matched element.
 */
function css(key, val) {
  var style, props;
  if(!this.length) {
    return this;
  }

  if(key && typeof key === 'object') {
    props = key;
  }else if(key && val) {
    props = {};
    props[key] = val;
  }

  // get style object
  if(key === undefined) {
    style = window.getComputedStyle(this.dom[0], null);
    // TODO: convert to plain object map?
    // for the moment return CSSStyleDeclaration
    return style;
  // get single style property value
  }else if(typeof key === 'string' && !val) {
    style = window.getComputedStyle(this.dom[0], null);
    return style.getPropertyValue(key);
  }

  // set inline styles
  this.each(function(el) {
    el.style = el.style;
    for(var z in props) {
      el.style[z] = '' + props[z];
    }
  });
  return this;
}

module.exports = function() {
  this.css = css;
}

},{}],15:[function(require,module,exports){
var prefix = 'data-';

/**
 *  Get a data attribute of the first matched element or
 *  set `data` attribute(s) on all matched elements.
 *
 *  Requires that the `attr` plugin has been loaded.
 */
function data(key, val) {
  var o = {}, z;

  function inject(name) {
    if(typeof name === 'string' && name.indexOf(prefix) !== 0) {
      name = prefix + name;
    }
    return name;
  }

  if(typeof key === 'string') {
    key = inject(key);
  }else if(typeof key === 'object') {
    for(z in key) {
      o[inject(z)] = key[z];
    }
    key = o;
  }

  return this.attr(key, val);
}

module.exports = function() {
  this.data = data;
}

// required `attr` dependency
//plugin.deps = {attr: true};

},{}],16:[function(require,module,exports){
function on(nm, cb, capture) {
  this.each(function(el) {
    el.addEventListener(nm, cb, capture);
  });
  return this;
}

function off(nm, cb, capture) {
  this.each(function(el) {
    el.removeEventListener(nm, cb, capture);
  });
  return this;
}

function trigger(event, bubbles, cancelable, type) {
  bubbles = typeof(bubbles) === undefined ? true : bubbles;
  cancelable = typeof(cancelable) === undefined ? true : cancelable;
  type = type || 'HTMLEvents';
  this.each(function(el) {
    var evt;
    if(document.createEvent) {
      // dispatch for firefox + others
      evt = document.createEvent(type);
      // event type,bubbling,cancelable
      evt.initEvent(event, bubbles, cancelable);
      return !el.dispatchEvent(evt);
    }else{
      // dispatch for IE
      evt = document.createEventObject();
      return el.fireEvent('on' + event, evt)
    }
  });
}

function click(bubbles, cancelable) {
  return this.trigger('click', bubbles, cancelable, 'MouseEvents');
}

module.exports = function() {
  this.on = on;
  this.off = off;
  this.trigger = trigger;
  this.click = click;
}

},{}],17:[function(require,module,exports){
/**
 *  Get the descendants of each element in the current set
 *  of matched elements, filtered by a selector.
 */
function find(selector) {
  var arr = [], $ = this.air, slice = this.slice;
  this.each(function(el) {
    arr = arr.concat(slice.call($(selector, el).dom));
  });
  return $(arr);
}

module.exports = function() {
  this.find = find;
}

},{}],18:[function(require,module,exports){
var attr = 'hidden';

/**
 *  Modify the hidden attribute.
 */
function hidden(val) {
  // return whether the first element in the set
  // is hidden
  if(val === undefined) {
    return this.attr(attr);
  // hide on truthy
  }else if(val) {
    this.attr(attr, '1');
  // show on falsey
  }else{
    this.attr(attr, null);
  }
  return this;
}

function show(fn) {
  this.hidden(false);
  if(typeof fn === 'function') {
    fn.call(this);
  }
  return this;
}

function hide(fn) {
  this.hidden(true);
  if(typeof fn === 'function') {
    fn.call(this);
  }
  return this.hidden(true);
}

module.exports = function() {
  this.hidden = hidden;
  this.show = show;
  this.hide = hide;
}

},{}],19:[function(require,module,exports){
/**
 *  Get the parent of each element in the current set of matched elements,
 *  optionally filtered by a selector.
 *
 *  TODO: implement selector filtering
 */
function parent(/*selector*/) {
  var arr = [], $ = this.air, slice = this.slice;
  this.each(function(el) {
    arr = arr.concat(slice.call($(el.parentNode).dom));
  });
  return $(arr);
}

module.exports = function() {
  this.parent = parent;
}

},{}],20:[function(require,module,exports){
/**
 *  Insert content, specified by the parameter, to the beginning of each
 *  element in the set of matched elements.
 */
function prepend() {
  var i, l = this.length, el, args = this.slice.call(arguments);
  function it(node, index) {
    // content elements to insert
    el.each(function(ins) {
      ins = (index < (l - 1)) ? ins.cloneNode(true) : ins;
      // no children yet - append
      if(!node.firstChild) {
        node.appendChild(ins);
      // insert before first child
      }else{
        node.insertBefore(ins, node.firstChild);
      }
    });
  }
  for(i = 0;i < args.length;i++) {
    // wrap content
    el = this.air(args[i]);
    // matched parent elements (targets)
    this.each(it);
  }
  return this;
}

module.exports = function() {
  this.prepend = prepend;
}

},{}],21:[function(require,module,exports){
/**
 *  Remove all matched elements.
 */
function remove() {
  var i, el;
  for(i = 0;i < this.length;i++) {
    el = this.dom[i];
    // if for some reason this point to the document element
    // an exception will occur, pretty hard to reproduce so
    // going to let it slide
    if(el.parentNode) {
      el.parentNode.removeChild(el);
      this.dom.splice(i, 1);
      i--;
    }
  }
  return this;
}

module.exports = function() {
  this.remove = remove;
}

},{}],22:[function(require,module,exports){
;(function() {
  'use strict'

  function plug(opts) {
    opts = opts || {};

    /**
     *  Default plugin class.
     */
    function Component(){}

    var main
      , hooks = opts.hooks
      , proto = opts.proto || Component.prototype;

    /**
     *  Plugin method.
     *
     *  @param plugins Array of plugin functions.
     */
    function plugin(plugins) {
      var z, method, conf;
      for(z in plugins) {
        if(typeof plugins[z] === 'function') {
          method = plugins[z];
        }else{
          method = plugins[z].plugin;
          conf = plugins[z].conf;
        }
        if(opts.field && typeof method[opts.field] === 'function') {
          method = method[opts.field];
        }
        method.call(proto, conf);
      }
      return main;
    }

    /**
     *  Create an instance of the class represented by *Type* and proxy
     *  all arguments to the constructor.
     */
    function construct() {
      var args = Array.prototype.slice.call(arguments);
      function Fn() {
        return main.Type.apply(this, args);
      }
      Fn.prototype = main.Type.prototype;
      return new Fn();
    }

    /**
     *  Invoke constructor hooks by proxying to the main construct
     *  function and invoking registered hook functions in the scope
     *  of the created component.
     */
    function hook() {
      var comp = hook.proxy.apply(null, arguments);
      for(var i = 0;i < hooks.length;i++) {
        hooks[i].apply(comp, arguments);
      }
      return comp;
    }

    /**
     *  Register a constructor hook function.
     *
     *  @param fn The constructor hook.
     */
    function register(fn) {
      if(typeof fn === 'function' && !~hooks.indexOf(fn)) {
        hooks.push(fn);
      }
    }

    main = opts.main || construct;

    // hooks enabled, wrap main function aop style
    if(Array.isArray(hooks)) {
      hook.proxy = main;
      main = hook;
    }

    // class to construct
    main.Type = opts.type || Component;

    // static and instance plugin method
    main.plugin = proto.plugin = opts.plugin || plugin;

    // hooks enabled, decorate with register function
    if(Array.isArray(hooks)) {
      main.plugin.register = register;
    }

    // reference to the main function for static assignment
    proto.main = main;

    return main;
  }

  module.exports = plug;
})();

},{}]},{},[4]);
