const server = require('../dist/server'),
      twitTrends = require('./twitTrendsWorker'),
      config = require('../config'),
      hashtag = require('../models/Hashtag'),
      _ = require('lodash')

//make sure mongo exists so we can persist data

/*if (!mongoose.connection.readyState){
  console.log('Mongodb not connected')
  process.exit(1)
}*/

function handleErr(err){
  console.error(err.message)
  console.error(err.stack)
}

async function persistTrends(err, res){
  if (err){
    handleErr(err)
  }
  
  let trends = _.map(res, (trend, i) => {
    return {
      name: trend.name,
      tweet_volume: trend.tweet_volume,
      rank: i+1,   
    }
  })
  
  try {
    //delete all hashtags and repopulate top 5
    //rather than sort/insert/remove
    
    await hashtag.find({}).remove()

    let newTrends = await hashtag.insertMany(trends)
    console.log('Top trends added')
  
  } catch(e){
    handleErr(e)
 }
}

const twit = new twitTrends(config)
twit.getTopTrends(persistTrends)
