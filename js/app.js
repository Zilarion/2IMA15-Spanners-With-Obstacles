requirejs.config({
    //By default load any module IDs from js
    baseUrl: 'js',
});

// Start the main app logic.
requirejs(['vis/Visualization'],
function(vis) {
	console.log(vis);
});