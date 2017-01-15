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
var DataManager = require('./src/js/data/DataManager');

const fs = require('fs');

app.use(express.static('www'))
app.use(bodyParser.json({ // to support JSON-encoded bodies
  limit: '50mb'
}));

app.listen(3000, function () {
  console.log('Listening on port 3000!')
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message, 
        error: err
    });
 });

function run(dm, files) {
	const algorithms = {greedy: greedy.calculate, wspd: wspd.calculate}
	var datasets = dm.getDatasets();
	var num = 0;
	var results = [];
	for (var key in datasets){
		var ds = datasets[key];
		var k = ds.obstacle.nodes.length;
		var n = ds.nodes.length;
		var dim = dimensions(ds.nodes, ds.obstacle);
		if (n > 800 || k > 800) {
			console.log("Skipping large dataset: ", files[num]);
			continue;
		}
		for (var key in algorithms) {
			var alg = algorithms[key]; 
			console.log("Running", key, "on dataset:", files[num]);
			var graph = new Graph();
			graph.copy(ds.obstacle, true);
			graph.copy(ds, false);


			var t0 = process.hrtime();
			var vgraph = visibility.compute(graph, ds.obstacle);
			var result = alg(graph, vgraph, {t: ds.t, bounds: dim});
			var t1 = process.hrtime(t0);
			var meta = {
				n: n,
				k: k,
				alg: key,
				file: files[num],
				totalWeight: result.totalWeight(),
				runTime: (t1[0] * 1e9 + t1[1])/1000000,
			}
			console.log(meta);
			results.push(meta);
			num++;
		}
	}
	return results;
}

const folder = './src/data/';
app.get('/run', function(req, res) {
	var dm = new DataManager();
	var filesNames = [];
	var itemsProcessed = 1;
	fs.readdir(folder, (err, files) => {
	  files.forEach(file => {
	  	if (file != ".DS_Store") {	 
		  	fs.readFile(folder + file, function(err, data) {
		  		filesNames.push(file);
		  		if (err) {
				    throw err; 
				  }
				  dm.addDataset(data.toString());
				  itemsProcessed++;
				  console.log(itemsProcessed, files.length)
			    if(itemsProcessed === files.length) {
			    	console.log("Run");
			      var results = run(dm, filesNames);
						res.send(results);
			    }
		  	}); 		
	  	}
	  });
	})
});

app.post('/query', function(req, res) {
	function calculate(data) {
		// Setup initial values
		var graph = new Graph()
		var obstacle = new Obstacle()
		var settings = data.settings;

		// Load data
		graph.copy(data.obstacle, true, true);
		graph.copy(data, false, true);
		obstacle.load(data.obstacle);

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
				var dim = dimensions(graph.nodes, obstacle);
				settings.bounds = dim;
				result = wspd.calculate(graph, vgraph, settings);
				break;
			default:
				res.status(400).send({error: "Invalid algorithm"});
				break;
		}

		t1 = process.hrtime(t0);

		// Constructor metadata
		var meta = {
			totalWeight: result.totalWeight(),
			runTime: (t1[0] * 1e9 + t1[1])/1000000,
		}
		console.log("All done!");
		return {graph: result.toJSON(), vgraph: vgraph.toJSON(), meta: meta};
	}

	var data = req.body;
	res.send(calculate(data));
}).on('error', function(e) {
   console.log("error connecting" + e.message);
});

function dimensions(nodes, obstacle) {
	var dimo = obstacle.dimensions();

	for (var key in nodes) {
		var node = nodes[key];
		if (node.x > dimo.xmax) {
			dimo.xmax = node.x;
		}
		if (node.y > dimo.ymax) {
			dimo.ymax = node.y;
		}
		if (node.x < dimo.xmin) {
			dimo.xmin = node.x;
		}
		if (node.y < dimo.ymin) {
			dimo.ymin = node.y;
		}
	}
	return dimo;
}