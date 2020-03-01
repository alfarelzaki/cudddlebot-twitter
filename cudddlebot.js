// define dependencies | mendeklarasikan dependencies
const twit = require('twit')
const config = require('./config.js')
var T = new twit(config)

T.get('account/verify_credentials', {
    include_entities: false,
    skip_status: true,
    include_email: false
}, onAuthenticated)

function onAuthenticated(err){
    if (err) {
        console.log(err)
    } else {
    console.log('Authentication successful.')
}}

// Once we're authenticated we run the onAuthenticated function, which we'll use now to send a tweet to test our bot.

const termsToTrack = [
    'merasa gagal',
    'sedih banget',
    'stress gue'
]

const bahasa = ['en', 'in']
function onAuthenticated(err){
    var stream = T.stream('statuses/filter', {track:termsToTrack, tweet_mode:'extended', lang:bahasa})

    stream.on('tweet', function (tweet) {
        
        // We perform some checks before we send anyone a tweet.
        if(
        // We don't want our bot to reply to retweets
            !tweet.retweeted_status
            &&
        // It's important that our twitter bot doesn't respond to itself.
        // So we check if the tweet is from our handle
            // tweet.user.screen_name !== handle
            // &&
        // The twitter stream api send us a lot of tweets that aren't exact matches of our text
        // so we double check with a function
            isTweetExactMatch(tweet.text)
        
        ){
        // If the tweet matches all the above criteria, we send our reply
        // Note - here the tweet parameter refers to the tweet we're replying to.
                sendReply(tweet)
        }
    })
}

// A function to check if the tweets have exact matches for our search terms.
function isTweetExactMatch(text){
    // Make sure the text is in lowercase
    text = text.toLowerCase()
    // Check if tweet contains an exact match of the phrases we're looking for.
    return termsToTrack.some(term => text.includes(term))
}

const replies = [
    // an array containing all of our replies
    'tenang, gak semuanya harus ada jawabannya sekarang -nkcthi',
    'kadang beberapa hal gak perlu dipusingin, cukup dijalanin dan diketawain -nkcthi',
    'gak masalah.., beberapa kali kalah, beberapa kali mengalah, sampai tiba suatu waktu, untuk bangun dan melawan, setidaknya, bertahan -nkcthi',
    'nafas sebentar, apa sih yang dikejar -nkcthi'

]
        
function sendReply(tweet){
        
// get the screen name of the twitter account - we'll need to prepend our response with this in order to reply.
var screenName = tweet.user.screen_name
            
// Now we create the reply - the handle + a random reply from our set of predefined replies + the instructions on how to quit
var response = '@' + screenName + ' ' + replies[Math.floor(Math.random() * replies.length)]
        
    T.post('statuses/update', {
        // To reply we need the id of tweet we're replying to.
        in_reply_to_status_id:tweet.id_str,
        // Status is the content of the tweet, we set it to the response string we made above.
        status:response
        // After we tweet we use a callback function to check if our tweet has been succesful.
    }, onTweeted)
}

function sendTweet(){
    T.post('statuses/update', { status:'just, relax dude'})
}

let isAsleep = false
	
// Check if our tweet has been successful, if we've reached our rate limit, let people know that our bot is asleep.
function onTweeted(err) {
    if (err !== undefined) {
        console.log(err)
	if(err.code === 88){
	    console.log('rate limit reached')
            T.post('account/update_profile', {
	        name:'Qwitter Bot 💤',
	        description: 'I\'ve helped too many people quit twitter and have reached my rate limit. Try again later.'
	    }, onTweeted)
            isAsleep = true
        }
    } else {
        if(isAsleep){
        isAsleep = false
        T.post('account/update_profile', {
            name:'Qwitter Bot',
            description: 'I\'m a bot that helps you quit twitter. I appear only when I am needed most'
        }, onTweeted)
    }
  }
}