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
  this.body = $('body').get(0);
  this.menu = $('.menu');
  this.top = $('a[href="#top"]');
  this.images = $('.info > p > img');
}

var proto = Application.prototype;

function onTop(e) {
  e.preventDefault();
  this.scrollTo(0);
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
  $(document).on('scroll', onScroll.bind(this));
  this.top.on('click', onTop.bind(this));

  console.log('images length: ' + this.images.length);

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

function scrollTo(val) {
  this.body.scrollTop = val;
}

proto.start = start;
proto.scrollTo = scrollTo;
proto.switchImages = switchImages;

module.exports = Application;
