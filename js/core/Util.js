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
		}
	}
});