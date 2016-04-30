var $ = require('air');

function ImageGallery() {
  this.modal = $('.modal');

  var scope = this;

  this.modal.find('.close').on('click', function(e) {
    e.preventDefault();
    scope.close();
  })

  this.modal.find('[href="#previous"]').on('click', function(e) {
    e.preventDefault();
    scope.previous();
  })

  this.modal.find('[href="#next"]').on('click', function(e) {
    e.preventDefault();
    scope.next();
  })

  this.base = 'assets/img/gallery/';
  this.data = require('./gallery.json')
  this.index = 0;

  this.preview = $('.modal > .preview > .images');
  this.rendered = false;
}

var proto = ImageGallery.prototype;

function start() {
  this.modal.removeClass('hidden');

  if(!this.rendered) {
    this.layout();
  }

  this.load(this.item(this.index));
}

function item(index) {
  return this.data[index];
}

function load(item) {
  var src = this.base + item.name
    , w
    , h
    , iw = item.width
    , ih = item.height
    , padding = 15
    , attrs = {src: src}
    , container = $.el('div', {class: 'vignette'})
    , img;

  $('.modal > .viewer > .image > *').remove();

  var viewer = $('.modal > .viewer > .image').get(0)
    , vw = viewer.clientWidth
    , vh = viewer.clientHeight;

  if(iw > vw) {
    w = vw; 
    attrs.width = (w - padding) + 'px';
  }

  if(ih > vh && !attrs.width) {
    h = vh; 
    attrs.height = (h - padding) + 'px';
  }

  img = $.el('img', attrs);

  container.append(img);
  $('.modal > .viewer > .image').append(container);
}

function close() {
  this.modal.addClass('hidden');
}

function layout() {

  if(this.rendered) {
    return; 
  }

  var scope = this
    , index = 0
    , list = this.data.slice(0)
    , base = this.base
    , preview = this.preview;

  function onPreviewClick(e) {
    var el = $(e.currentTarget);
    scope.index = parseInt(el.data('index'));
    scope.load(scope.item(scope.index));
  }

  function next() {
    var item = list.shift();
    if(!item) {
      return; 
    }

    var src = base + item.name
      , img = $.el('img', {src: src});

    img.data('index', '' + index);

    preview.append(img);

    img.on('click', onPreviewClick)

    index++;

    next();
  }

  next();

  this.rendered = true;
}

function next() {
  this.index++;
  if(this.index >= this.data.length) {
    this.index = 0; 
  }
  this.load(this.item(this.index));
}

function previous() {
  this.index--;
  if(this.index < 0) {
    this.index = this.data.length - 1; 
  }
  this.load(this.item(this.index));
}


proto.start = start;
proto.item = item;
proto.load = load;
proto.close = close;
proto.next = next;
proto.previous = previous;
proto.layout = layout;

module.exports = ImageGallery;
