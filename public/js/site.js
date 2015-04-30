// Main page loading function.
$(document).ready(function() {
    
    // Make sure the elements the user will see in the user interaction cascade are hidden on page load.
    fadeOutForm(0);
    
    // Validate the phone number entered by the user.
    $("#confirm-visible").keyup(function(event) {
        validatePhone(event);
    });
    
     // Run a Google Custom Search for images.
    $("#search-google-button").click(function() {
        loadGallerySlides();
        $(this).blur();
    });
    
    // Add an image selection button to the full-screen modal (it's not included in the modal plugin's default display state).
    $("#modal-select-image-button").click(function() {
        modalImageSelect();
        $(this).blur();
    });
    
    // Send a multimedia text to a user's phone.
    $("#message-send-button").click(function(event) {
        sendText(event);
        $(this).blur();
    });

    return false;
});

// Fade out the form elements.
function fadeOutForm(duration) {
    if (!duration) {
        var duration = 400;
    }
    $("#confirm").val("");
    $("#confirm-validation").fadeOut(duration);
    $("#search-google-container").fadeOut(duration);
    $("#gallery-progress").fadeOut(duration);
    $("#gallery-content").fadeOut(duration);
    $("#message-container").fadeOut(duration);
    $("#message-validation").fadeOut(duration);
    return false;
}

// Fade in the form elements in a cascade pattern based on the level of interaction the user has had with the form.
function fadeInForm() {
    $("#search-google-container").fadeIn();
    $("#search-google-input").focus();
    var galleryContent = $("#gallery-content").children();
    if (galleryContent.length > 0) {
        $("#gallery-content").fadeIn();
        var selectedSlideExists = $(".slide-selected").length;
        if (selectedSlideExists !== 0) {
            $("#message-container").fadeIn();
            $("#message").focus();
        }
    }
    return false;
}

// Toggles a server response message flash bar element next to the phone input field.
function toggleResponseMessage(id, text, fade, color) {
    if (!color || color === "blue") {
        var color = "rgb(66, 139, 202)";
    }
    if (color === "red") {
        var color = "rgb(175, 36, 38)";
    }
    var message = $("#" + id).html(text).css({
        "background-color": color
    });
    message.fadeIn();
    if (fade === true) {
        window.setTimeout(function() {
            message.fadeOut();
        }, 3500);
    }
    return false;
}

// Check and format the phone number's value in the user-visible input field.
function checkPhonePattern() {
    
    // Get the input value.
    var source = document.getElementById("confirm-visible");
    var phone = source.value.replace(/\D*/g, "");
    var length = phone.length;
    
    // If we have all 10 numerical digits, fill the hidden form field's value.
    if (length === 10) {
        $("#confirm").val("+1" + phone);
        console.log("\ncheckPhonePattern() stored this phone number in input#confirm:", $("#confirm").val());
    }
    
    // Format the look of the phone string in the user-visible input field.
    if (length < 1) {
        source.value = phone;
        return true;
    }
    if (length > 2) {
        phone = phone.substring(0, 3) + "-" + phone.substring(3, length);
        length = phone.length;
    }
    if (length > 6) {
        phone = phone.substring(0, 7) + "-" + phone.substring(7, length);
        length = phone.length;
    }
    source.value = phone;
    length = phone.length;
    
    return (source.validity.patternMismatch === false && length === 12);
}

// Server-check to see if the user entered a valid phone number (on the list of subscribed users).
function serverValidatePhone() {
    $.ajax({
        url: "/message/validate",
        data: {
            "confirm": $("#confirm").val()
        },
        type: "POST",
        success: function(data){
            console.log("\nvalidatePhone(success) returned:", data.message);
            if (data.message.valid) {
                toggleResponseMessage("confirm-validation", "Valid phone number. App running!", false, "blue");
                window.setTimeout(function() {
                    fadeInForm();
                }, 1000);
            } else {
                toggleResponseMessage("confirm-validation", "Typo? Have you started the app?", false, "red");
                $("#confirm").focus();
            }
        },
        error: function(data){
            console.log("\nvalidatePhone(error) returned:", data.message);
            toggleResponseMessage("confirm-validation", "Typo? Have you started the app?", false, "blue");
            $("#confirm").focus();
        }
    });
    return false;
}

// Validate each password input field as the user types.
function validatePhone(event) {   
    // Capture the backspace keyboard event and hide the form elements until the user supplies a valid phone number.
    if (event.keyCode === 8) {
        fadeOutForm();
        return false;
    }
    // Check that the phone number is usable (on the list of subscribed user phone numbers).
    if (checkPhonePattern()) {
        serverValidatePhone();
    }
    return false;
}

