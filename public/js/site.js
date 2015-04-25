// Main page loading function.
$(document).ready(function() {
                        
    /*
        Google Custom Search API: https://developers.google.com/custom-search/json-api/v1/reference/cse/list
    */
    $("#search-google-button").click(function() {

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
                var images = response.items;
                var template = Handlebars.compile($("#template").html());
                console.log(template);
                $("#gallery").html(template(images));
                
            },
            
            error: function(response) {
                console.log("\nGoogle Custom Search returned:", response);
            }
            
        }); // End $.ajax();
        
    }); // End $("#search").click();

}); // End $(document).ready();