(function() {
  var i
    , now = Date.now()
    , moved = 0
    , start
    , past = document.querySelectorAll('#past')[0]
    , events = document.querySelectorAll('.events > .event');

  for(i = 0;i < events.length;i++) {
    start = parseInt(events[i].getAttribute('data-start'));
    if(start < now) {
      past.appendChild(events[i]);
      moved++;
    }
  }

  if(moved) {
    past.setAttribute('style', 'display: block;') 
  }

})();
