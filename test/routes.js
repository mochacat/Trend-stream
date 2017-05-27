'use strict'

import request from 'supertest'
import http from 'http'
import {should} from 'chai'
import config from '../config'
import app from '../server.js'

const base_url = 'http://localhost:' + config.port
app.listen(base_url)

describe('Routes test', () => {
  it('GET / should return home page'), done => {
    request(app)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        res.status.should.equal(200)
        done() 
      })
  })
  
  it('GET /nothing should return 404', done => {
    request(app)
      .get('nothing')
      .expect(404)
      .end((err, res) => {
        res.status.should.equal(404)
        res.body.error.should.be('Not found')
        done()
      })
  })

  it('POST / should return 405', done => {
    request(app)
      .post('/')
      .expect(405)
      .end((err, res) => {
        res.status.should.equal(405)
        res.body.error.should.be('Method Not Allowed')
        done()
      })
  })

})
