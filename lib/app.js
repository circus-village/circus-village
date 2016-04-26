var $ = require('air');

$.plugin([
  require('air/class'),
  require('air/event')
])

function Application() {
  this.body = $('body').get(0);
  this.top = $('a[href="#top"]');
}

var proto = Application.prototype;

function onTop(e) {
  e.preventDefault();
  this.scrollTo(0);
}

function start() {
  console.log(this.body);

  this.top.on('click', onTop.bind(this));
}

function scrollTo(val) {
  this.body.scrollTop = val;
}

proto.start = start;
proto.scrollTo = scrollTo;

module.exports = Application;
