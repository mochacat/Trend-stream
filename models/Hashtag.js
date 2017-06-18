'use strict'

var mongoose = require('mongoose')

var hashtagSchema = new mongoose.Schema({
  _id : { type: String, unique: true},
  name : String,
  real_count : { type: Number, default: 0 },
  tweet_volume: Number,
  rank : { type: Number, min: 1, max: 5}, 
  date: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('Hashtag', hashtagSchema)
