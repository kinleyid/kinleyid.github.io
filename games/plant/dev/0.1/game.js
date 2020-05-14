
function Node(args) {
	// Constructor for root and shoot nodes
	// args will be a struct with fields:
	//	parent: parent node
	//	theta: angle w.r.t. parent node, in radians
	// 	length: length, obv
	// 	weight: heaviness
	this = args;
	this.children = [];
}

// Initialize the plant
var core = {
	shoot: [Node({
		theta: Math.pi/2,
		length: 1,
		weight: 1
	})],
	root: [Node({
		theta: Math.pi*3/2
		length: 1,
		weigth: 1
	})]
}

// Graphics stuff

var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');

// Coordinate system: the origin of the underlying
// geometry will be the plant's core
var gpx_globals = {
	scale: 100,
	loc: {
		x: 0,
		y: 0
	}
}

function draw_nodes(node, x, y) {
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(
		x + gpx_globals.scale*node.length*Math.cos(node.theta),
		y - gpx_globals.scale*node.length*Math.sin(node.theta)
	);
	var i;
	for (i = 0; i < node.children.length; i++) {
		draw_nodes(node.children[i])
	}
}

// Main game loop
while (true) {
	// Draw the plant

	// Location of the core in screen pixels
	core_x = canv.width/2 - gpx_globals.x;
	core_y = canv.height/2 - gpx_globals.y;
	var i;
	for (i = 0; i < core.shoot.length; i++) {
		draw_nodes(core.shoot[i], core_x, core_y)
	}
}