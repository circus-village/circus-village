var moment = require('moment')
  , path = require('path')
  , yaml = require('js-yaml')
  , fs = require('fs-extra');

// @task events build the events (order by date desc)
function events(cb) {
  var source = 'doc/events'
    , files = fs.readdirSync(source)
    , list = [];

  function build() {
    var output = 'doc/events.html'
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

      //contents.replace(/data-start="([^"]+)"\s+data-end="([^"]+)"/, 
        //function(all, begin, finish) {
          //start = begin;
          //end = finish;
        //}
      //)

      var fm = /^---\s+([^\-]+)\s+---\n\n(.*)$/m
        , yml;

      contents = contents.replace(fm, function(match, yaml, body) {
        yml = yaml;
        return body;
      })

      yaml.safeLoadAll(yml, function(doc) {
        var start
          , end;
        start = moment(doc.start, 'DD/MM/YYYY');
        end = moment(doc.end, 'DD/MM/YYYY');

        contents = '<div class="event" data-start="'
          + start.valueOf()
          + '" data-end="'
          + end.valueOf() 
          + '">\n\n'
          + contents + '\n</div>\n'

        list.push({file: file, start: start, end: end, contents: contents});

        next();
      });
    })
  }

  next();
}

module.exports = events;
