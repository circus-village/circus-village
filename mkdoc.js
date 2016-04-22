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
  bs = require('browser-sync').create();

  var chokidar = require('chokidar');

  bs.init({
    ghostMode: false,
    notify: false,
    logLevel: 'silent',
    files: [
      './lib/*.js', './lib/*.css', 'doc/events.md']
  });

  // watch source files
  chokidar.watch('lib', {ignored: /[\/\\]\./})
    .on('change', function() {
      copy();
    });

  // watch source files
  chokidar.watch('doc/events', {ignored: /[\/\\]\./})
    .on('change', function() {
      mk.run([site], function noop(){
        if(bs) {
          bs.reload();
        }
      });
    });
}

// @task copy static files to the build directory
function copy(cb) {
  fs.copySync('lib/app.js', 'build/assets/js/app.js');
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
      header: 'doc/header.html',
      app: ['assets/js/app.js'],
      style: [
        'assets/css/style.css',
        'https://fonts.googleapis.com/css?family=Kurale',
        'https://fonts.googleapis.com/css?family=Droid'
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
    page.footer = 'doc/sync.md';
  }

  //console.error('building site');

  var stream = mk.doc('doc/events.md')
    .pipe(mk.page(page))
    .pipe(mk.out({type: 'html'}))
    .pipe(mk.dest('build/index.html'))

  if(cb) {
    stream.once('finish', cb);
  }
}

mk.task(events);
mk.task(copy);
mk.task([events, copy], site);
mk.task(sync);
