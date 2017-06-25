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
  let currentStream = null,
      keywords = null,
      count = {}

  this.setStream = function(stream){
    currentStream = stream
  }
  this.getStream = function(){
    return currentStream
  }

  this.setKeywords = function(trends){
    keywords = trends
  }

  this.getKeywords = function(){
    return keywords 
  }

  //takes array of tags and adds increments count dict
  this.setCount = function(tags){
   
    if (tags == null){
      count = {}
    } else{
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
twitStream.prototype.track = function(keywords, next){
  this.setKeywords(keywords)
  //destroy old stream because only one streaming connection allowed
  this.reset()
  
  let currentStream = this.getStream()
  if (currentStream === null){
    let currentKeywords = this.getKeywords()    
    if (!currentKeywords.length){
      throw new Error('No hashtags to track')
    }

    //set count to 0 for each hashtag
    this.resetCount()
    //prepare tags for streaming api
    let tags = currentKeywords.join(',')

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
          if (currentKeywords.indexOf(tag) > -1){
            updates.push(tag)
          }
          return updates
        }, [])
        this.setCount(matchTags)
      } else if(tweet.limit.track !== undefined){
        //TODO deal with untracked tweets
      }       
    })

    currentStream.on('error', err => {
      console.log(err)
    })
    currentStream.on('warning', warning => {
      console.log(warning)
    })
      
  }
}

twitStream.prototype.setCountInterval = function(time, save){
  //every second send total count & reset count to 0
  return setInterval(() => {
    let count = this.getCount()
    if (count) {
      save(count)
      this.resetCount()
    }
  }, time)
}

//rest count to 0 for each keyword
twitStream.prototype.resetCount = function(){
  this.setCount(null)
  this.setCount(this.getKeywords())
}

//destroy the stream connection for current trends
twitStream.prototype.reset = function(){
  let currentStream = this.getStream()

  if (currentStream !== null){
    console.log('Destroying Twitter stream...')
    currentStream.destroy()
    clearInterval(interval)
    this.setStream(null)
    this.resetCount()
  } 
}
