"use strict";

var Util = require('../core/Util');
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
};

module.exports = Obstacle;