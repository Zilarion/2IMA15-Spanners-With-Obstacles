var express = require('express')
var app = express()
var bodyParser = require('body-parser');

// Load algorithms
var greedy = require('./src/js/algorithms/Greedy');
var wspd = require('./src/js/algorithms/WSPD');
var visibility = require('./src/js/algorithms/Visibility');

// Load core
var Graph = require('./src/js/core/Graph');
var Obstacle = require('./src/js/core/Obstacle');

// Load threading
var Worker = require('webworker-threads').Worker;
var activeWorker;

app.use(express.static('www'))
app.use(bodyParser.json({ // to support JSON-encoded bodies
  limit: '50mb'
}));

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})

app.post('/query', function(req, res) {
	function calculate(data) {
		// Setup initial values
		var graph = new Graph()
		var obstacle = new Obstacle()
		var settings = data.settings;

		// Load data
		graph.load(data);
		obstacle.load(data.obstacle.nodes);

		// Run algorithm
		var t0 = process.hrtime();
		var vgraph = visibility.compute(graph, obstacle);

		switch (settings.algorithm) {
			case "greedy":
				console.log("Running greedy")
				result = greedy.calculate(graph, vgraph, settings);
				break;
			case "WSPD":
				console.log("Running WSPD")
				result = wspd.calculate(graph, vgraph, settings);
				break;
			default:
				// error
				break;
		}

		t1 = process.hrtime(t0);

		// Constructor metadata
		var meta = {
			totalWeight: result.graph.totalWeight(),
			runTime: t1[1]/1000000
		}
		return {graph: result.graph.toJSON(), vgraph: vgraph.toJSON(), meta: meta};
	}

	var data = req.body;
	res.send(calculate(data));
});