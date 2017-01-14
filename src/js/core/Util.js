'use strict';

var math = require('mathjs');

class Util {
	static getRandomArbitrary(min, max) {
	  return Math.random() * (max - min) + min;
	}
	
	static point_edge_distance(p1, p2, edge){
    var ip = Util.intersect_point(p1, p2, edge)
    if (ip != undefined)
        return Util.distance(p1, ip)
    return 0
  }

	// Given three colinear points p, q, r, the function checks if point q lies on line segment pr
	static on_segment(p, q, r){
    if ((q.x <= math.max(p.x, r.x)) && (q.x >= math.min(p.x, r.x))) { 
      if ((q.y <= math.max(p.y, r.y)) && (q.y >= math.min(p.y, r.y))) {
        return true
      }
    }
    return false
	}

  static intersects_point(p1, p2, edge) {
  	return Util.intersect_point(p1, p2, edge) == undefined;
  }
  // Return intersect Point where the edge from p1, p2 intersects edge
  static intersect_point(p1, p2, edge){
    if (p1.id == edge.source.id || p1.id == edge.target.id) return p1
    if (p2.id == edge.source.id || p2.id == edge.target.id) return p2
    if (edge.source.x == edge.target.x) {
      if (p1.x == p2.x)
        return undefined
      var pslope = (p1.y - p2.y) / (p1.x - p2.x)
      var intersect_x = edge.source.x
      var intersect_y = pslope * (intersect_x - p1.x) + p1.y
      return {x: intersect_x, y: intersect_y}
    }
    if (p1.x == p2.x) {
      var eslope = (edge.source.y - edge.target.y) / (edge.source.x - edge.target.x)
     	var intersect_x = p1.x
      var intersect_y = eslope * (intersect_x - edge.source.x) + edge.source.y
      return {x: intersect_x, y: intersect_y}
    }

    var pslope = (p1.y - p2.y) / (p1.x - p2.x)
    var eslope = (edge.source.y - edge.target.y) / (edge.source.x - edge.target.x)
    if (eslope == pslope)
        return undefined;
    var intersect_x = (eslope * edge.source.x - pslope * p1.x + p1.y - edge.source.y) / (eslope - pslope)
    var intersect_y = eslope * (intersect_x - edge.source.x) + edge.source.y
    return {x: intersect_x, y: intersect_y}
  }

  static angle2(point_a, point_b, point_c){
    var a = Util.distance(point_b, point_c)
    var b = Util.distance(point_a, point_c)
    var c = Util.distance(point_a, point_b)
    var x = (a*a + c*c - b*b) / (2 * a * c)
    return math.acos(x)
  }

	static distance(n1, n2) {
		var dx = n1.x - n2.x;
		var dy = n1.y - n2.y;

		return math.sqrt(math.pow(dx, 2) + math.pow(dy, 2));
	}

