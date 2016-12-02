requirejs.config({
    //By default load any module IDs from js
    baseUrl: 'js'
});

// Start the main app logic.
requirejs(['vis/Visualization', 'vis/Listeners'],
function(vis, list) {
	vis.init();
});