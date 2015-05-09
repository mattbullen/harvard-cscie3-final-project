# Harvard CSCI E-3 Final Project

This is my final project for Harvard's CSCI E-3 JavaScript programming class, Spring 2015 semester. It's a small Node.js app that demonstrates a solution for transferring images from a desktop site to a phone via multimedia text messaging over the cloud . . . in other words, how to have a website text your phone!

#### Try it out: https://cscie3.herokuapp.com/

#### How it works:

1. Text "start" to my Twilio.com phone number, 617-207-6339. Twilio.com provides cloud-based phone exchange servers that let a website text a cell phone. (To stop the app, text "stop" to the same number.)

2. Two-factor authentication: enter your phone number again into the input field in the right panel of the app. This acts as both confirmation that the app has the right number, and as an anti-spam precaution.

3. Search for an image: the app runs a Google Custom Search through Google Images, then returns the first ten hits.

4. Select an image either by clicking on one of the Handlebars.js-generated thumbnails, or by using the "Select This Image" button in the modal gallery view.

5. Optional: add a note to be sent with the image you've chosen.

6. The "Send" button prompts the server to create and send a new MMS text message. A MongoDB schema then stores the message details in a JSON array on the server, which you can view using the "History" button.

7. Resources: The server-side uses the Twilio.com SMS/MMS API, with Node.js + Express.js + MongoDB + Jade running on a Heroku.com server. The client-side uses jQuery, Bootstrap.js, blueimp.js, and Handlebars.js.
