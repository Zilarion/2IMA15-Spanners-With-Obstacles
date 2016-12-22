"use strict";


class Obstacle {
	constructor(id, x, y, nodes) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.nodes = nodes;
	}
};

module.exports = Obstacle;