var mk = require('mktask')
  , moment = require('moment')
  , path = require('path')
  , bs
  , fs = require('fs-extra');

// @task events build the events (order by date desc)
function events(cb) {
  var source = 'doc/events'
    , files = fs.readdirSync(source)
    , list = [];

  function build() {
    var output = 'doc/events.md'
      , stream
      , sorted = list.sort(function(a, b) {
          a = a.start;
          b = b.start;
          if(a === b) {
            return 0;
          }
          return a < b ? 1 : -1;
        })

    stream = fs.createWriteStream(output);

    stream.once('open', function() {
      for(var i = 0;i < sorted.length;i++) {
        stream.write(sorted[i].contents + '\n'); 
      }
      stream.end();
    })

    stream.once('finish', cb);
  }

  function next(err) {
    if(err) {
      return cb(err);
    } 
    var file = files.shift();
    if(!file) {
      return build();
    }
    fs.readFile(path.join(source, file), function(err, contents) {
      if(err) {
        return cb(err); 
      }

      contents = '' + contents;
      var start
        , end;

      contents.replace(/data-start="([^"]+)"\s+data-end="([^"]+)"/, 
        function(all, begin, finish) {
          start = begin;
          end = finish;
        }
      )

      start = moment(start, 'DD/MM/YYYY');
      end = moment(end, 'DD/MM/YYYY');

      list.push({file: file, start: start, end: end, contents: contents});

      next();
    })
  }

  next();
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

// @task serve run a static web server
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

  var stream = mk.doc('doc/events.md')
    .pipe(mk.page(page))
    .pipe(mk.out({type: 'html'}))
    .pipe(mk.dest('build/index.html'))

  if(cb) {
    stream.once('finish', cb);
  }
}

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

mk.task(events);
mk.task(copy);
mk.task([events, copy, js], site);
mk.task(sync);
mk.task(js);
