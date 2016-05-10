var mk = require('mktask')
  , events
  , bs
  , fs = require('fs-extra');

// @task events build the events (order by date desc)
events = require('./events');

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
  chokidar.watch('lib/*.css', {ignored: /[\/\\]\./})
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
  fs.copySync('lib/style.css', 'build/assets/css/style.css');
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
        keywords: 'circus village, circus, village, retreat, massage, '
          + 'waterfall, river, kuang si, freedom'
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
  var browserify = require('browserify');
  var b = browserify(['./lib/main.js'], {paths: ['./node_modules/air/lib']});
  var bundle = b.bundle();
  var stream = bundle
    .pipe(fs.createWriteStream('build/assets/js/app.js'));
  if(cb) {
    stream.on('finish', cb);
  }
}

// @task gallery build the list of images and dimensions
function gallery(cb) {
  var pth = 'build/assets/img/gallery/'
    , ExifImage = require('exif')
    , files = fs.readdirSync(pth)
    , list = [];

  function done() {
    console.error(list) 
    fs.writeFileSync(
      'lib/gallery.json', JSON.stringify(list, undefined, 2));
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

mk.task(events);
mk.task(copy);
mk.task([events, copy, js], site);
mk.task(sync);
mk.task(js);
mk.task(gallery);
