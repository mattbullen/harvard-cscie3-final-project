### CSCI E-3 Final Project

My final project is an app that lets a user text images from a website to a phone.

##### Try it out: https://radiant-shelf-9720.herokuapp.com/

##### How it works:

1. Text "start" to my Twilio.com phone number, 617-207-6339. Twilio.com provides cloud-based phone exchange servers that let a website text a cell phone. (To stop the app, text "stop" to the same number.)

2. Two-factor authentication: enter your phone number again into the input field in the right panel of the app. This acts as both confirmation that the app has the right number, and as an anti-spam precaution.

3. Search for an image: the app runs a Google Custom Search through Google Images, then returns the first ten hits.

4. Select an image either by clicking on one of the Handlebars.js-generated thumbnails, or by using the "Select This Image" button in the modal gallery view.

5. Optional: you can add a note to be texted with the image you select, or send yourself a text-only SMS message, too.

6. The send button prompts the server to create a new text message, which it then sends to your phone.

7. Resources: The server-side uses the Twilio.com SMS/MMS API, with Node.js + Express.js + MongoDB + Jade running on a Heroku.com server. The client-side uses jQuery, Bootstrap.js, blueimp.js, and Handlebars.js.