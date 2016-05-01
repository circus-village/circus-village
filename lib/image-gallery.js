var $ = require('air');

function ImageGallery() {
  this.modal = $('.modal');

  var scope = this
    , modal = this.modal;

  this.modal.find('.close').on('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
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
    , viewer = $('.modal > .viewer > .image').get(0);

  var vw = viewer.clientWidth
    , vh = viewer.clientHeight;

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

        //console.log('using height after width constrain: ' + vh);
        //console.log('using height after width constrain: ' + h);
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
  
  console.log('final attrs');
  console.log(attrs);

  return attrs;
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
    img.data('id', '' + key(item.name));

    preview.append(img);

    img.on('click', onPreviewClick)

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
proto.constrain = constrain;
proto.layout = layout;

module.exports = ImageGallery;
