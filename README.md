# exuent

call a callback when all passed streams have ended or any constituent
stream has errored.

```javascript
var exuent = require('exuent')

exuent(stream1, stream2, streamN, function(err) {
  // called ONCE after each stream has exited OR
  // any stream has errored.
})

// alternatively:
exuent([stream1, streamN], function(err) {
  // same deal!
})
```

## API

### exuent(streams:Array<ReadableStream>, ready:Function(err:Error | null))
### exuent([stream:ReadableStream,] ready:Function(err:Error | null))

`ready` will be called on `nextTick` if no streams are provided.

**Does not trigger flowing mode or reads.** Streams must be piped
separately from this function.

## License

MIT
