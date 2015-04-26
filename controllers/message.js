var Subscriber = require("../models/Subscriber");

// Handle Twilio SMS / MMS webhook requests:
exports.webhook = function(request, response) {

    // Get the user's phone number.
    var phone = request.body.From;

    // Look for a user with the given phone number.
    Subscriber.findOne({
        phone: phone
    }, function(err, sub) {
        if (err) {
            return respond("Whoops, please try again.");
        }
        if (!sub) {
            
            // If there's no user associated with this phone number, create an entry for one.
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) {
                    return respond("Whoops, please try again.");
                }
                
                // A non-subscribed user sends a text; prompt to subscribe.
                respond('Text "subscribe" to begin using the app.');
            });
        } else {
            // For an existing user, process any message they send and send back a message.
            processMessage(sub);
        }
    });

    // Process any message the user sends.
    function processMessage(subscriber) {
        
        // Get the text message command sent by the user.
        var msg = request.body.Body || "";
        msg = msg.toLowerCase().trim();

        // Handle valid user commands: subscribe or unsubscribe.
        if (msg === "subscribe" || msg === "unsubscribe") {
            
            // Save users that send a "subscribe" command.
            subscriber.subscribed = msg === "subscribe";
            subscriber.save(function(err) {
                
                if (err) {
                    return respond("Whoops, please try again.");
                }
                
                // Otherwise, the subscription list is updated.
                var responseMessage = "You're ready to use the app!";
                if (!subscriber.subscribed)
                    responseMessage = 'You are now unsubscribed. Reply with "subscribe" to use the app again.';

                respond(responseMessage);
            });
        } else {
            
            // Handle invalid commands by prompting for a usable command.
            var responseMessage = 'Sorry, choose either "subscribe" or "unsubscribe" and try again.';

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
            // request.flash("errors", err.message);
            response.send({
                "message": err
            });
        } else {
            // request.flash("successes", "Your text is on the way!");
            response.send({
                "message": "Your text is on the way!"
            });
        }
        
        // Uncomment to allow page reloading after form submission.
        // response.redirect("/");
    });
};