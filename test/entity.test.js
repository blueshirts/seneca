/* Copyright (c) 2017 Richard Rodger, MIT License */
'use strict'

var Assert = require('assert')

var Lab = require('lab')
var Code = require('code')
var Seneca = require('..')

var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

var parents = msg => msg.meta$.parents.map(x => x[0])

describe('entity', function() {
  it('happy', function(fin) {
    Seneca({ tag: 'e0' })
      .test(fin)
      .use('entity')
      .make$('foo', { a: 1 })
      .save$(function(err, foo) {
        expect(foo.toString().match(/foo;.*a:1}/))
        fin()
      })
  })

  it('mem-ops', function(fin) {
    var si = Seneca({ tag: 'e0' }).test(fin).use('entity')

    si = si.gate()

    var fooent = si.make$('foo')

    fooent.load$(function(err, out) {
      Assert.equal(err, null)
      Assert.equal(out, null)
    })

    fooent.load$('', function(err, out) {
      Assert.equal(err, null)
      Assert.equal(out, null)
    })

    fooent.remove$(function(err, out) {
      Assert.equal(err, null)
      Assert.equal(out, null)
    })

    fooent.remove$('', function(err, out) {
      Assert.equal(err, null)
      Assert.equal(out, null)
    })

    fooent.list$(function(err, list) {
      Assert.equal(err, null)
      Assert.equal(0, list.length)
    })

    fooent.list$({ a: 1 }, function(err, list) {
      Assert.equal(err, null)
      Assert.equal(0, list.length)
    })

    var tmp = {}

    fooent.make$({ a: 1 }).save$(function(err, foo1) {
      Assert.equal(err, null)
      Assert.ok(foo1.id)
      Assert.equal(1, foo1.a)
      tmp.foo1 = foo1
    })

    fooent.list$(function(err, list) {
      Assert.equal(err, null)
      Assert.equal(1, list.length)
      Assert.equal(tmp.foo1.id, list[0].id)
      Assert.equal(tmp.foo1.a, list[0].a)
      Assert.equal('' + tmp.foo1, '' + list[0])
    })

    fooent.list$({ a: 1 }, function(err, list) {
      Assert.equal(err, null)
      Assert.equal(1, list.length)
      Assert.equal(tmp.foo1.id, list[0].id)
      Assert.equal(tmp.foo1.a, list[0].a)
      Assert.equal('' + tmp.foo1, '' + list[0])

      si = si.gate()
      fooent = si.make$('foo')

      fooent.load$(tmp.foo1.id, function(err, foo11) {
        Assert.equal(err, null)
        Assert.equal(tmp.foo1.id, foo11.id)
        Assert.equal(tmp.foo1.a, foo11.a)
        Assert.equal('' + tmp.foo1, '' + foo11)
        foo11.a = 2
        tmp.foo11 = foo11

        foo11.save$(function(err, foo111) {
          Assert.equal(err, null)
          Assert.equal(tmp.foo11.id, foo111.id)
          Assert.equal(2, foo111.a)
          tmp.foo111 = foo111

          fooent.list$(function(err, list) {
            Assert.equal(err, null)
            Assert.equal(1, list.length)
            Assert.equal(tmp.foo1.id, list[0].id)
            Assert.equal(2, list[0].a)
            Assert.equal('' + tmp.foo111, '' + list[0])
          })

          fooent.list$({ a: 2 }, function(err, list) {
            Assert.equal(err, null)
            Assert.equal(1, list.length)
            Assert.equal(tmp.foo1.id, list[0].id)
            Assert.equal(2, list[0].a)
            Assert.equal('' + tmp.foo111, '' + list[0])

            list[0].remove$(function(err) {
              Assert.equal(err, null)

              fooent.list$(function(err, list) {
                Assert.equal(err, null)
                Assert.equal(0, list.length)

                fooent.list$({ a: 2 }, function(err, list) {
                  Assert.equal(err, null)
                  Assert.equal(0, list.length)

                  fooent.make$({ b: 1 }).save$(function() {
                    fooent.make$({ b: 2 }).save$(function() {
                      fooent.list$(function(err, list) {
                        Assert.equal(err, null)
                        Assert.equal(2, list.length)

                        fooent.list$({ b: 1 }, function(err, list) {
                          Assert.equal(err, null)
                          Assert.equal(1, list.length)

                          si.close(fin)
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
