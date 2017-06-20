'use strict'

const Twitter = require('twitter'),
      Promise = require('bluebird'),
      _ = require('lodash')

const twitStream = module.exports = function(config){
  
  //TODO just upload to config client file
  this.twitStreamClient = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  })
 
  //private 
  let currentStream = null
  let count = {}

  this.setStream = function(stream){
    currentStream = stream
  }
  this.getStream = function(){
    return currentStream
  }

  //takes array of tags and adds increments count dict
  this.setCount = function(tags){
    if (tags === null){
      count = {}; //reset after stream destroy
    } else {
      _.forEach(tags, tag => {
        count[tag] = count[tag] + 1 || 0
      })
    }
  }
  this.getCount = function(){
    return count
  }
}

//start stream connection for keywords
twitStream.prototype.track = function(keywords){
  
  let currentStream = this.getStream()
  if (currentStream === null){    
    if (!keywords.length){
      throw new Error('No hashtags to track')
    }

    //set count to 0 for each hashtag
    this.setCount(keywords)
    //prepare tags for streaming api
    let tags = keywords.join(',')

    console.log(`Connecting to Twitter Streaming API for keywords: ${tags}`)
    
    const stream = this.twitStreamClient.stream(
        'statuses/filter', 
        { track: tags }
    )
    
    this.setStream(stream)
   
      currentStream = this.getStream()
      
      currentStream.on('data', tweet => {
        //if tweets are in hashtag list, increment count
        //tweet.limit.track shows how many missed
        if (tweet.text !== undefined){
          let matchTags = _.reduce(tweet.entities.hashtags, (updates, hashtag) => {
            let tag = `#${hashtag.text}` 
            if (keywords.indexOf(tag) > -1){
              updates.push(tag)
            }
            return updates
          }, [])

          this.setCount(matchTags)
        }       
      })

      currentStream.on('error', err => {
        console.log(err)
      })
      currentStream.on('warning', warning => {
        console.log(warning)
      })
      
      //every second send total count & reset count to 0
      var interval = setInterval(() => {
        let countPerSecond = this.getCount()
        if (countPerSecond) {
          console.log(countPerSecond)
          //persist countPerSecond
          this.setCount(null)
          this.setCount(keywords)
        }
      }, 1000)

      //TODO clear interval on destroy
    }
}

//destroy the stream connection for keywords
twitStream.prototype.destroy = function(){
  let currentStream = this.getStream()

  if (currentStream !== null){
    console.log('Destroying Twitter stream...')
    currentStream.destroy()
    clearInterval(interval)
    this.setStream(null)
    this.setCount(null)
  } 
}


