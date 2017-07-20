'use strict'

const Twitter = require('twitter'),
  Promise = require('bluebird'),
  flow = require('lodash/fp/flow'),
  filter = require('lodash/fp/filter'),
  orderBy = require('lodash/fp/orderBy'),
  take = require('lodash/fp/take')

const twitTrends = module.exports = function (config) {
  this.twitRestClient = new Twitter({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  })
}

// get top hashtag trends from twitter test api
twitTrends.prototype.getTopTrends = function () {
  return new Promise((resolve, reject) => {
    this.twitRestClient.get('trends/place.json', {id: 1}, (err, res) => {
      if (err) {
        return reject(err)
      }
      const currentTrends = res[0].trends
      const trends = flow(
        filter(t => t.name.startsWith('#') && t.tweet_volume !== null),
        orderBy(['tweet_volume'], ['desc']),
        take(5)
      )(currentTrends)

      return resolve(trends)
    })
  })
}
