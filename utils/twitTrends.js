'use strict'

const Twitter = require('twitter'),
      flow = require('lodash/fp/flow'),
      filter = require('lodash/fp/filter'),
      orderBy = require('lodash/fp/orderBy'),
      take = require('lodash/fp/take'),
      config = require('../config.js'),
      hashtag = require('../models/Hashtag')

const twitTrends = module.exports = function(){
  this.twitRestClient = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  })

  this.trends = null
}

//set top 5 trends
twitTrends.prototype.getTopTrends = function(){
  this.twitRestClient.get('trends/place.json', {id: 1}, (err, res) => {
    if (err){
      console.log(err)
    }

    const currentTrends = res[0].trends 

    this.trends = flow(
      filter(t => t.name.startsWith('#') && t.tweet_volume !== null),
      orderBy(['tweet_volume'], ['desc']),
      take(5)
    )(currentTrends)
  })
}

twitTrends.prototype.storeTrendCount = function(){
  //TODO persist trend count
}

//TODO twitter caches results for every 5 minutes so don't request more than that
twitTrends.prototype.requestTimer = function(){
}

twitTrends.prototype.requestCount = function(){
}

const trends = new twitTrends()
trends.getTopTrends()
