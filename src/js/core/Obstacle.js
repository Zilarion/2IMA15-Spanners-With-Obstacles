"use strict";

var Node = require('./Node');

class Obstacle {
	constructor() {
		this.nodes = [];
		this.x = 0;
		this.y = 0;
	}
	
	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}
	
	getNode(id) {
		return this.nodes[id];
	}
};

module.exports = Obstacle;