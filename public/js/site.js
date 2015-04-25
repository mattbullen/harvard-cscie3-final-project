// Main page loading function.
$(document).ready(function() {
                        
    /*
        Google Custom Search API: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    */
    $("#search-google-button").click(function() {
        
        $("#gallery-content").fadeToggle();
        $("#gallery-progress").fadeToggle();
        
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
                var loaded = 10;
                $("img.slide-image").load(function() {
                    ++loaded; console.log(loaded);
                    $("#gallery-progress-stripe").css({ "width", function(loaded) { return "" + (loaded * 10) + "%"; } });
                    if (loaded === 10) {
                        $("#gallery-progress").fadeToggle();
                        $("#gallery-content").fadeToggle();
                    }
                });
    
            },
            
            error: function(response) {
                console.log("\nGoogle Custom Search returned:", response);
            }
            
        }); // End $.ajax();
        
    }); // End $("#search").click();

}); // End $(document).ready();
