// Render the page from its Jade template:
exports.showForm = function(request, response) {
    response.render("layout", {
        errors: request.flash("errors"),
        successes: request.flash("successes")
    });
};