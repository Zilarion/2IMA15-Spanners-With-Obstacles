'use strict';

var Graph = require('../core/Graph');
var Util = require('../core/Util');
var dijkstra = require('../algorithms/Dijkstra');
var $ = require('jquery')

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

		this.g = new Graph();

		for (var i = 0; i < 10; i++) {
			this.g.addNode(
				this.g.nodes.length + 1, 
				Util.getRandomArbitrary(0, this.settings.w), 
				Util.getRandomArbitrary(0, this.settings.h)
			)
		}
		
		this.obstacle = [];
		var obstacleSize = 5;
		var old = null;
		outer_loop:
		while (this.obstacle.length != obstacleSize) {
			var varX = Util.getRandomArbitrary(0, this.visualization.width);
			var varY = Util.getRandomArbitrary(0, this.visualization.height);
			
			var points = this.obstacle.length;
			if (points>=2) {
				for (var j = 0; j < points-1; j++) {
					if (points == obstacleSize-1) {
						if (Util.linesIntersect(varX,varY,this.obstacle[0].x,this.obstacle[0].y,
								this.obstacle[j].x,this.obstacle[j].y,this.obstacle[j+1].x,this.obstacle[j+1].y)) {
										varX = Util.getRandomArbitrary(0, this.visualization.width);
										varY = Util.getRandomArbitrary(0, this.visualization.height);
										continue outer_loop;
						}
					}
					if (Util.linesIntersect(old.x,old.y,varX,varY,this.obstacle[j].x,this.obstacle[j].y,this.obstacle[j+1].x,this.obstacle[j+1].y)) {
						varX = Util.getRandomArbitrary(0, this.visualization.width);
						varY = Util.getRandomArbitrary(0, this.visualization.height);
						continue outer_loop;
					}
				}
			}
			var p = {
				x: varX,
				y: varY
			}
			this.obstacle.push(p);
			old = p;
		}
		
		this.recalculate();

		visualization.on('click', (position) => {
			this.clicked(position)
		})

		$('#recalculate').on('click', (e) => {
			this.updateSettings();
		  e.preventDefault();
		});
	}

	// Update the settings based on the input values
	updateSettings() {
		var tvalue = parseFloat(document.getElementById('tvalue').value);	
		var selectedObstacle = document.getElementById('selectedObstacle').value;
		// var newObstacles = inputData.obstacles[selectedObstacle];
		// if (newObstacles){
			// this.obstacles = newObstacles;
		// }

		this.settings.algorithm = document.getElementById('algorithms').value;
		if (tvalue != NaN && tvalue >= 1) {
			this.settings.t = tvalue;
		}
		this.recalculate();
	}

	recalculate() {
	  this.g.clearEdges();

	  var t0 = performance.now();
	  this.debug = this.settings.algorithms[this.settings.algorithm](this.g, this.settings);
		var t1 = performance.now();
		this.lastRun = t1 - t0;

		this.updateData();
	  this.visualization.update();

	  $("#d_nodes").html(this.g.nodes.length);
	  $("#d_edges").html(this.g.edges.length);
	  $("#d_weight").html(this.g.totalWeight().toFixed(3));
	  $("#d_time").html(this.lastRun.toFixed(0) + " ms");
	  $("#d_valid").html(this.validTSpanner(this.g, this.settings.t) ? "Valid" : "Invalid");
	}

	updateData() {
	  this.visualization.setData({nodes: this.g.nodes, edges: this.g.edges, debug: this.debug, obstacle: this.obstacle})
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