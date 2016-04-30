var $ = require('air');

function ImageGallery() {
  this.modal = $('.modal');
  var data = require('./gallery.json')
    , scope = this;
  console.log(data);

  this.modal.find('.close').on('click', function() {
    scope.close();
  })
}

var proto = ImageGallery.prototype;

function start() {
  console.log('gallery start');
  this.modal.removeClass('hidden');
}

function load() {

}

function close() {
  this.modal.addClass('hidden');
}

proto.start = start;
proto.load = load;
proto.close = close;

module.exports = ImageGallery;
