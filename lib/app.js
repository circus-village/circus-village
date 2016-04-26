function Application() {
  console.log('new app');
}

var proto = Application.prototype;

function start() {

}

proto.start = start;

module.exports = Application;
