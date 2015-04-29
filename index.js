require("newrelic");
var http = require("http");
var mongoose = require("mongoose");
var config = require("./config");

// Start the database connection.
mongoose.connect(config.mongoUrl);

// Create Express web app.
var app = require("./webapp");

// Create an HTTP server and listen on the configured port.
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log("Express server listening on *:", config.port);
});