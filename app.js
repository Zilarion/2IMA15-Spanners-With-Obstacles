var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var greedy = require('./src/js/algorithms/Greedy');
var visibility = require('./src/js/algorithms/Visibility');
var Graph = require('./src/js/core/Graph');
var Obstacle = require('./src/js/core/Obstacle');
var Worker = require('webworker-threads').Worker;
var activeWorker;

app.use(express.static('www'))
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
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
		var result = greedy.calculate(graph, vgraph, settings);
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