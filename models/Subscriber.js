var mongoose = require("mongoose");
var twilio = require("twilio");
var config = require("../config");

// Create an authenticated Twilio REST API client.
var client = twilio(config.accountSid, config.authToken);

// Create a subscribed user storage schema in MongooseDB.
var SubscriberSchema = new mongoose.Schema({
    phone: String,
    subscribed: {
        type: Boolean,
        default: false
    }
});

// Static function to validate a subscribed user's phone number.
SubscriberSchema.statics.validatePhone = function(user, callback) {
    
    console.log("SubscriberSchema.statics.validatePhone: " + user);
    
    // Check if a submitted phone number is on the list of subscribed user phone numbers.
    Subscriber.find({
        subscribed: true,
        phone: user
    }, function(err, docs) {
        if (err || docs.length === 0) {
            return callback.call(this, "Phone Number Not Found");
        } else {
            return callback.call(this);
        }
        console.log("Subscriber.find():", docs);
    });

};

// Static function to send a multimedia text message to a subscribed user.
SubscriberSchema.statics.sendMessage = function(message, url, user, callback) {
    
    console.log("SubscriberSchema.statics.sendMessage(): " + message + " " + url + " " + user);
    
    // Find all subscribed users.
    Subscriber.find({
        subscribed: true,
        phone: user
    }, function(err, docs) {
        if (err || docs.length === 0) {
            return callback.call(this, "Phone Number Not Found");
        }
        console.log("Subscriber.find():", docs);
        sendMessages(docs);
    });

    // Send a text message to a matched user.
    function sendMessages(docs) {
        docs.forEach(function(subscriber) {
            
            // Message contents:
            var options = {
                to: subscriber.phone,
                from: config.twilioNumber,
                body: message
            };

            // Include the image URL, if the user chose an image.
            if (url) {
                options.mediaUrl = url;
            }
            
            // Send the message.
            client.sendMessage(options, function(err, response) {
                console.log("client.sendMessage():", options);
                if (err) {
                    console.error("client.sendMessage() failed:", err);
                } else {
                    console.log("client.sendMessage() sent a text to: " + subscriber.phone);
                }
            });
        });

        // Don't wait on success/failure, just indicate that the queue is ready for delivery.
        callback.call(this);
    }
};

var Subscriber = mongoose.model("Subscriber", SubscriberSchema);
module.exports = Subscriber;