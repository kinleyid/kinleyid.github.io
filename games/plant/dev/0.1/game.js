
// Initialize the plant
var core = {
	x: null,
	y: null,
	children: []
};
var all_nodes = [];

// Track mouse movement
var mouse = {
	x: null,
	y: null
};

var events = {
	click: null,
	keydown: null
};

document.onmousemove = function(e) {
	mouse.x = e.clientX - canv.clientLeft;
	mouse.y = e.clientY - canv.clientTop;
};

document.onclick = function(e) {
	events.click = {
		x: e.clientX,
		y: e.clientY
	}
}

document.onkeydown = function(e) {
	events.keydown = e;
}

var game_mode = 'new node: select parent';
var mode_persistents = {}; // Container for information that needs to persist between calls to the main loop

function add_node(node, theta, length) {
	var new_node = {
		parent: node,
		theta: theta,
		length: length,
		weight: 1,
		children: []
	};
	node.children.push(new_node);
	all_nodes.push(new_node);
}

var max_segment_length = 50
var max_children = 2

add_node(core, Math.PI/2, max_segment_length/2)

// Graphics stuff

var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');
canv.style.cursor = 'none'; // We'll draw our own

// Coordinate system: the origin of the underlying
// geometry will be the plant's core
var gpx_globals = {
	scale: 1,
	x: canv.width/2,
	y: canv.height/2
}

function get_next_coords(x, y, theta, length) {
	return({
		x: x + gpx_globals.scale*length*Math.cos(theta),
		y: y - gpx_globals.scale*length*Math.sin(theta)
	})
}

function update_all_screen_coords() {
	// Updates the current x and y values for all nodes of the plant
	core.x = gpx_globals.x;
	core.y = gpx_globals.y;
	var i;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		next_coords = get_next_coords(all_nodes[i].parent.x, all_nodes[i].parent.y, all_nodes[i].theta, all_nodes[i].length);
		all_nodes[i].x = next_coords.x;
		all_nodes[i].y = next_coords.y;
	}
}

function update_screen_coords(x, y, node) {
	next_coords = get_next_coords(x, y, node.theta, node.length);
	node.x = next_coords.x;
	node.y = next_coords.y;
	for (i = 0; i < node.children.length; i++) {
		update_screen_coords(node.x, node.y, node.children[i])
	}
}

function draw_all_nodes() {
	var i, node;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		ctx.beginPath();
		ctx.moveTo(node.parent.x, node.parent.y);
		ctx.lineTo(node.x, node.y);
		ctx.stroke();
	}
}

function draw_plant() {
	core_x = canv.width/2 - gpx_globals.x;
	core_y = canv.height/2 - gpx_globals.y;
	var i;
	for (i = 0; i < core.children.length; i++) {
		draw_nodes(core_x, core_y, core.children[i])
	}
}

function find_selected_node() {
	// Finds the node of the plant nearest to the cursor
	var min_dist = 1/0;
	var i, dist, nearest;
	for (i = 0; i < all_nodes.length; i++) {
		dist = Math.sqrt((all_nodes[i].x - mouse.x)**2 + (all_nodes[i].y - mouse.y)**2);
		if (dist < min_dist) {
			min_dist = dist;
			nearest = i;
		}
	}
	var selected_node = all_nodes[nearest];
	if (min_dist > 100 | selected_node.children.length >= max_children) {
		selected_node = null;
	}
	return (selected_node);
}

function draw_cursor() {
	ctx.beginPath();
	ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
	ctx.stroke();
}

function respond_to_cursor_position() {
	if (game_mode == 'new node: select parent') {
		var selected_node = find_selected_node();
		mode_persistents.selected_parent = selected_node;
		if (selected_node) {
			ctx.beginPath();
			ctx.arc(selected_node.x, selected_node.y, 10, 0, 2 * Math.PI);
			ctx.stroke();
		}
	} else if (game_mode == 'new node: position') {
		var parent = mode_persistents.selected_parent;
		var theta = Math.atan2(parent.y - mouse.y, mouse.x - parent.x);
		var length = Math.min(max_segment_length, Math.sqrt((mouse.y - parent.y)**2 + (mouse.x - parent.x)**2));
		mode_persistents.new_node = {
			theta: theta,
			length: length
		}
		var next_coords = get_next_coords(parent.x, parent.y, theta, length)
		ctx.beginPath();
		ctx.moveTo(parent.x, parent.y);
		ctx.setLineDash([2, 2]);
		ctx.lineTo(next_coords.x, next_coords.y);
		ctx.stroke();
		ctx.setLineDash([]);
	}
}

function respond_to_click(click) {
	if (game_mode == 'new node: select parent') {
		if (mode_persistents.selected_parent) {
			game_mode = 'new node: position';
		}
	} else if (game_mode == 'new node: position') {
		add_node(
			mode_persistents.selected_parent, 
			mode_persistents.new_node.theta,
			mode_persistents.new_node.length);
		game_mode = 'new node: select parent';
	}
}

function respond_to_keydown(e) {
	if (game_mode == 'new node: select parent') {
		// Placeholder
	} else if (game_mode == 'new node: position') {
		if (e.key == 'Escape') {
			delete mode_persistents.new_node;
			game_mode = 'new node: select parent';
		}
	}
}

// Main game loop
function main_loop() {
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_cursor();
	update_all_screen_coords();
	draw_all_nodes();

	respond_to_cursor_position();

	// Get clicks from last loop
	var last_click = events.click;
	events.click = null; // flush
	if (last_click) {
		respond_to_click(last_click);
	}

	// Get key presses from last loop
	var last_key = events.keydown;
	events.keydown = null; // flush
	if (last_key) {
		respond_to_keydown(last_key);
	}

	setTimeout(main_loop, 50);
};
main_loop();