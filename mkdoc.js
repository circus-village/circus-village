var mk = require('mktask')
var fs = require('fs-extra')

// @task slides build the list of slideshow images
function slides (cb) {
  var pth = 'src/assets/img/slides/'
  var files = fs.readdirSync(pth)

  fs.writeFileSync(
    'src/assets/js/_slides.json', JSON.stringify(files, undefined, 2))

  if (cb) {
    cb()
  }
}

// @task gallery build the list of photo gallery images and dimensions
function gallery (cb) {
  var pth = 'src/assets/img/gallery/'
  var sizeof = require('image-size')
  var files = fs.readdirSync(pth)
  var item
  var list = []

  function done () {
    // NOTE: useful to inspect the image data
    console.error(list)
    fs.writeFileSync(
      'src/assets/js/_gallery.js', 'module.exports = ' + JSON.stringify(list, undefined, 2))
    cb()
  }

  function next (err) {
    if (err) {
      return cb(err)
    }

    var file
    var dimensions
    var name = files.shift()

    if (!name) {
      return done()
    }

    file = pth + name

    try {
      dimensions = sizeof(file)
      item = {
        pid: name.replace(/\.jpg$/, ''),
        src: '/assets/img/gallery/' + name,
        w: dimensions.width,
        h: dimensions.height
      }

      list.push(item)
      next()
    } catch (e) {
      return cb(e)
    }
  }

  next()
}

// @task readme build the readme
function readme (cb) {
  mk.doc('doc/readme.md')
    .pipe(mk.pi())
    .pipe(mk.ref())
    .pipe(mk.abs())
    .pipe(mk.msg())
    .pipe(mk.toc({depth: 2}))
    .pipe(mk.out())
    .pipe(mk.dest('README.md'))
    .on('finish', cb)
}

mk.task(slides)
mk.task(gallery)
mk.task(readme)
