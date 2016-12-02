define(function() {
	return {
		distance: function(n1, n2) {
			var dx = n1.x - n2.x;
			var dy = n1.y - n2.y;

			return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		},
		dynamicSort: function(property) {
	    var sortOrder = 1;
	    if(property[0] === "-") {
	        sortOrder = -1;
	        property = property.substr(1);
	    }
	    return function (a,b) {
	        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	        return result * sortOrder;
	    }
		},
		//trivial solution stolen from https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
		linesIntersect: function(x1,y1,x2,y2, x3,y3,x4,y4) {
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
		},
		numIntersectLineSimplePolygon: function(simplePolygon, lstart, lend){ 
			var numIntersect = 0;
			for (var i = 0; i < simplePolygon.length; i++){
				var start = simplePolygon[i];
				var end = simplePolygon[(i+1)%simplePolygon.length];//wrap for last edge
				//intersect
				if (this.linesIntersect(start.x, start.y, end.x, end.y, lstart.x, lstart.y, lend.x, lend.y)){
					numIntersect++;
				}
			}
			return numIntersect;
		},
		pointInsideSimplePolygon: function(simplePolygon, px, py){
			return this.numIntersectLineSimplePolygon(simplePolygon, {x:0, y:py}, {x:px, y:py})%2 == 1;
		}
	}
});