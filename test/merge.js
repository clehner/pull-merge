var async = require('interleavings')
var pull = require('pull-stream')
var assert = require('assert')
var merge = require('../')

async.test(strange, function (err, results, stats) {
    console.log(results)
    assert.equal(stats.failures, 0)
    console.log('passed')
  })

function strange (async) {

    function p (read) {
      return function (abort, cb) {
        read(abort, async(cb))
      }
    }

    pull(
      //pull many must return a result in the same partial order.
      //so if we have a stream of even and a stream of odd numbers
      //then those should be in the same order in the output.
      merge([
        pull.values([1,4,7,10]),
        pull.values([2,5,8,11]),
        pull.values([3,6,9,12])
      ].map(p)),
      function (read) {
        return function (abort, cb) {
          read(abort, function (end, data) {
            console.log(end, data)
            cb(end, data)
          })
        }
      },
      pull.collect(function (err, ary) {
        console.log(ary)

        assert.deepEqual(ary, [1,2,3,4,5,6,7,8,9,10,11,12])
        async.done()
      })
    )

  }

//strange(async(17, function (err, result) {
//  if(result.error)
//    console.log(result.error.stack)
//}))
