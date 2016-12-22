'use strict';

var Graph = require('../core/Graph');
//var Obstacle = require('../core/Obstacle');
var Util = require('../core/Util');
var dijkstra = require('../algorithms/Dijkstra');
var generator = require('../data/Generator');
var $ = require('jquery')
var DataManager = require('../data/DataManager')

class Controller {
	constructor(visualization, settings) {
		this.visualization = visualization;
		this.settings = settings;
		this.settings.w = this.visualization.width;
		this.settings.h = this.visualization.height;

		document.getElementById('tvalue').value = this.settings.t;	

		var algorithms = $('#algorithms');
		for ( var key in this.settings.algorithms ) {
	    algorithms.append($("<option />").val(key).text(key));
		};
		algorithms.val(this.settings.algorithm);

		this.obstacle = generator.createSimplePolygon(5, this.settings);
		
		this.g = generator.createNodes(70, this.obstacle, this.settings);
		
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
			console.log(DataManager.export(this.g.nodes, this.obstacle, this.settings.t));
		});		

		$('.control_setting').on('change', (e) => {
			this.updateSettings();
		});
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
			  that.debug = that.settings.algorithms[that.settings.algorithm](that.g, that.settings);
				var t1 = performance.now();
				that.lastRun = t1 - t0;

			  // Update the visualization
				that.updateData();
			  that.visualization.update(that.settings.debug);

				resolve(); 
		 	});
	  });
  }

	updateData() {
	  this.visualization.setData({nodes: this.g.nodes, edges: this.g.edges, debug: this.debug, obstacle: this.obstacle})

	  $("#d_nodes").html(this.g.nodes.length);
	  $("#d_edges").html(this.g.edges.length);
	  $("#d_weight").html(this.g.totalWeight().toFixed(3));
	  $("#d_time").html(this.lastRun.toFixed(0) + " ms");
	  if (this.settings.debug) {
		  $("#d_valid").html(this.validTSpanner(this.g, this.settings.t) ? "<div class=\"light light-valid\"></div>" : "<div class=\"light light-invalid\"></div>");
		} else {
			$("#d_valid").html("<div class=\"light\"></div>");
		}
	}

	clicked(position) {
	  this.g.addNode(this.g.nodes.length + 1, position.x, position.y);
	  this.recalculate();
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
					console.log(dist + " > " + bestDist * t);
					console.log(v1.id, v2.id)
					return false;
				}
			}
		}
		return true;
	}
}

module.exports = Controller;