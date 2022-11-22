
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
	mousedown: [],
	mouseup: [],
	keydown: []
};

document.onmousemove = function(e) {
	mouse.x = e.clientX - canv.clientLeft;
	mouse.y = e.clientY - canv.clientTop;
};

document.onmouseup = function(e) {
	events.mouseup = [{
		x: e.clientX,
		y: e.clientY
	}];
}

document.onmousedown = function(e) {
	events.mousedown = [{
		x: e.clientX,
		y: e.clientY
	}];
}

document.onkeydown = function(e) {
	events.keydown = [e];
}

var game_mode = 'drag view: unclicked';
var mode_persistents = {}; // Container for information that needs to persist between calls to the main loop

function add_node(node, theta, length) {
	var new_node = {
		parent: node,
		theta: theta,
		length: length,
		weight: 1,
		children: [],
		leaves: [],
		sway: 0
	};
	node.children.push(new_node);
	all_nodes.push(new_node);
}

var max_segment_length = 50;
var load_factors = {
	leaf: 0.5,
	child: 1,
	max: 3.1
}
var max_theta_change = Math.PI/2;
var stem_radius = 5;
var leaf_radius = 10;

// Colours----------------------
var colours = {
	node: 'rgb(150, 75, 0)',
	leaf: 'rgba(0, 200, 0, 0.5)'
}

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
		all_nodes[i].sway += 0.05 * Math.random();
		var visual_theta = all_nodes[i].theta + 0.05 * Math.sin(all_nodes[i].sway);
		next_coords = get_next_coords(
			all_nodes[i].parent.x,
			all_nodes[i].parent.y,
			visual_theta, // !
			all_nodes[i].length);
		all_nodes[i].x = next_coords.x;
		all_nodes[i].y = next_coords.y;
	}
}

function draw_all_nodes() {
	ctx.strokeStyle = colours.node;
	var i, node;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		ctx.beginPath();
		ctx.moveTo(node.parent.x, node.parent.y);
		ctx.lineTo(node.x, node.y);
		ctx.stroke();
	}
	ctx.strokeStyle = 'black';
}

var wind = {
	x: 0,
	y: 0
};

function draw_all_leaves() {
	ctx.fillStyle = colours.leaf;
	wind.x += 0.2*Math.random();
	wind.y += 0.1*Math.random();
	var i, node, j, leaf;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		for (j = 0; j < node.leaves.length; j++) {
			leaf = node.leaves[j];
			leaf.sway_x = wind.x + 0.1*Math.random();
			leaf.sway_y = wind.y + 0.1*Math.random();
			ctx.fillRect(
				node.x + leaf.x + Math.sin(leaf.sway_x) - leaf_radius/2,
				node.y + leaf.y + Math.sin(leaf.sway_y) - leaf_radius/2,
				leaf_radius, leaf_radius);
		}
	}
	ctx.fillStyle = 'black';
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
	if (min_dist > 100) {
		selected_node = null;
	}
	return (selected_node);
}

function get_remaining_load(node) {
	return (load_factors.max - (node.children.length*load_factors.child + node.leaves.length*load_factors.leaf));
}

function draw_cursor() {
	if (game_mode == 'new node: select parent' || game_mode == 'new node: position') {
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new leaf') {
		ctx.strokeStyle = 'green';
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.strokeStyle = 'black';
	} else if (game_mode == 'drag view: unclicked') {
		ctx.beginPath();
		ctx.moveTo(mouse.x - 5, mouse.y);
		ctx.lineTo(mouse.x + 5, mouse.y);
		ctx.moveTo(mouse.x, mouse.y - 5);
		ctx.lineTo(mouse.x, mouse.y + 5);
		ctx.stroke();
	}
}

function respond_to_cursor_position() {
	if (game_mode == 'new node: select parent') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (get_remaining_load(mode_persistents.selected_parent) > load_factors.child) { // Is node avaiable for new child nodes?
				// If so, highlight it
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 10, 0, 2 * Math.PI);
				ctx.stroke();
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'new node: position') {
		var parent = mode_persistents.selected_parent;
		var theta = Math.atan2(parent.y - mouse.y, mouse.x - parent.x);
		// Constrain to no more than a 90 degree difference from the parent
		last_theta = mode_persistents.selected_parent.theta;
		var diff_theta = theta - last_theta;
		if (diff_theta > Math.PI) {
			diff_theta = 2*Math.PI - diff_theta;
		} else if (diff_theta < -Math.PI) {
			diff_theta = 2*Math.PI + diff_theta;
		}
		if (diff_theta > max_theta_change) {
			theta = last_theta + max_theta_change;
		} else if (diff_theta < -max_theta_change) {
			theta = last_theta - max_theta_change;
		}
		// var length = Math.min(max_segment_length, Math.sqrt((mouse.y - parent.y)**2 + (mouse.x - parent.x)**2));
		var length = Math.min(parent.length*0.9, Math.sqrt((mouse.y - parent.y)**2 + (mouse.x - parent.x)**2));
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
	} else if (game_mode == 'new leaf') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			if (get_remaining_load(mode_persistents.selected_parent) > load_factors.leaf) {
				ctx.strokeStyle = 'green';
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.strokeStyle = 'black';
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'drag view: clicked') {
		gpx_globals.x = mode_persistents.gpx_initial.x + (mouse.x - mode_persistents.first_click.x)
		gpx_globals.y = mode_persistents.gpx_initial.y + (mouse.y - mode_persistents.first_click.y)
	}
}

function respond_to_mouseup(click) {
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
	} else if (game_mode == 'new leaf') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			var theta = Math.atan2(parent.y - mouse.y, mouse.x - parent.x);
			mode_persistents.selected_parent.leaves.push({
				x: stem_radius * Math.cos(theta),
				y: -stem_radius * Math.sin(theta),
				sway_x: 0,
				sway_y: 0,
			})
		}
	} else if (game_mode == 'drag view: clicked') {
		game_mode = 'drag view: unclicked'
	}
}

function respond_to_mousedown(e) {
	if (game_mode == 'drag view: unclicked') {
		mode_persistents.first_click = e;
		mode_persistents.gpx_initial = {
			x: gpx_globals.x,
			y: gpx_globals.y
		}
		game_mode = 'drag view: clicked';
	}
}

function respond_to_keydown(e) {
	if (e.key == 'l') {
		mode_persistents = {};
		game_mode = 'new leaf';
	} else if (e.key == 'n') {
		mode_persistents = {};
		game_mode = 'new node: select parent';
	} else if (e.key == 'd') {
		mode_persistents = {};
		game_mode = 'drag view: unclicked';
	}
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
	// Game logic
	
	// Graphics
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_cursor();
	update_all_screen_coords();
	draw_all_nodes();
	draw_all_leaves();
	// Response to user input
	respond_to_cursor_position();
	var event_names = ['mousedown', 'mouseup', 'keydown'];
	var i, event;
	for (i = 0; i < event_names.length; i++) {
		var event = event_names[i];
		var most_recent = events[event].pop();
		if (most_recent) {
			window['respond_to_' + event](most_recent);
		}
	}
	// Schedule next loop iteration
	setTimeout(main_loop, 50);
};
main_loop();