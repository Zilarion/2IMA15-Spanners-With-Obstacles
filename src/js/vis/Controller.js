'use strict';

var Graph = require('../core/Graph');
var Util = require('../core/Util');

class Controller {
	constructor(visualization, settings) {
		this.visualization = visualization;
		this.settings = settings;

		console.log(visualization.settings)
		this.g = new Graph();


		for (var i = 0; i < 10; i++) {
			this.g.addNode(
				this.g.nodes.length, 
				Util.getRandomArbitrary(0, this.visualization.width), 
				Util.getRandomArbitrary(0, this.visualization.height)
			)
			console.log(this.g)
		}
		this.recalculate();

		visualization.on('click', (position) => {
			this.clicked(position)
		})
	}

	recalculate() {
	  this.g.clearEdges();

	  var t0 = performance.now();
		this.settings.algorithm(this.g, this.settings);
		var t1 = performance.now();
		this.lastRun = t1 - t0;

		this.updateData();
	  this.visualization.update();
	}

	updateData() {
	  this.visualization.setData({nodes: this.g.nodes, edges: this.g.edges})
	}

	clicked(position) {
	  this.g.addNode(this.g.nodes.length + 1, position.x, position.y);
	  this.recalculate();
	}
}

module.exports = Controller;