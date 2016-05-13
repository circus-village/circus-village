var mk = require('mktask')
  , events
  , bs
  , fs = require('fs-extra');

// @task events build the events list
events = require('./events');

// @task css build the css file
function css(cb) {
  var exec = require('child_process').execSync
    , cmd = 'cat css/reset.css css/fonts.css css/icons.css css/main.css'
        + ' > build/assets/css/style.css';
  exec(cmd);
  if(cb) {
    cb(); 
  }
}

function sync(/*cb*/) {
  var chokidar = require('chokidar');
  bs = require('browser-sync').create();

  bs.init({
    ghostMode: false,
    notify: false,
    logLevel: 'silent',
    injectChanges: false,
    files: [
      './build/assets/js/*.js',
      './build/assets/css/*.css',
      './build/index.html'
    ]
  });

  // watch css files
  chokidar.watch('css/*.css', {ignored: /[\/\\]\./})
    .on('change', function() {
      css();
    });

  // copy events re-order client-side js
  chokidar.watch('lib/events.js', {ignored: /[\/\\]\./})
    .on('change', function() {
      copy();
    });

  // watch js files
  chokidar.watch('lib/*.js', {ignored: /[\/\\]\./})
    .on('change', function() {
      js(function() {
        bs.reload(); 
      });
    });

  // watch source files
  chokidar.watch('doc/events', {ignored: /[\/\\]\./})
    .on('change', function() {
      mk.run([site], function(){
        bs.reload();
      });
    });
}

// @task copy static files to the build directory
function copy(cb) {
  var source = 'lib/events.js'
    , output = 'build/assets/js/events.js'
    , uglify = require('uglifyjs')
    , result = uglify.minify(source);

  fs.writeFileSync(output, result.code);
  if(cb) {
    cb(); 
  }
}

function serve() {
  var app = require('./server');
  app.listen(process.env.PORT || 3000);
}

// @task site build the site
function site(cb) {

  var page = 
    {
      title: 'Circus Village',
      meta: {
        description: 'Circus Village: School of Freedom',
        keywords: 
          'circus village, circus, village, retreat, massage, '
          + 'waterfall, river, kuang si, freedom, school of freedom'
      },
      header: 'doc/header.html',
      footer: 'doc/footer.html',
      app: ['assets/js/app.js'],
      style: [
        'assets/css/style.css'
      ],
      favicon: 'assets/favicon.png',
      element: 'div',
      attr: {
        class: 'events'
      }
    };

  if(this.args && this.args.flags.sync) {
    serve();
    sync();
  }

  var stream = mk.doc('doc/events.html')
    .pipe(mk.page(page))
    .pipe(mk.out({type: 'html'}))
    .pipe(mk.dest('build/index.html'))

  if(cb) {
    stream.once('finish', cb);
  }
}

// @task js build the client-side javascript
function js(cb) {
  var browserify = require('browserify')
    , b = browserify(
        ['./lib/main.js'], {paths: ['./node_modules/air/lib']})
    , bundle = b.bundle()
    , output = 'build/assets/js/app.js'
    , stream;

  stream = bundle
    .pipe(fs.createWriteStream(output));

  function done() {
    var uglify = require('uglifyjs')
      , result = uglify.minify(output);

    fs.writeFileSync(output, result.code);

    if(cb) {
      cb(); 
    }
  }

  stream.once('finish', done);
}

// @task gallery build the list of images and dimensions
function gallery(cb) {
  var pth = 'build/assets/img/gallery/'
    , ExifImage = require('exif')
    , files = fs.readdirSync(pth)
    , list = [];

  function done() {
    // NOTE: useful to inspect the image data
    console.error(list) 
    fs.writeFileSync('lib/gallery.json', JSON.stringify(list, undefined, 2));
    cb();
  }

  function next(err) {
    if(err) {
      return cb(err); 
    } 

    var file
      , name = files.shift();

    if(!name) {
      return done(); 
    }

    file = pth + name;

    try {
      new ExifImage({image : file}, function (err, data) {
        if(err) {
          return cb(err);
        }else{
          list.push({
            name: name, 
            width: data.exif.ExifImageWidth,
            height: data.exif.ExifImageHeight})
        }

        next();
      });
    }catch(e) {
      return cb(e);
    }
  }

  next();
}

// @task readme build the readme
function readme(cb) {
  mk.doc('doc/readme.md')
    .pipe(mk.pi())
    .pipe(mk.ref())
    .pipe(mk.abs())
    .pipe(mk.msg())
    .pipe(mk.toc({depth: 2}))
    .pipe(mk.out())
    .pipe(mk.dest('README.md'))
    .on('finish', cb);
}

mk.task(css);
mk.task(events);
mk.task(copy);
mk.task([css, events, copy, js], site);
mk.task(sync);
mk.task(js);
mk.task(gallery);
mk.task(readme);

