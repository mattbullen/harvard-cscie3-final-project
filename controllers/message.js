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
            return respond("Server error! Please try again.");
        }
        if (!sub) {
            
            // If there's no user associated with this phone number, create an entry for one.
            var newSubscriber = new Subscriber({
                phone: phone
            });

            newSubscriber.save(function(err, newSub) {
                if (err || !newSub) {
                    return respond("Server error! Please try again.");
                }
                
                // A non-subscribed user sends a text; prompt to start the app.
                respond('Text "start" to begin using the app.');
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

        // Handle valid user commands: start or stop.
        if (msg === "start" || msg === "stop") {
            
            // Save users that send a "start" command.
            subscriber.subscribed = (msg === "start");
            subscriber.save(function(err) {
                
                if (err) {
                    return respond("Server error! Please try again.");
                }
                
                // Otherwise, the subscription list is updated.
                var responseMessage = "You're ready to use the app!";
                if (!subscriber.subscribed)
                    responseMessage = 'You\'ve been removed from the app. Reply with "start" to use the app again.';

                respond(responseMessage);
            });
        } else {
            
            // Handle invalid commands by prompting for a usable command.
            var responseMessage = 'Please choose either "start" or "stop" and try again.';

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

// Handle form submission for validating a user's phone number.
exports.validatePhone = function(request, response) {
    
    // Get phone number from form submission.
    console.log("exports.validatePhone():", request.body);
    var user = request.body.confirm;
    
    // Use model function to validate a user's phone number.
    Subscriber.validatePhone(user, function(err) {
        if (err) {
            response.send({
                "message": {
                    "fail": err,
                    "user": user,
                    "valid": false
                }
            });
        } else {
            response.send({
                "message": {
                    "user": user,
                    "valid": true
                }
            });
        }
    });
};

// Handle form submission for sending a multimedia text message to a subscribed user.
exports.sendMessages = function(request, response) {
    
    // Get message info from form submission.
    console.log("exports.sendMessages():", request.body);
    var message = request.body.message;
    var imageURL = request.body.imageURL;
    var user = request.body.confirm;
    
    // Use model function to send a multimedia text message to a subscribed user.
    Subscriber.sendMessage(message, imageURL, user, function(err) {
        if (err) {
            response.send({
                "fail": err
            });
        } else {
            response.send({
                "message": {
                    "user": user,
                    "message": message,
                    "imageURL": imageURL
                }
            });
        }
        
        // Uncomment to allow page reloading after form submission.
        // response.redirect("/");
    });
};