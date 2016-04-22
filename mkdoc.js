var mk = require('mktask')
  , moment = require('moment')
  , path = require('path')
  , fs = require('fs');

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

// @task site build the site
function site(cb) {
  mk.doc('doc/events.md')
    .pipe(mk.page(
      {
        title: 'Circus Village',
        app: ['assets/js/app.js'],
        style: ['assets/css/style.css']
      }
    ))
    .pipe(mk.out({type: 'html'}))
    .pipe(mk.dest('build/index.html'))
    .on('finish', cb);
}

mk.task(events);
mk.task([events], site);