	static dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
	}

	static get_adjacent(segment, point) {
    if (point.id == segment.source.id)
      return segment.target;
    return segment.source;
  }


	//stolen from online, multiple sources
	static intersect(x1,  y1,  x2,  y2,  x3,  y3,  x4,  y4, returnPoint){
		//check for same points
		if ((x1 == x3 && y1 == y3) || (x2 == x3 && y2 == y3)){
			return false;
		}
		if ((x1 == x4 && y1 == y4) || (x2 == x4 && y2 == y4)){
			return false;
		}

		var a1, a2, b1, b2, c1, c2;
		var r1, r2 , r3, r4;
		var denom, offset, num;

		// Compute a1, b1, c1, where line joining points 1 and 2
		// is "a1 x + b1 y + c1 = 0".
		a1 = y2 - y1;
		b1 = x1 - x2;
		c1 = (x2 * y1) - (x1 * y2);

		// Compute r3 and r4.
		r3 = ((a1 * x3) + (b1 * y3) + c1);
		r4 = ((a1 * x4) + (b1 * y4) + c1);

		// Check signs of r3 and r4. If both point 3 and point 4 lie on
		// same side of line 1, the line segments do not intersect.
		if ((r3 != 0) && (r4 != 0) && ((r3 > 0 && r4 > 0) || (r3 < 0 && r4 < 0))){
			return false;
		}

		// Compute a2, b2, c2
		a2 = y4 - y3;
		b2 = x3 - x4;
		c2 = (x4 * y3) - (x3 * y4);

		// Compute r1 and r2
		r1 = (a2 * x1) + (b2 * y1) + c2;
		r2 = (a2 * x2) + (b2 * y2) + c2;

		// Check signs of r1 and r2. If both point 1 and point 2 lie
		// on same side of second line segment, the line segments do
		// not intersect.
		if ((r1 != 0) && (r2 != 0) && ((r1 > 0 && r2 > 0) || (r1 < 0 && r2 < 0))){
			return false;
		}

		//Line segments intersect: compute intersection point.
		denom = (a1 * b2) - (a2 * b1);

		if (denom == 0) {
			return false;//TODO: COLINEAR
		}

		// lines_intersect
		if (!returnPoint){
			return true;
		}

		//code to figure out the intersection point
		  if (denom < 0){ 
		    offset = -denom / 2; 
		  } 
		  else {
		    offset = denom / 2 ;
		  }

		// The denom/2 is to get rounding instead of truncating. It
		// is added or subtracted to the numerator, depending upon the
		// sign of the numerator.
		num = (b1 * c2) - (b2 * c1);
		
		var x = 0;
		var y = 0;

		if (num < 0){
			x = (num - offset) / denom;
		} 
		else {
			x = (num + offset) / denom;
		}

		num = (a2 * c1) - (a1 * c2);
		if (num < 0){
			y = ( num - offset) / denom;
		} 
		else {
			y = (num + offset) / denom;
		}

		return {x:x, y:y};
	}



	//trivial solution stolen from https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
	//doesn't seem to work for all cases
	static linesIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
		var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
		if (isNaN(x)||isNaN(y)) {
			return false;
		} else {
			if (x1>=x2) {
				if (!(x2<=x&&x<=x1)) {return false;}
			} else {
				if (!(x1<=x&&x<=x2)) {return false;}
			}
			if (y1>=y2) {
				if (!(y2<=y&&y<=y1)) {return false;}
			} else {
				if (!(y1<=y&&y<=y2)) {return false;}
			}
			if (x3>=x4) {
				if (!(x4<=x&&x<=x3)) {return false;}
			} else {
				if (!(x3<=x&&x<=x4)) {return false;}
			}
			if (y3>=y4) {
				if (!(y4<=y&&y<=y3)) {return false;}
			} else {
				if (!(y3<=y&&y<=y4)) {return false;}
			}
		}
		return true;
	}
	static numIntersectLineSimplePolygon(simplePolygon, lstart, lend, bailearly, offsetx, offsety){ 
		var numIntersect = 0;
		for (var i = 0; i < simplePolygon.length; i++){
			var start = simplePolygon[i];
			var end = simplePolygon[(i+1)%simplePolygon.length];//wrap for last edge
			//intersect
			if (this.intersect(start.x + offsetx, start.y + offsety, 
								 	end.x   + offsetx, end.y   + offsety, 
									lstart.x, lstart.y, lend.x, lend.y)){
				numIntersect++;
				if (bailearly){
					return numIntersect;
				}
			}
		}
		return numIntersect;
	}
	
	static polygonIntersectSimplePolygon(poly1, offset1, poly2, offset2){
		//if this needs to be fast, do a bound intersection first
		for (var i = 0; i < poly1.length; i++){
			//countour poly1
			var s = poly1[i];
			var e = poly1[(i+1)%poly1.length];//wrap for last edge
			//offset
			var start = {x: s.x + offset1.x, y: s.y + offset1.y};
			var end =   {x: e.x + offset1.x, y: e.y + offset1.y};
			//intersect
			if (this.lineIntectsObstacle(start, end, poly2)){
				return true;
			}
		}
		return false;
	}

	static pointInsideSimplePolygon(simplePolygon, px, py){
		return this.numIntersectLineSimplePolygon(simplePolygon,  {x:0, y:py}, {x:px, y:py}, false, 0, 0)%2 == 1;
	}

	static pointInsideObstacle(px, py, obstacle){
		return this.numIntersectLineSimplePolygon(obstacle.nodes, {x:0, y:py}, {x:px, y:py}, false, obstacle.x, obstacle.y)%2 == 1;
	}

	static lineIntersectsObstacle(lstart, lend, obstacle){
		return this.numIntersectLineSimplePolygon(obstacle.nodes, lstart, lend,
						true, obstacle.x, obstacle.y) != 0;
	}
};

module.exports = Util;