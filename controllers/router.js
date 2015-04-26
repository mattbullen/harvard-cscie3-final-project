var pages = require("./pages");
var message = require("./message");

// Map routes to controller functions:
module.exports = function(app) {
    
    // Twilio SMS webhook route:
    app.post("/message", message.webhook);

    // Render the page HTML from its Jade template:
    app.get("/", pages.showForm);

    // Form submission and texting messages to subscribed users:
    app.post("/message/send", message.sendMessages);
};