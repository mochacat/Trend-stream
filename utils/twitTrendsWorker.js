'use strict'

const Twitter = require('twitter'),
      flow = require('lodash/fp/flow'),
      filter = require('lodash/fp/filter'),
      orderBy = require('lodash/fp/orderBy'),
      take = require('lodash/fp/take')

const twitTrends = module.exports = function(config){
  this.twitRestClient = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  })
}

//get top hashtag trends from twitter test api
twitTrends.prototype.getTopTrends = function(next){
  this.twitRestClient.get('trends/place.json', {id: 1}, (err, res) => {
    const currentTrends = res[0].trends 

    const trends = flow(
      filter(t => t.name.startsWith('#') && t.tweet_volume !== null),
      orderBy(['tweet_volume'], ['desc']),
      take(5)
    )(currentTrends)
    
    next(err, trends)
  })
}

/*twitTrends.prototype.storeTrendCount = function(){
  //TODO persist trend count
}*/

//TODO twitter caches results for every 5 minutes so don't request more than that
twitTrends.prototype.requestTimer = function(){
}

twitTrends.prototype.requestCount = function(){
}
