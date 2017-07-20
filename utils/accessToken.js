const config = require('../config')
const OAuth2 = require('oauth').OAuth2

/* access token credentials for application-only requests */

const oauth2 = new OAuth2(
  config.consumer_key,
  config.consumer_secret,
  'https://api.twitter.com/',
  null,
  'oauth2/token',
  null
)

oauth2.getOAuthAccessToken('', {
  'grant_type': 'client_credentials'
}, function (e, accessToken) {
  if (e) {
    console.log(e)
  }
  console.log(accessToken)
})
