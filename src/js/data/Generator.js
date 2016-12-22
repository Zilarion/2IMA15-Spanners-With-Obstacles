'use strict';

var Util = require('../core/Util');

class Generator {
	static createSimplePolygon(obstacleSize, visualization) {
		var obstacle = [];
		var old = null;
		var fails = 0;
		outer_loop:
		while (obstacle.length != obstacleSize) {
			if (fails == 10) {
				obstacle = [];
				old = null;
				fails = 0;
				continue outer_loop;
			}
			var varX = Util.getRandomArbitrary(0, visualization.width);
			var varY = Util.getRandomArbitrary(0, visualization.height);
			
			var points = obstacle.length;
			if (points>=2) {
				for (var j = 0; j < points-1; j++) {
					if (points == obstacleSize-1) {
						if (Util.linesIntersect(varX,varY,obstacle[0].x,obstacle[0].y,
								obstacle[j].x,obstacle[j].y,obstacle[j+1].x,obstacle[j+1].y)) {
										varX = Util.getRandomArbitrary(0, visualization.width);
										varY = Util.getRandomArbitrary(0, visualization.height);
										fails++;
										continue outer_loop;
						}
					}
					if (Util.linesIntersect(old.x,old.y,varX,varY,obstacle[j].x,obstacle[j].y,obstacle[j+1].x,obstacle[j+1].y)) {
						varX = Util.getRandomArbitrary(0, visualization.width);
						varY = Util.getRandomArbitrary(0, visualization.height);
						fails++;
						continue outer_loop;
					}
				}
			}
			var p = {
				x: varX,
				y: varY
			}
			fails == 0;
			obstacle.push(p);
			old = p;
		}
		return obstacle;
	}
}

module.exports = Generator;