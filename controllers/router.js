var pages = require("./pages");
var message = require("./message");

// Map routes to controller functions:
module.exports = function(app) {
    
    // Twilio SMS webhook route:
    app.post("/message", message.webhook);

    // Render the page HTML from its Jade template:
    app.get("/", pages.showForm);

    // Check if a phone number is on the list of subscribed user phone numbers:
    app.post("/message/validate", message.validatePhone);
    
    // Get a user's history of sent text messages:
    app.post("/message/history", message.getHistory);
    
    // Form submission for texting multimedia messages to subscribed users:
    app.post("/message/send", message.sendMessages);
    
};