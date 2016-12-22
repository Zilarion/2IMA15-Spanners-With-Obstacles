"use strict";

var Node = require('./Node');

class Obstacle {
	constructor() {
		this.nodes = [];
	}
	
	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}
	
	getNode(id) {
		return this.nodes[id];
	}
};

module.exports = Obstacle;