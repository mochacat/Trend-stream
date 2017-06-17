'use strict'

const Twitter = require('twitter'),
//import redis from 'redis'
      config = require('../config'),
      hashtag = require('../models/Hashtag')

const twitStream = module.exports = function(){
  this.twitStreamClient = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  })

  //TODO populate count object w/ hashtags 
  //&& create method for realtime count for keywords
  
  this.count = null

  let currentStream = null
  this.setStream = function(stream){
    currentStream = stream
  }
  this.getStream = function(){
    return currentStream
  }
}

//start stream connection for keywords
twitStream.prototype.track = function(keywords){
  let currentStream = this.getStream()
  
  if (currentStream === null){    
    if (!keywords.length){
      throw new Error('No hashtags to track')
    }
    
    let tags = keywords.join(',')

    console.log(`Connecting to Twitter Streaming API for keywords: ${tags}`)

    const stream = this.twitStreamClient.stream(
        'statuses/filter', 
        { track: tags }
    )

    this.setStream(stream)
    
    currentStream = this.getStream()
    
    currentStream.on('warning', res => {
      console.log('Stall warning: ', res.warning.message)
    })

    currentStream.on('data', tweet => {
      console.log('New tweet:', tweet && tweet.text)
      //persist it
    })

    currentStream.on('error', err => {
      console.log('Error:', err.message)
    })
  } 
}

//destroy the stream connection for keywords
twitStream.prototype.destroy = function(){
  let currentStream = this.getStream()

  if (currentStream !== null){
    console.log('Destroying Twitter stream...')
    currentStream.destroy()
    this.setStream(null)
  } else {
    throw new Error('Stream does not exist so cannot destroy')
  }
}

//TODO dynamically generate hashtags from twitter rest api
let hashtags = ['js', 'node']

const newStream = new twitStream()
newStream.track(hashtags)

//set interval for now
var timeout = setTimeout(function(){
  newStream.destroy()
}, 10000)
