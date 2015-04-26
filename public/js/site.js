// Main page loading function.
$(document).ready(function() {
    
    // Make sure the loading progress bar and message input are hidden on page load.
    $("#validation").fadeToggle(0);
    $("#search-google-container").fadeToggle(0);
    $("#gallery-progress").fadeToggle(0);
    $("#message-container").fadeToggle(0);
    
    /*
        Run a Google Custom Search for images. Reference API: 
            https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    */
    $("#search-google-button").click(function() {
        
        $("#gallery-content").fadeToggle().html("");
        window.setTimeout(function() {
            $("#gallery-progress").fadeToggle();
        }, 500);
        
        $.ajax({
            url: "https://www.googleapis.com/customsearch/v1?key=AIzaSyBcb5-Y-_4xba-AKItQOm9EixY51bV7VNY&cx=007271074161097264321:keiwv-_atxe&num=10&imgType=photo&searchType=image&q=" + $("#search-google-input").val(),
            type: "GET",
            dataType: "json",  
            success: function(response) {
            
                // Check the returned JSON object.
                console.log("\nGoogle Custom Search returned:", response);

                // Template out the gallery slides from the JSON object.
                var slides = {
                    "images": response.items
                };
                console.log("\nSlides to template:", slides);
                var template = Handlebars.compile($("#gallery-template").html());
                $("#gallery-content").html(template(slides));
                
                // Modified from: http://stackoverflow.com/questions/3670823/how-to-run-a-jquery-code-after-loading-all-the-images-in-my-page
                var loaded = 0;
                $("img.slide-image").load(function() {
                    
                    // Add loading bar progress updates.
                    ++loaded;
                    document.getElementById("gallery-progress-stripe").style.width = "" + (loaded * 10) + "%";

                    if (loaded === 10) {
                        
                        window.setTimeout(function() {
                            $("#gallery-progress").fadeToggle();
                            window.setTimeout(function() {
                                $("#gallery-content").fadeToggle();
                            }, 500);
                        }, 500);
                        
                        // Add image selection by clicking on a slide.
                        $("img.slide-image").click(function() {
                            $("div.slide-box").removeClass("slide-selected");
                            
                            var href = $(this).attr("src");
                            console.log("\nHref from thumbnail selection:", href);
                                
                            $("#imageURL").val(href);
                            console.log("\nHref passed to hidden form field:", $("#imageURL").val());
                            
                            var index = $(this).attr("data-index");
                            console.log("\nImage index:", index);
                            
                            $("#slide-" + index).toggleClass("slide-selected");
                            
                            $("#message-container").fadeToggle();
                        });
                    }
                });
    
            },
            
            error: function(response) {
                console.log("\nGoogle Custom Search returned:", response);
            }
            
        }); // End $.ajax();
        
    }); // End $("#search").click();
    
    // Add an image selection button to the full-screen modal.
    $("#modal-select-image-button").click(function() {
        
        $("div.slide-box").removeClass("slide-selected");
        
        var selected = $("li.active");
        
        var href = $(selected).attr("title"); 
        console.log("\nHref from modal selection:", href);
        
        $("#imageURL").val(href);
        console.log("\nHref passed to hidden form field:", $("#imageURL").val());
        
        var index = $(selected).attr("data-index");
        console.log("\nImage index:", index);
                                
        $("#slide-" + index).toggleClass("slide-selected");
        
    });
    
    /*
        Submit the form without reloading the page or erasing prior inputs. Modified from:
            http://stackoverflow.com/questions/22163220/prevent-page-reload-after-form-submit-node-no-ajax-available
    */
    $("#send-text").click(function(e) {
        e.preventDefault();
        $.ajax({
            url: "/message/send",
            data: $("#page-form").serialize(),
            type: "POST",
            success: function(data){
                console.log('$("#send-text").click():', data.message);
            },
            error: function(data){
                console.log('$("#send-text").click():', data.message);
            }
        });
    });
    
    // Add an event listener to the user-visible phone number input field.
    $("#confirm-visible").keyup(function(event) {
        validatePhone(event);
    });
    
}); // End $(document).ready();

// Toggles a server response message.
function toggleResponseMessage(text, fade) {
	var message = $("#validation").html(text);
	if (fade === true) {
		window.setTimeout(function() {
			message.fadeToggle({ duration: 500 });
		}, 3500);
	} else {
        message.fadeToggle();
    }
	return false;
}

// Validate each password input field as the user types.
function validatePhone(event) {
    
    if (event.keyCode === 8) {
        $("#confirm").val("");
        return false;
    }
    
    // Get the input value.
	var source = document.getElementById("confirm-visible");
	var phone = source.value.replace(/\D*/g, "");
    var length = phone.length;
    
    // If we have all 10 numerical digits, fill the hidden form field's value.
    if (length === 10) {
        $("#confirm").val("+1" + phone);
        console.log($("#confirm").val());
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
    
    // Test if the final value is usable.
	var test = source.validity.patternMismatch;
    length = phone.length;
	if (test === false && length === 12) {
		
        $.ajax({
            url: "/message/validate",
            data: {
                "confirm": $("#confirm").val()
            },
            type: "POST",
            success: function(data){
                console.log("\nvalidatePhone(success) returned:", data.message);
                if (data.message.valid) {
                    toggleResponseMessage("Phone number confirmed. On to the next step!", false);
                    window.setTimeout(function() {
                        $("#search-google-container").fadeToggle();
                    }, 1000);
                } else {
                    toggleResponseMessage("Invalid! Typo? Have you started the app?", true);
                    $("#confirm").focus();
                }
            },
            error: function(data){
                console.log("\nvalidatePhone(error) returned:", data.message);
                toggleResponseMessage("Invalid! Typo? Have you started the app?", true);
                $("#confirm").focus();
            }
        });
        
	}
	return test;
}