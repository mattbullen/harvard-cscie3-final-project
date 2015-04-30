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
        console.log("SubscriberSchema.statics.validatePhone():", docs);
    });

};

// Static function to get a user's history of sent text messages.
SubscriberSchema.statics.getHistory = function(user, callback) {
    
    console.log("SubscriberSchema.statics.getHistory: " + user);
    
    // Check if a submitted phone number is on the list of subscribed user phone numbers.
    Subscriber.find({
        subscribed: true,
        phone: user
    }, function(err, docs) {
        if (err || docs.length === 0) {
            return callback.call(this, "", "Phone Number Not Found");
        } else {
            history = docs[0].history;
            return callback.call(this, history);
        }
        console.log("SubscriberSchema.statics.getHistory():", docs);
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
        
        if (err || docs.length === 0) {
            console.log("Subscriber.find(error):", err);
            return callback.call(this, "Phone Number Not Found");
        }
        
        // So the internal ID isn't exposed to the browser or the user.
        var id = docs[0]._id;
        console.log("Subscriber.find(id):", id);
        
        // Source: http://stackoverflow.com/questions/15621970/pushing-object-into-array-schema-in-mongoose
        Subscriber.findByIdAndUpdate(
            id,
            { $push: { 
                "history": {
                    "url": url,
                    "text": message
                } 
            } },
            {
                upsert: true 
            },
            function(err, docs) {
                if (err || docs.length === 0) {
                    console.log("Subscriber.findByIdAndUpdate(error):", docs);
                    return callback.call(this, "History Update Error");
                }
                console.log("Subscriber.findByIdAndUpdate(success):", docs);
                sendMessages(docs);  
            }
        );
    });

    // Inner function to send a text message to a matched user's phone.
    function sendMessages(docs) {
        
        // Catch the entry.
        console.log("Subscriber.sendMessages(docs):", docs);        
        history = docs.history;

        // Message contents:
        var options = {
            to: docs.phone,
            from: config.twilioNumber,
            body: message
        };

        // Include the image URL, if the user chose an image.
        if (url) {
            options.mediaUrl = url;
        }
            
        // Text the message to the subscriber.
        client.sendMessage(options, function(err, response) {
            console.log("client.sendMessage():", options);
            console.log("client.sendMessage():", this);
            if (err) {
                console.error("client.sendMessage() failed:", err);
                callback.call(this, history, err);
            } else {
                console.log("client.sendMessage() sent a text to: ", docs.phone);
                callback.call(this, history);
            }
        });
    }
};

var Subscriber = mongoose.model("Subscriber", SubscriberSchema);
module.exports = Subscriber;