// define dependencies | mendeklarasikan dependencies
require('dotenv').config()
const twit = require('twit')
const config = require('./config')
const bahasa = ['en', 'in']
const T = new twit(config)

const termsToTrack = [
    'merasa gagal',
    'sedih banget gue',
    'stress gue',
    'gue sedih banget',
    'hidup gue ancur',
    'ikbar sedih'
]

const replies = [
    'tenang, gak semuanya harus ada jawabannya sekarang -nkcthi',
    'kadang beberapa hal gak perlu dipusingin, cukup dijalanin dan diketawain -nkcthi',
    'gak masalah.., beberapa kali kalah, beberapa kali mengalah, sampai tiba suatu waktu, untuk bangun dan melawan, setidaknya, bertahan -nkcthi',
    'nafas sebentar, apa sih yang dikejar -nkcthi'
]

console.log('Starting bot...');
T.get('account/verify_credentials', {
    include_entities: false,
    skip_status: true,
    include_email: false
}, onAuthenticated)

function onAuthenticated(err){
    if (err) {
        console.error(err)
    } else {
        console.log('Authentication successful.')
        setInterval(streamNewTweet, 3000)
    }
}

// Once we're authenticated we run the streamNewTweet function, which we'll use now to send a tweet to test our bot.
function streamNewTweet() {
    console.log('Stream new tweet...');
    var stream = T.stream('statuses/filter', {
        track: termsToTrack,
        tweet_mode: 'extended',
        lang: bahasa
    })

    stream.on('tweet', function (tweet) {
        // Reply only to original tweet that match
        // TODO: check is tweet has been replied before
        if(!isRetweet(tweet) && isTweetExactMatch(tweet)){
            sendReply(tweet)
        }
    })
}

// A function to check if the tweets have exact matches for our search terms.
function isTweetExactMatch(tweet) {
    text = tweet.text.toLowerCase()
    // Check if tweet contains an exact match of the phrases we're looking for.
    return termsToTrack.some(term => text.includes(term))
}

function isRetweet(tweet) {
    return tweet.retweeted_status
}

function sendReply(tweet) {
    // get the screen name of the twitter account - we'll need to prepend our response with this in order to reply.
    var screenName = tweet.user.screen_name
    console.log(tweet.user.screen_name);

    // Now we create the reply - the handle + a random reply from our set of predefined replies
    var response = `${replies[Math.floor(Math.random() * replies.length)]}`

    T.post('statuses/update', {
        // To reply we need the id of tweet we're replying to.
        in_reply_to_status_id: tweet.id_str,
        // Status is the content of the tweet, we set it to the response string we made above.
        status: response
        // After we tweet we use a callback function to check if our tweet has been succesful.
    }, onTweeted)
    console.log('Sending reply to a tweet...');
}

let isAsleep = false
	
// Check if our tweet has been successful, if we've reached our rate limit, let people know that our bot is asleep.
function onTweeted(err) {
    if (err !== undefined) {
        if (err.code === 88) {
            console.log('Tweet rate limit exceeded')
            T.post('account/update_profile', {
                name: 'Qwitter Bot 💤',
                description: 'I\'ve helped too many people quit twitter and have reached my rate limit. Try again later.'
            }, onTweeted)
            isAsleep = true
        } else if (err.code === 187) {
            console.log('Tweet duplicate, skipping thiw tweet')
            // TODO: retry to send a reply with another replies
        } else {
            console.error(err)
        }
    } else {
        if(isAsleep) {
            isAsleep = false
            T.post('account/update_profile', {
                name: 'Qwitter Bot',
                description: 'I\'m a bot that helps you quit twitter. I appear only when I am needed most'
            }, onTweeted)
        }
    }
}
