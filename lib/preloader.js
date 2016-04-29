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
