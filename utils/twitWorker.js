'use strict'

const Twitter = require('twitter')
//import redis from 'redis'
const config = require('../config')
const hashtag = require('../models/Hashtag')

const twitClient = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret
})

//grab twitter keywords from rest api later
const keywords = ['js']

//set stream to null to check if it is active
let twitStream = null;

//need to disconnect stream every time new keywords come
function init(){
  if (twitStream === null){
   
    console.log('Connecting to Twitter Streaming API')

    twitStream = twitClient.stream(
        'statuses/filter', 
        { track: keywords.join(',') }
    )
    
    twitStream.on('warning', res => {
      console.log('Stall warning: ', res.warning.message)
    })

    twitStream.on('data', tweet => {
      console.log('New tweet:', tweet && tweet.text)
      //persist it
    })

    twitStream.on('error', err => {
      console.log('Error:', err.message)
    })
  } else {
    console.log('Destroying Twitter stream')
    twitStream.destroy()
    clearInterval(interval)
    process.exit(0)
  }
}

//set interval for now
var interval = setInterval(init, 10000)
