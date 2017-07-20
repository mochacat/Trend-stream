'use strict'
const mongoose = require('mongoose'),
  config = require('../config')

mongoose.connect(config.mongodb)

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err)
})

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open at', config.mongodb)
})

mongoose.connection.on('disconnect', () => {
  console.log('Mongoose connection disconnected')
})