/*
    Run a Google Custom Search for images and load the gallery with the returned images. Reference API:
        https://developers.google.com/custom-search/json-api/v1/reference/cse/list
*/
function loadGallerySlides() {
    
    // Show the download progress bar; hide the gallery slides container element and text message note input (if shown).
    $("#gallery-content").fadeOut().html("");
    $("#message-container").fadeOut(0);
    window.setTimeout(function() {
        $("#gallery-progress").fadeIn();
    }, 500);
        
    $.ajax({
        url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyBcb5-Y-_4xba-AKItQOm9EixY51bV7VNY&cx=007271074161097264321:keiwv-_atxe&num=10&imgType=photo&searchType=image&q=" + $("#search-google-input").val(),
        type: "GET",
        dataType: "json",  
        success: function(response) {
        
            // Check the returned JSON object.
            console.log("\nloadGallerySlides(success) search returned:", response);

            // Template out the gallery slides from the JSON object.
            var slides = {
                "images": response.items
            };
            console.log("\nloadGallerySlides() has these slides to template:", slides);
            var template = Handlebars.compile($("#gallery-template").html());
            $("#gallery-content").html(template(slides));

            // Modified from: http://stackoverflow.com/questions/3670823/how-to-run-a-jquery-code-after-loading-all-the-images-in-my-page
            var loaded = 0;
            $("img.slide-image").load(function() {
        
                // Add download progress bar updates.
                ++loaded;
                document.getElementById("gallery-progress-stripe").style.width = "" + (loaded * 10) + "%";
                
                // When all 10 images have loaded, remove the download progress bar and display the new gallery.
                if (loaded === 10) {

                    window.setTimeout(function() {
                        $("#gallery-progress").fadeOut();
                        window.setTimeout(function() {
                            $("#gallery-content").fadeIn();
                            // For the case where the user entered some text in the note input field, then ran a new Google search:
                            var noteContent = $("#message").val();
                            if (noteContent !== "" && noteContent.length > 0) {
                                $("#message-container").fadeIn();
                            }
                        }, 500);
                    }, 500);
                    
                    // Add image selection by clicking on a slide. Needs to happen here, since the slides are dynamically generated.                 
                    slideImageSelect();

                }
            });
        },       
        error: function(response) {
            console.log("\nloadGallerySlides(error) search returned:", response);
        }

    }); // End $.ajax();

    return false;
}

// Select an image by clicking on its thumbnail in a slide, highlight its slide border, and pass the image URL to the form.
function slideImageSelect() {
    $("img.slide-image").click(function() {
        $("div.slide-box").removeClass("slide-selected");       
        var href = $(this).attr("src");
        console.log("\nslideImageSelect() selected this image URL:", href);          
        $("#imageURL").val(href);
        console.log("\nslideImageSelect() passed this image URL to input#imageURL:", $("#imageURL").val());
        var thumbnail = $(this).find(">:first-child").attr("src"); console.log(thumbnail);
        $("#thumbnailURL").val(thumbnail);
        var index = $(this).attr("data-index");        
        $("#slide-" + index).toggleClass("slide-selected");    
        $("#message-container").fadeIn();
    });
    return false;
}

// Select an image using the modal's "Select This Image" button, highlight its slide border, and pass the image URL to the form.
function modalImageSelect() {    
    $("div.slide-box").removeClass("slide-selected");   
    var selected = $("li.active");    
    var href = $(selected).attr("title"); 
    console.log("\nmodalImageSelect() selected this image URL:", href);    
    $("#imageURL").val(href);
    console.log("\nmodalImageSelect() passed this image URL to input#imageURL:", $("#imageURL").val());
    var thumbnail = $('a[href="' + href + '"]').find(">:first-child").attr("src"); console.log(thumbnail);
    $("#thumbnailURL").val(thumbnail);
    var index = $(selected).attr("data-index");        
    $("#slide-" + index).toggleClass("slide-selected");
    $("#message-container").fadeIn();
    return false;
}

/*
    Submit the form and send a multimedia text to a user without reloading the page or erasing prior inputs. Modified from:
        http://stackoverflow.com/questions/22163220/prevent-page-reload-after-form-submit-node-no-ajax-available
*/
function sendText(event) {
    event.preventDefault();
    $.ajax({
        url: "/message/send",
        data: $("#page-form").serialize(),
        type: "POST",
        success: function(data){
            console.log('\nsendText(success):', data.message);
            if (data.message.sent) {
                toggleResponseMessage("message-validation", "Your text is on the way! Check your phone in a minute or two.", true, "blue");
            } else {
                toggleResponseMessage("message-validation", "The server couldn't send your text. Try again in a few minutes.", true, "red");
            }
        },
        error: function(data){
            console.log('\nsendText(error):', data.message);
            toggleResponseMessage("message-validation", "The server couldn't send your text. Try again in a few minutes.", true, "red");
        }
    });
    return false;
}