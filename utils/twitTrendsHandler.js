const server = require('../dist/server'),
      twitTrendsWorker = require('./twitTrendsWorker'),
      twitStreamWorker = require('./twitStreamWorker'),
      config = require('../config'),
      hashtag = require('../models/Hashtag'),
      mongoose = require('mongoose'),
      _ = require('lodash')

//make sure mongo exists so we can persist data
if (!mongoose.connection.readyState){
  console.log('Mongodb not connected')
  process.exit(1)
}

let newTrends = []

const handleErr = err => {
  console.error(err.stack)
}

const updateCount = data => {
  //update count in the db
}

const trackTrends = () => { 
  const twitTrends = new twitTrendsWorker(config)
  const twitStream = new twitStreamWorker(config)
  
  async function track(){
    try{
      //run once every 5 minutes
      let hashtags = await twitTrends.getTopTrends()
      await persistTrends(hashtags)
  
      let keywords = _.map(hashtags, hashtag => hashtag.name)
      twitStream.destroy() //only one connection allowed by Twitter
    
      //tracks total tweets per second
      let count = await twitStream.track(keywords)
      console.log(count) //persistCount
    } catch(e){
      handleErr(e)
    }
  }

  //initialize trend tracking
  track()
  const trendsInterval = setInterval(() => track(), 300000)
}

async function persistTrends(res){
   
  let trends = _.map(res, (trend, i) => {
    return {
      name: trend.name,
      tweet_volume: trend.tweet_volume,
      rank: i+1,   
    }
  })

  console.log(`Adding ${trends.length} trends...`)
  console.log(trends)
  
  try {
    //delete all hashtags and repopulate top 5
    //rather than sort/insert/remove
    
    await hashtag.find({}).remove()

    newTrends = await hashtag.insertMany(trends)

    if (newTrends.length){ 
      console.log('Top trends added')
      return newTrends
    } else {
      throw new Error('No trends were added')
    }
  
  } catch(e){
    handleErr(e)
 }
}

//start tracking trends and listen to tweets
trackTrends()
