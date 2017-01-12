"use strict";

var Util = require('../core/Util');
var Node = require('./Node');

class Obstacle {
	constructor() {
		this.nodes = [];
		this.x = 0;
		this.y = 0;
	}

	load(nodes) {
		for(var key in nodes) {
			var node = nodes[key];
			this.addNode(node.id, +node.x, +node.y);
		}
	}
	
	addNode(id, x, y) {
		this.nodes.push(new Node(id, x, y, this));
	}
	
	getNode(id) {
		return this.nodes[id];
	}

	size() {
		return this.nodes.length;
	}

	dimensions() {
		var maxX = 0;
		var maxY = 0;
		var minX = 999999999999999999999;
		var minY = 999999999999999999999;
		for (var key in this.nodes) {
			var node = this.nodes[key];
			if (node.x > maxX) {
				maxX = node.x;
			}
			if (node.y > maxY) {
				maxY = node.y;
			}
			if (node.x < minX) {
				minX = node.x;
			}
			if (node.y < minY) {
				minY = node.y;
			}
		}
		return {xmax: maxX, ymax: maxY, xmin: minX, ymin: minY}
	}
	
	inObstacle(varX, varY) {
		var result = false;
		var count = 0;
		
		for (var i = 0; i < this.nodes.length; i++) {
			if (Util.linesIntersect(0,0,varX,varY, this.getNode(i).x,this.getNode(i).y,this.getNode((i+1)%this.nodes.length).x,this.getNode((i+1)%this.nodes.length).y)) {
				count++;
			}
		}
							
		if (count % 2 != 0) {
			result = true;
		}
		return result;
	}

	toJSON() {
  	var nodes = [];
  	for (var key in this.nodes) {
  		var node = this.nodes[key];
  		nodes.push({id: node.id, x: node.x, y: node.y})
  	}
  	var edges = [];
  	for (var key in this.edges) {
  		var edge = this.edges[key];
  		edges.push({source: edge.source.id, target: edge.target.id, weight: edge.weight});
  	}

		return {
			nodes: nodes,
			edges: edges
		}
	}
};

module.exports = Obstacle;