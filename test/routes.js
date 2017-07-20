'use strict'
/* eslint-env mocha */

import request from 'supertest'
import chai from 'chai'
import config from '../config'
import app from '../lib/server'

const should = chai.should()

describe('Routes test', () => {
  it('GET / should return home page', done => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(res => {
        res.status.should.equal(200)
        done()
      })
  })

  it('GET /nothing should return 404 page', done => {
    request(app)
      .get('/nothing')
      .expect(404)
      .expect('Content-Type', 'text/html')
      .end(res => {
        res.status.should.equal(404)
        done()
      })
  })

  it('POST / should return 405', done => {
    request(app)
      .post('/')
      .expect(405)
      .end(res => {
        res.status.should.equal(405)
        res.body.error.should.equal('POST not supported')
        done()
      })
  })
})
