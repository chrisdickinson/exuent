module.exports = endAll

function endAll() {
  var streams = [].slice.call(arguments, 0, arguments.length - 1)
    , ready = arguments[arguments.length - 1]
    , pending = streams.length

  streams.forEach(function(xs) {
    xs.on('error', end)
    xs.on('end', onend)
  })

  if(!pending) {
    process.nextTick(end)
  }

  function onend() {
    !--pending && end(null)
  }

  function end(err) {
    var cb = ready

    ready = noop
    cb(err || null)
  }

  function noop() {
    // noop!
  }
}
