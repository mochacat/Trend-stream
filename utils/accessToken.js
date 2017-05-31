var config = require('../config')
var OAuth2 = require('oauth').OAuth2

/*access token credentials for application-only requests*/

var oauth2 = new OAuth2(
    config.consumer_key, 
    config.consumer_secret, 
    'https://api.twitter.com/', 
    null, 
    'oauth2/token', 
    null
)

oauth2.getOAuthAccessToken('', {
  'grant_type': 'client_credentials'
}, function (e, access_token) {
  console.log(access_token)
})

