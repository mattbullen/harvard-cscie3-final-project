var mongoose = require('mongoose');
var twilio = require('twilio');
var config = require('../config');

// create an authenticated Twilio REST API client
var client = twilio(config.accountSid, config.authToken);

var SubscriberSchema = new mongoose.Schema({
    phone: String,
    subscribed: {
        type: Boolean,
        default: false
    }
});

// Static function to send a message to all current subscribers
SubscriberSchema.statics.sendMessage = function(message, url, user, callback) {
    
    console.log("SubscriberSchema.statics.sendMessage(): " + message + " " + url + " " + user);
    
    // Find all subscribed users
    Subscriber.find({
        subscribed: true,
        phone: user
    }, function(err, docs) {
        if (err || docs.length == 0) {
            return callback.call(this, {
                message: 'Couldn\'t find any subscribers!'
            });
        }

        // Otherwise send messages to all subscribers
        console.log("DOCS: ", docs);
        sendMessages(docs);
    });

    // Send messages to all subscribers via Twilio
    function sendMessages(docs) {
        docs.forEach(function(subscriber) {
            // Create options to send the message
            var options = {
                to: subscriber.phone,
                from: config.twilioNumber,
                body: message
            };

            // Include media URL if one was given for MMS
            if (url) options.mediaUrl = url;
            
            // Send the message!
            client.sendMessage(options, function(err, response) {
                
                console.log("client.sendMessage():", options);
                
                if (err) {
                    // Just log it for now
                    console.error(err);
                } else {
                    // Log the last few digits of a phone number
                    var masked = subscriber.phone.substr(0, subscriber.phone.length - 5);
                    masked += '*****'; 
                    console.log("client.sendMessage() sent the message to: " + masked);
                }
            });
        });

        // Don't wait on success/failure, just indicate all messages have been
        // queued for delivery
        callback.call(this);
    }
};

var Subscriber = mongoose.model('Subscriber', SubscriberSchema);
module.exports = Subscriber;