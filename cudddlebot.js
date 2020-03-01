// define dependencies
const twit = require('twit')
const config = require('./config.js')
var Twitter = new twit(config)

Twitter.post('statuses/update', { status: 'hello world!' }, function(err, data, response) {
    if (err){
        console.log(err);
    }
})