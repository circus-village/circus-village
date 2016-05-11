var moment = require('moment')
  , path = require('path')
  , yaml = require('js-yaml')
  , fs = require('fs-extra');

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
          return a > b ? 1 : -1;
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

    if(!/\.md$/.test(file)) {
      return next(); 
    }

    file = path.join(source, file);

    fs.readFile(file, function(err, contents) {
      if(err) {
        return cb(err); 
      }

      contents = '' + contents;

      var yml = '' + fs.readFileSync(file.replace(/\.md$/, '.yml'));

      // parse the YAML
      yaml.safeLoadAll(yml, function(doc) {
        if(!doc) {
          return; 
        }
        var start = moment(doc.start, 'DD/MM/YYYY')
          , end = moment(doc.end, 'DD/MM/YYYY')
          , fmt = 'MMMM Do'
          , title = start.format(fmt)
              + ' to ' + end.format(fmt)
              + ' ' + end.format('YYYY');

        // prepend h3 heading
        contents = '### ' + title + '\n\n' + contents;

        // add wrapper `event` div
        contents = '<div class="event" data-start="'
          + start.valueOf()
          + '" data-end="'
          + end.valueOf() 
          + '">\n\n'
          + contents + '\n</div>\n'

        // add to the list for sorting
        list.push({file: file, start: start, end: end, contents: contents});

        next();
      });
    })
  }

  next();
}

module.exports = events;
