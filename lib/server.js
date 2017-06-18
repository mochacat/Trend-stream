'use strict'

import express from 'express'
import path from 'path'
import favicon from 'favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import session from 'express-session'
import RedisStore from 'connect-redis'
import '../models/db'
import mongoose from 'mongoose'
import router from './routes'
import config from '../config'

mongoose.Promise = require('bluebird')

//generic error for now
const logErrors = (err, req, res, next) => {
  console.error(err.stack)
  next(err)
}

const errorHandler = (err, req, res, next) => {
  if (err.status == 404) {
    res.status(404)
    res.send(err.message || 'Not found')
  }
  res.status(err.status || 500)
  res.send({ error: err.message || 'Something went wrong' })
}

const app = express()

app.server = app.listen(config.port, e => {
  console.log('App listening on', config.port)
})


/* configure application */

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '..', 'views'))

app.use(logger('dev'))
app.use(logErrors)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//home page
app.use('/', router)

//all other routes
app.get('*', (req, res, next) => {
  if (req.accepts('text/html')){
    res.status(404)
    res.render('not-found')
  } else {
    err = new Error('Not Found')
    err.status = 404
    next(err)
  }
})

// block POST for now
app.post('*', (req, res, next) => {
  const err = new Error('POST not supported')
  err.status = 405 
  next(err)
}) 

app.use(errorHandler)

module.exports = app
