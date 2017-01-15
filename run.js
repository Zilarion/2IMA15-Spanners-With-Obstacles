
// Load algorithms
var greedy = require('./src/js/algorithms/Greedy');
var wspd = require('./src/js/algorithms/WSPD');
var visibility = require('./src/js/algorithms/Visibility');

// Load core
var Graph = require('./src/js/core/Graph');
var Obstacle = require('./src/js/core/Obstacle');
var DataManager = require('./src/js/data/DataManager');

const fs = require('fs');


function run(dm, files) {
	const algorithms = {wspd: wspd.calculate};//, wspd: wspd.calculate 
	var datasets = dm.getDatasets();
	var num = 0;
	var results = [];
	for (var key in datasets){
		var ds = datasets[key];
		var k = ds.obstacle.nodes.length;
		var n = ds.nodes.length;
		if (n > 800 || k > 800) {
			console.log("Skipping large dataset: ", files[num]);
			continue;
		}
		for (var key in algorithms) {
			var alg = algorithms[key]; 
			var graph = new Graph();

			graph.copy(ds.obstacle, true);
			graph.copy(ds, false);

			console.log("Running", key, "on dataset:", files[num]);

			var t0 = process.hrtime();
			var vgraph = visibility.compute(graph, ds.obstacle);
			var result = alg(graph, vgraph, {t: ds.t});
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
		    	console.log("Running!");
		      var results = run(dm, filesNames);
		      console.log("Done!");
		      console.log(results);
		    }
	  	}); 		
  	}
  });
})