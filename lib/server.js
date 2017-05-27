'use strict'

import express from 'express'
import path from 'path'
import favicon from 'favicon'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import session from 'express-session'
import router from './routes'
import config from '../config'
import RedisStore from 'connect-redis'
import mongoose from 'mongoose'

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
  res.send({ error: 'Something went wrong' })
}

const app = express()

/* connect to mongodb */
mongoose.connect(config.mongodb)

mongoose.connection.on('error', () => {
  console.log('Mongodb connection error')
  process.exit(1)
})

mongoose.connection.on('connected', () => {
  //listen on config port w/ default 3000
  app.server = app.listen(config.port, e => {
    console.log('listening on', config.port, config.mongodb)
 })
})

/* configure application */

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(logger('dev'))
app.use(logErrors)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// block POST for now
app.use((req, res, next) => {
  if (req.method == 'POST'){
    res.status(405)
    res.send({ error: 'Method Not Allowed' })
  }

  next()
})  

//home page
app.use('/', router)

//all other routes
app.get('*', (req, res, next) => {

  if (req.accepts('html')){
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
