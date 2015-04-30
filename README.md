# CSCI E-3 Final Project

I had the idea for my final project when I was browsing online for wallpaper images - have you ever found a great image on a desktop site that you wanted to use for your phone's wallpaper, but didn't want to go through the usual steps of downloading it and transferring to your phone manually? Or looking up the site on your phone, especially for sites that haven't been made mobile-ready?

My final project is an app that demonstrates a solution for transferring images directly from a desktop site to a phone via MMS text messaging.

#### Try it out: https://radiant-shelf-9720.herokuapp.com/

#### How it works:

1. Text "start" to my Twilio.com phone number, 617-207-6339. Twilio.com provides cloud-based phone exchange servers that let a website text a cell phone. (To stop the app, text "stop" to the same number.)

2. Two-factor authentication: enter your phone number again into the input field in the right panel of the app. This acts as both confirmation that the app has the right number, and as an anti-spam precaution.

3. Search for an image: the app runs a Google Custom Search through Google Images, then returns the first ten hits.

4. Select an image either by clicking on one of the Handlebars.js-generated thumbnails, or by using the "Select This Image" button in the modal gallery view.

5. Optional: add a note to be sent with the image you've chosen.

6. The "Send" button prompts the server to create and send a new MMS text message. A MongoDB schema then stores the message details in a JSON array on the server, which you can view using the "History" button.

7. Resources: The server-side uses the Twilio.com SMS/MMS API, with Node.js + Express.js + MongoDB + Jade running on a Heroku.com server. The client-side uses jQuery, Bootstrap.js, blueimp.js, and Handlebars.js.
