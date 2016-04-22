var mk = require('mktask')
  , moment = require('moment')
  , path = require('path')
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

    //console.error(sorted)
    //cb(); 
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

  // browsersync
  var bs = require('browser-sync').create()
    , chokidar = require('chokidar')
    //, exec = require('child_process').execSync;

  bs.init({
    //port: 5000,
    //ui: {
      //port: 5001
    //},
    ghostMode: false,
    notify: false,
    logLevel: 'silent',
    files: ['./lib/*.js', './lib/*.css']
  });

  // js files
  chokidar.watch('www/lib', {ignored: /[\/\\]\./})
    .on('change', function() {
      //if(env.production) {
        //exec('npm run minify'); 
      //}else{
        //exec('npm run compile'); 
      //}
    });

  // css files
  chokidar.watch('www/css', {ignored: /[\/\\]\./})
    .on('change', function() {
      //if(env.production) {
        //exec('npm run minify-css');
      //}else{
        //exec('npm run css'); 
      //}
    });
}

// @task copy static files to the build directory
function copy(cb) {
  fs.copySync('lib/app.js', 'build/assets/js/app.js');
  fs.copySync('lib/style.css', 'build/assets/css/style.css');
  cb();
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
      app: ['assets/js/app.js'],
      style: ['assets/css/style.css']
    };

  if(this.args.flags.sync) {
    serve();
    sync();
    page.footer = 'doc/sync.md';
  }

  mk.doc('doc/events.md')
    .pipe(mk.page(page))
    .pipe(mk.out({type: 'html'}))
    .pipe(mk.dest('build/index.html'))
    .on('finish', cb);
}

mk.task(events);
mk.task(copy);
mk.task([events, copy], site);
mk.task(sync);
