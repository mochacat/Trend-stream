const server = require('../dist/server'),
  TwitTrendsWorker = require('./twitTrendsWorker'),
  TwitStreamWorker = require('./twitStreamWorker'),
  config = require('../config'),
  hashtag = require('../models/Hashtag'),
  mongoose = require('mongoose'),
  _ = require('lodash')

// make sure mongo exists so we can persist data
if (!mongoose.connection.readyState) {
  console.log('Mongodb not connected')
  process.exit(1)
}

let newTrends = []

const handleErr = err => {
  console.error(err.stack)
}

const trackTrends = () => {
  const twitTrends = new TwitTrendsWorker(config)
  const twitStream = new TwitStreamWorker(config)
  return async function () {
    try {
      // run once every 5 minutes
      const hashtags = await twitTrends.getTopTrends()
      await persistTrends(hashtags)

      const keywords = _.map(hashtags, hashtag => hashtag.name)
      twitStream.track(keywords)
      const interval = twitStream.setCountInterval(1000, updateRealCount)
    } catch (e) {
      handleErr(e)
    }
  }
}

async function updateRealCount (count) {
  // For now just update real_count in hashtag model
  // TODO create Count model and add timestamped values
  try {
    let tags = Object.keys(count)
    for (let tag of tags) {
      let update = await hashtag.update(
        { name: tag },
        { $set: { real_count: count[tag] } }
      )
    }

    const newCounts = await hashtag.find({})
    const savedTags = _.map(newCounts, count => count.name).join(',')
    console.log(`Updated real count for ${savedTags}`)
  } catch (e) {
    handleErr(e)
  }
}

async function persistTrends (res) {
  let trends = _.map(res, (trend, i) => {
    return {
      name: trend.name,
      tweet_volume: trend.tweet_volume,
      rank: i + 1
    }
  })

  console.log(`Adding ${trends.length} trends...`)

  try {
    // delete all hashtags and repopulate top 5
    // rather than sort/insert/remove
    await hashtag.find({}).remove()

    newTrends = await hashtag.insertMany(trends)

    if (newTrends.length) {
      console.log('Top trends added')
      return newTrends
    } else {
      throw new Error('No trends were added')
    }
  } catch (e) {
    handleErr(e)
  }
}

// start tracking trends and listen to tweets
let track = trackTrends()
// initialize trend counting every 5 minutes
track()
setInterval(() => {
  const interval = track()
  setTimeout(() => clearInterval(interval), 300000)
}, 300000)
