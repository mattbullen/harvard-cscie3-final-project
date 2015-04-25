// Main page loading function.
$(document).ready(function() {
    
    $("#gallery-progress").fadeToggle(0);
    
    /*
        Google Custom Search API: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    */
    $("#search-google-button").click(function() {
        
        $("#gallery-content").fadeToggle();
        window.setTimeout(function() {
            $("#gallery-progress").fadeToggle();
        }, 500);
        
        $.ajax({
            
            url: 'https://www.googleapis.com/customsearch/v1?key=AIzaSyBcb5-Y-_4xba-AKItQOm9EixY51bV7VNY&cx=007271074161097264321:keiwv-_atxe&num=10&imgType=photo&searchType=image&q=' + $("#search-google-input").val(),
            
            type: 'GET',
           
            dataType: 'json',
            
            success: function(response) {
            
                console.log("\nGoogle Custom Search returned:", response);
                /*
                for (var i = 0; i < response.items.length; i++) {
                    var image = new Image();
                    image.src = response.items[i].link;
                    image.style.width = "100px";
                    image.onclick = function(event){
                        console.log(event.target.src);
                        $("#imageURL").val(event.target.src);
                        console.log($("#imageURL").val());
                    };
                    document.getElementById("gallery").appendChild(image);
                }
                */
                // Template out the gallery slides.
                var slides = {
                    "images": response.items
                };
                console.log("\nSlides to template:", slides);
                var template = Handlebars.compile($("#template").html());
                $("#gallery-content").html(template(slides));
                
                // Modified from: http://stackoverflow.com/questions/3670823/how-to-run-a-jquery-code-after-loading-all-the-images-in-my-page
                var loaded = 0;
                $("img.slide-image").load(function() {
                    
                    ++loaded;
                    document.getElementById("gallery-progress-stripe").style.width = "" + (loaded * 10) + "%";

                    if (loaded === 10) {
                        
                        window.setTimeout(function() {
                            $("#gallery-progress").fadeToggle();
                            window.setTimeout(function() {
                                $("#gallery-content").fadeToggle();
                            }, 500);
                        }, 500);
                        
                        $("img.slide-image").click(function() {
                            $("div.slide-box").removeClass("slide-selected");
                            
                            var href = $(this).attr("src");
                            console.log("\nHref from thumbnail selection:", href);
                                
                            $("#imageURL").val(href);
                            console.log("\nHref passed to hidden form field:", $("#imageURL").val());
                            
                            var index = $(this).attr("data-index");
                            console.log("\nImage index:", index);
                            
                            $("#slide-" + index).toggleClass("slide-selected");
                        });
                    }
                });
    
            },
            
            error: function(response) {
                console.log("\nGoogle Custom Search returned:", response);
            }
            
        }); // End $.ajax();
        
    }); // End $("#search").click();
    
    $("#modal-select-image-button").click(function() {
        
        var selected = $("li.active");
        
        var href = $(selected).attr("title"); 
        console.log("\nHref from modal selection:", href);
        
        $("#imageURL").val(href);
        console.log("\nHref passed to hidden form field:", $("#imageURL").val());
        
        var index = $(selected).attr("data-index");
        console.log("\nImage index:", index);
                                
        $("#slide-" + index).toggleClass("slide-selected");
    
    });
    
}); // End $(document).ready();






























