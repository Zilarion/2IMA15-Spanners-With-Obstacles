'use strict';

var Graph = require('../core/Graph');
var Util = require('../core/Util');
var dijkstra = require('../algorithms/Dijkstra');
var Visibility = require('../algorithms/Visibility');
var generator = require('../data/Generator');
var $ = require('jquery')
var DataManager = require('../data/DataManager')

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
	    algorithms.append($("<option />").val(key).text(key));
		};
		algorithms.val(this.settings.algorithm);

		var obstacle = generator.createSimplePolygon(this.g, 10, this.settings);
		var graph = generator.createNodes(new Graph(), 10, obstacle, this.settings);

		this.newData(graph, obstacle)
		
		this.recalculate();

		// Listeners
		visualization.on('click', (position) => {
			this.clicked(position)
		})

		$('#recalculate').on('click', (e) => {
		  e.preventDefault();
			this.updateSettings();
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
		  var graph = new Graph();
		  graph.load(dataset);
		  this.newData(graph, dataset.obstacle);
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

	newData(graph, obstacle) {
		this.g = graph;
		this.obstacle = obstacle;
	  this.obstacle.changed = true;

	  var newDim = this.dimensions();
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
		//this.worker = this.settings.algorithms[this.settings.algorithm].worker;
		this.recalculate();
	}

	recalculate() {
	  // Set loading to true
	  this.visualization.loading(true);

	  // Store the current promise
	  this.promise = this.asyncCompute();

	  var that = this;
		this.promise.then(function() {
			// We are done, stop loading
			that.visualization.loading(false);
		})

		// Remove promise
		this.promise = undefined;
  }

  asyncCompute() {
	  var that = this;
		return new Promise((resolve, reject) => {
			setTimeout(function() { 
				// Clear previous result
		  	that.g.clearEdges();
			  // Run algorithm
		  	var t0 = performance.now();
		  	if (that.obstacle.changed) {
		  		console.log("Computing visibility graph");
					//that.vg = Visibility.compute(that.g, that.obstacle);
		  		that.obstacle.changed = false;
		  		console.log("Done computing visibility graph");
		  	}
		  	console.log("Computing t-spanner");
			  //that.debug = that.settings.algorithms[that.settings.algorithm](that.g, that.vg, that.settings);
				var t1 = performance.now();
				that.lastRun = t1 - t0;
		  	console.log("Done computing");

			  // Update the visualization
				that.updateData();
			  that.visualization.update(that.settings.debug);

				resolve(); 
		 	});
	  });
  }

  dimensions() {
  	var dimg = this.g.dimensions();
  	var dimo = this.obstacle.dimensions();
  	if (dimo.xmax > dimg.xmax) {
  		dimg.xmax = dimo.xmax
  	}
  	if (dimo.ymax > dimg.ymax) {
  		dimg.ymax = dimo.ymax;
  	}

  	if (dimo.ymin < dimg.ymin) {
  		dimg.ymin = dimo.ymin;
  	}
  	if (dimo.xmin < dimg.xmin) {
  		dimg.xmin = dimo.xmin;
  	}
  	return dimg;
  }

	updateData() {
	  this.visualization.setData({nodes: this.g.nodes, edges: this.g.edges, debug: this.debug, obstacle: this.obstacle})

	  $("#d_nodes").html(this.g.nodes.length);
	  $("#d_edges").html(this.g.edges.length);
	  $("#d_weight").html(this.g.totalWeight().toFixed(3));
	  $("#d_time").html(this.lastRun.toFixed(0) + " ms");
	  if (this.settings.debug) {
	  	var valid = this.validTSpanner(this.g, this.settings.t);
		  $("#d_valid").html(valid ? "<div class=\"light light-valid\"></div>" : "<div class=\"light light-invalid\"></div>");
		} else {
			$("#d_valid").html("<div class=\"light\"></div>");
		}
	}

	clicked(position) {
		if (!this.obstacle.inObstacle(position.x, position.y)) {
			this.g.addNode(this.g.nodes.length + 1, position.x, position.y);
			this.recalculate();
		}
	}

	get algorithms() {
		return this.settings.algorithms;
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