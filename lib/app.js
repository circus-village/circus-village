var $ = require('air');

$.plugin([
  require('air/class'),
  require('air/event')
])

function Application() {
  this.body = $('body').get(0);
  this.menu = $('.menu');
  this.top = $('a[href="#top"]');
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
  console.log(this.body);

  $(document).on('scroll', onScroll.bind(this));

  this.top.on('click', onTop.bind(this));
}

function scrollTo(val) {
  this.body.scrollTop = val;
}

proto.start = start;
proto.scrollTo = scrollTo;

module.exports = Application;
