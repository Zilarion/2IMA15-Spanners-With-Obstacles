'use strict';

var Graph = require('../core/Graph');
var Util = require('../core/Util');
var dijkstra = require('../algorithms/Dijkstra');
var Visibility = require('../algorithms/Visibility');
var generator = require('../data/Generator');
var $ = require('jquery')
var DataManager = require('../data/DataManager')
var JSON = require('json3')

class Controller {
	constructor(visualization, settings) {
		this.visualization = visualization;
		this.dm = new DataManager("#dataset_record");
		this.settings = settings;
		this.settings.w = this.visualization.width;
		this.settings.h = this.visualization.height;

		document.getElementById('tvalue').value = this.settings.t;	
		document.getElementById('debug').checked = this.settings.debug;	

		var algorithms = $('#algorithms');
		for ( var key in this.settings.algorithms ) {
			var alg = this.settings.algorithms[key]
	    algorithms.append($("<option />").val(alg).text(alg));
		};
		algorithms.val(this.settings.algorithm);

		var obstacle = generator.createSimplePolygon(10, this.settings);
		var nodes = generator.createNodes(10, obstacle, this.settings);

		this.newData(nodes, obstacle)

		// Listeners
		visualization.on('click', (position) => {
			this.clicked(position)
		})

		$('#recalculate').on('click', (e) => {
		  e.preventDefault();
			this.updateSettings();
		});	

		$('#clearPoints').on('click', (e) => {
		  e.preventDefault();
		  this.nodes = [];
		  this.recalculate();
		});	

		$('#dataset_export').on('click', (e) => {
		  e.preventDefault();
		  $('#dataset_data').val(DataManager.export(this.g.nodes, this.obstacle, this.settings.t));
		});		

		$('#dataset_import').on('click', (e) => {
		  var data = $("#dataset_data").val();
		  console.log("Loading new dataset");
		  this.dm.addDataset(data);
			var dataset = this.dm.getLastDataset();
		  this.newData(dataset.nodes, dataset.obstacle);
	  	console.log("Done loading new dataset");
		});		

		$('#dataset_runmass').on('click', (e) => {
		  var datasets = this.dm.getDatasets();
		  var algorithms = this.settings.algorithms;
		  var results = [];

		  // Run each dataset
		  for (var i = 0; i < datasets.length; i++) {
		  	var dataset = datasets[i];

		  	// For each algorithm
		  	for ( var key in algorithms ) {
		  		var algorithm = algorithms[key];

		  		// Initialize
		  		var graph = new Graph(dataset);
		  		var obstacles = dataset.obstacles;
		  		var vg = {}; // :TODO: add visibility computation
		  		var settings = {w: this.settings.w, h: this.settings.h, t: dataset.t};

		  		// Run
		  		var t0 = performance.now();
		  		algorithm(graph, vg, settings)
		  		var t1 = performance.now();

		  		// Compute running time
		  		var runtime = t1 - t0;

		  		// Push the result
		  		results.push({alg: key, ms: runtime, n: dataset.nodes.length, k: dataset.obstacles.length, id: dataset.id});
		  	}
		  }
		  console.log(results);
		});		


		$('.control_setting').on('change', (e) => {
			this.updateSettings();
		});
	}

	newData(nodes, obstacle) {
		this.obstacle = obstacle;
		this.nodes = nodes;

	  var newDim = this.dimensions(nodes, obstacle);
	  this.settings.dim = newDim;
	  this.settings.w = newDim.xmax - newDim.xmin;
	  this.settings.h = newDim.ymax - newDim.ymin;
		this.visualization.size(newDim);
	  this.recalculate();
	}

	// Update the settings based on the input values
	updateSettings() {
		var tvalue = parseFloat(document.getElementById('tvalue').value);	
		this.settings.algorithm = document.getElementById('algorithms').value;
		this.settings.debug = document.getElementById('debug').checked;
		if (tvalue != NaN && tvalue >= 1) {
			this.settings.t = tvalue;
		}
		this.recalculate();
	}

	recalculate() {
	  // Set loading to true
	  this.visualization.loading(true);
	  console.log('load on');
	  var that = this;

	  // Send our query
	  var data = JSON.stringify({
	  	"nodes": this.nodes, 
	  	"obstacle": this.obstacle.toJSON(),
	  	"settings": {t: this.settings.t}
	  });
		$.ajax({
      type: "POST",
      contentType: "application/json",
      url: "query",
      data: data
    })
		.done(function(data) {
	  	that.result = data;
	  	that.updateData();
	  	console.log("load off");
	  	that.visualization.loading(false);
	  });
  }

  dimensions(nodes, obstacle) {
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

	updateData() {
	  this.visualization.setData({
	  	nodes: this.result.graph.nodes, 
	  	edges: this.result.graph.edges, 
	  	debug: this.settings.debug ? {vgraph: this.result.vgraph} : {},
	  	obstacle: this.obstacle
	  });

	  $("#d_nodes").html(this.result.graph.nodes.length);
	  $("#d_edges").html(this.result.graph.edges.length);
	  $("#d_weight").html(this.result.meta.totalWeight);
	  $("#d_time").html(this.result.meta.runTime + " ms");

	  // if (this.settings.debug) {
	  	// var valid = this.validTSpanner(this.g, this.settings.t);
		  // $("#d_valid").html(valid ? "<div class=\"light light-valid\"></div>" : "<div class=\"light light-invalid\"></div>");
		// } else {
			$("#d_valid").html("<div class=\"light\"></div>");
		// }
	}

	clicked(position) {
		if (!this.obstacle.inObstacle(position.x, position.y)) {
			this.nodes.push({id: this.nodes.length + 1, x: position.x, y: position.y});
			this.recalculate();
		}
	}

	validTSpanner(graph, t) {
		for (var k1 in graph.nodes) {
			var v1 = graph.nodes[k1];
			for (var k2 in graph.nodes) {
				var v2 = graph.nodes[k2];
				var dist = dijkstra.calculate(v1, v2, graph)
				var bestDist = Util.distance(v1, v2);
				if (dist > bestDist * t) {
					return false;
				}
			}
		}
		return true;
	}
}

module.exports = Controller;