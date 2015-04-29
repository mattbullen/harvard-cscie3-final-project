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
    },
    history: [{
        "url": String,
        "text": String
    }]
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
    
    // Find the requested user by phone number and update the user's message history.
    Subscriber.find({
        phone: user,
        subscribed: true
    }, function(err, docs) {
        if (err) {
            console.log("Subscriber.find(error):", err);
            return callback.call(this, "Phone Number Not Found");
        }
        
        console.log("Subscriber.find(found):", docs);
        
        Subscriber.update(
            { phone: user },
            { $push: { 
                "history": {
                    url: url,
                    text: message
                } 
            } },
            //{
            //    safe: true, 
            //    upsert: true 
            //},
            function(err, docs) {
                if (err) {
                    console.log("Subscriber.update(error):", docs);
                    return callback.call(this, "Phone Number Not Found");
                }
                console.log("Subscriber.update(success):", docs);
                sendMessages(docs);
            }
        );
        
        //console.log("Subscriber.find(update history):", docs);
        //sendMessages(docs);
    });
    /*
    // Then send the text message.
    Subscriber.find({
        phone: user,
        subscribed: true
    }, function(err, docs) {
        if (err || docs.length === 0) {
            return callback.call(this, "Phone Number Not Found");
        }
        console.log("Subscriber.find(after update):", docs);
        sendMessages(docs);
    });
    
    
    Subscriber.findByIdAndUpdate(
        { phone: user },
        { $push: { 
            "history": {
                url: url,
                text: message
            } 
        } },
        {
            safe: true, 
            upsert: true 
        },
        function(err, docs) {
            if (err) {
                console.log("Subscriber.findByIdAndUpdate(error):", docs);
                return callback.call(this, "Phone Number Not Found");
            }
            console.log("Subscriber.findByIdAndUpdate(success):", docs);
            sendMessages(docs);
        }
    );
    */
    // Inner function to send a text message to a matched user's phone.
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
                    callback.call(this, err);
                } else {
                    console.log("client.sendMessage() sent a text to: ", subscriber.phone);
                    callback.call(this);
                }
            });
        });

        // Don't wait on success/failure, just indicate that the queue is ready for delivery.
        // callback.call(this);
    }
};

var Subscriber = mongoose.model("Subscriber", SubscriberSchema);
module.exports = Subscriber;