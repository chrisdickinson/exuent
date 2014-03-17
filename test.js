module.exports = suite

var readable = require('readable-stream')
  , Readable = readable.Readable
  , Writable = readable.Writable
  , fs = require('fs')

var endAll = require('./index.js')

if(module === require.main) {
  suite(require('tape'))
}

function suite(test) {
  test('works with zero streams', function(assert) {
    var tick = 0

    process.nextTick(function() {
      ++tick
    })

    endAll(function(err) {
      assert.equal(err, null)
      assert.equal(tick, 1, 'ends on nextTick')
      assert.end()
    })
  })

  test('works with one stream', function(assert) {
    var one = fs.createReadStream(__filename)

    one.pipe(createSink())

    endAll(one, function(err) {
      assert.equal(err, null)
      assert.end()
    })
  })

  test('works with many streams', function(assert) {
    var one = setTimeoutStream(4, 100)
      , two = setTimeoutStream(2, 100)
      , now = Date.now()

    one.pipe(createSink())
    two.pipe(createSink())

    endAll(one, two, function(err) {
      assert.ok(!one.readable && !two.readable)
      assert.end()
    })
  })

  test('works with array-mode', function(assert) {
    var one = setTimeoutStream(4, 100)
      , two = setTimeoutStream(2, 100)
      , now = Date.now()

    one.pipe(createSink())
    two.pipe(createSink())

    endAll([one, two], function(err) {
      assert.ok(!one.readable && !two.readable)
      assert.end()
    })
  })

  test('works with one erroring stream', function(assert) {
    var one = setTimeoutStream(4, 100)
      , two = setTimeoutStream(2, 100)
      , three = setTimeoutThenError(5)
      , now = Date.now()

    one.pipe(createSink())
    two.pipe(createSink())
    three.pipe(createSink())

    endAll(one, two, three, function(err) {
      assert.ok(err, 'there should be an error')
      assert.end()
    })
  })

  test('works with many erroring streams', function(assert) {
    var one = setTimeoutThenError(1000)
      , three = setTimeoutThenError(60)
      , two = setTimeoutThenError(500)
      , now = Date.now()

    one.pipe(createSink())
    two.pipe(createSink())
    three.pipe(createSink())

    endAll(one, two, three, function(err) {
      assert.ok(err, 'there should be an error')
      assert.end()
    })
  })

  function setTimeoutStream(chunks, delayEach) {
    var stream = new Readable

    stream._read = function() {
      setTimeout(iter, delayEach)

      function iter() {
        if(chunks) {
          stream.push(new Buffer(16))

          --chunks

          return setTimeout(iter, delayEach)
        }

        stream.push(null)
      }
    }

    return stream
  }

  function setTimeoutThenError(delay) {
    var stream = new Readable

    stream._read = function() {
      setTimeout(function() {
        stream.emit('error', new Error)
      }, delay)
    }

    return stream
  }

  function createSink() {
    var sink = new Writable

    sink._write = function(chunk, encoding, ready) {
      ready()
    }

    return sink
  }
}
