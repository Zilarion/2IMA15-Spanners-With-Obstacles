requirejs(['./vis/Visualization'], function(app) {
	$('#recalculate').on('click', function(e) {
		app.updateSettings();
	  e.preventDefault();
	});

	$('#tvalue').on('change', function(e) {
		app.updateSettings();
	  e.preventDefault();
	});

	$('#clearPoints').on('click', function(e) {
		app.clearPoints();
	  e.preventDefault();
	});

	$('#selectedObstacle').on('change', function(e) {
		app.updateSettings();
	  e.preventDefault();
	});

	$(window).on("resize", function(e) {
		var targetWidth = $("div#container").width();
    var svg = d3.select(".svg-element");
    var aspect = svg.attr("ar");
    var targetHeight = Math.round(targetWidth / aspect)
    svg.attr("width", targetWidth);
    svg.attr("height", targetHeight);
	}).trigger("resize");
});