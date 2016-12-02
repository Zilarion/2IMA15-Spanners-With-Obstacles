define(['./Visualization'], function(app) {
	$('#recalculate').on('click', function(e) {
		app.updateSettings();
	  e.preventDefault();
	});
});