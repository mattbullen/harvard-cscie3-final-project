var Subscriber = require('../models/Subscriber');

// Create a function to handle Twilio SMS / MMS webhook requests
exports.webhook = function(request, response) {

    // Get the user's phone number
    var phone = request.body.From;

    // Try to find a subscriber with the given phone number
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) {
            return respond('Whoops, please try again.');
        }
        if (!sub) {
            
            // If there's no subscriber associated with this phone number, create one.
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) {
                    return respond('Whoops, please try again.');
                }
                
                // We're signed up but not subscribed - prompt to subscribe.
                respond('Text "subscribe" to begin using the app.');
            });
        } else {
            // For an existing user, process any input message they sent and send back an appropriate message.
            processMessage(sub);
        }
    });

    // Process any message the user sent to us
    function processMessage(subscriber) {
        
        // Get the text message command sent by the user.
        var msg = request.body.Body || '';
        msg = msg.toLowerCase().trim();

        // Conditional logic to do different things based on the command from the user.
        if (msg === 'subscribe' || msg === 'unsubscribe') {
            
            // If the user has elected to subscribe for messages, flip the bit and indicate that they have done so.
            subscriber.subscribed = msg === 'subscribe';
            subscriber.save(function(err) {
                
                if (err) {
                    return respond('Whoops, please try again.');
                }
                
                // Otherwise, our subscription has been updated.
                var responseMessage = 'You are now subscribed.';
                if (!subscriber.subscribed)
                    responseMessage = 'You are now unsubscribed. Reply with "subscribe" to subscribe again.';

                respond(responseMessage);
            });
        } else {
            
            // If we don't recognize the command, text back with the list of available commands.
            var responseMessage = 'Sorry, there must have been a typo. Choose either "subscribe" or "unsubscribe" and try again.';

            respond(responseMessage);
        }
    }

    // Set Content-Type response header and render XML (TwiML) response in a Jade template - sends a text message back to user.
    function respond(message) {
        response.type("text/xml");
        response.render("twiml", {
            message: message
        });
    }
};

// Handle form submission
exports.sendMessages = function(request, response) {
    
    // Get message info from form submission.
    console.log("exports.sendMessages():", request.body);
    var message = request.body.message;
    var imageURL = request.body.imageURL;
    var user = request.body.confirm;
    
    // Use model function to send messages to all subscribers.
    Subscriber.sendMessage(message, imageURL, user, function(err) {
        if (err) {
            //request.flash('errors', err.message);
            response.send({
                "message": err
            });
        } else {
            //request.flash('successes', 'Your text is on the way!');
            response.send({
                "message": "Your text is on the way!"
            });
        }

        //response.redirect('/');
    });
};