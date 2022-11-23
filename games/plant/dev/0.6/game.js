
// Initialize the plant
var core = {
	x: null,
	y: null,
	children: []
};
var all_nodes = [];
var all_leaves = [];

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

var bug_speed = 1;

var game_mode = 'default';
var mode_persistents = {}; // Container for information that needs to persist between calls to the main loop

function add_node(node, theta, length) {
	var new_node = {
		parent: node,
		theta: theta,
		length: length,
		weight: 1,
		children: [],
		leaves: [],
		sway: 0,
		poison: false
	};
	node.children.push(new_node);
	all_nodes.push(new_node);
	plant_stats.sugar -= sugar_costs.node;
}

function add_leaf(parent, theta) {
	var new_leaf = {
		parent: parent,
		theta: theta,
		sway_x: 0,
		sway_y: 0,
		health: 1
	};
	parent.leaves.push(new_leaf);
	all_leaves.push(new_leaf)
	plant_stats.sugar -= sugar_costs.leaf;
}

var max_segment_length = 50;
// Each node can only hold so much. How much does each item factor in?
var max_load = 3.1;
var load_factors = {
	leaf: 0.5,
	node: 1
}
// Each new addition costs sugar. How much do they cost?
var sugar_costs = {
	leaf: 2,
	node: 5,
	poison: 10
}
var max_theta_change = Math.PI/2;
var stem_radius = 5;
var leaf_radius = 10;

// Colours----------------------
var colours = {
	node: [150, 75, 0],
	leaf: [0, 200, 0],
	poison: [200, 0, 0]
}
function colour_to_rgba(colour, a) {
	return ('rgba(' + colour[0] + ',' + colour[1] + ',' + colour[2] + ',' + a + ')')
}

// Graphics stuff

var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');
canv.style.cursor = 'none'; // We'll draw our own

// Coordinate system: the origin of the underlying
// geometry will be the plant's core
// I.e., this is the location of the origin of a core-based coordinate system,
// relative to the screen-based coordinate system
var cz_coords = {
	x: canv.width/2,
	y: canv.height/2
}

function get_next_coords(x, y, theta, length) {
	return({
		x: x + length*Math.cos(theta),
		y: y - length*Math.sin(theta)
	})
}

function update_node_coords() {
	// Updates the current x and y values for all nodes of the plant
	core.x = cz_coords.x;
	core.y = cz_coords.y;
	var i;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		all_nodes[i].sway += 0.1 - 0.2*Math.random();
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

function update_leaf_coords() {
	wind.x += 0.3*Math.random();
	wind.y += 0.1*Math.random();
	var i, leaf;
	for (i = 0; i < all_leaves.length; i++) {
		leaf = all_leaves[i];
		next_coords = get_next_coords(
			leaf.parent.x,
			leaf.parent.y,
			leaf.theta,
			stem_radius);
		leaf.x = next_coords.x + Math.sin(wind.x + 0.05 - 0.1*Math.random());
		leaf.y = next_coords.y + Math.sin(wind.y + 0.05 - 0.1*Math.random());
	}
}

function draw_nodes() {
	var i, node;
	ctx.strokeStyle = colour_to_rgba(colours.node, 1);
	ctx.fillStyle = colour_to_rgba(colours.poison, 1);
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		ctx.beginPath();
		ctx.moveTo(node.parent.x, node.parent.y);
		ctx.lineTo(node.x, node.y);
		ctx.stroke();
		if (node.poison) {
			ctx.beginPath();
			ctx.arc(node.x, node.y, 2, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
	ctx.strokeStyle = 'black';
	ctx.fillStyle = 'black';
}

var plant_stats = {
	sugar: 1/0
}

function draw_info() {
	var line_height = 20;
	ctx.font = line_height + "px Courier";
	ctx.textAlign = 'left';
	var lines = [
		'---Controls---',
		'New node:  "N"',
		'New leaf:  "L"',
		'Defence:   "D"',
		'Drag view: "V"',
		'---Stats------',
		'Sugar:     ' + plant_stats.sugar.toFixed(2)];
		// 'Bug rate:  ' + Math.log10(bug_rate).toFixed(3)];
	var i;
	for (i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], 10, line_height + i*line_height);
	}
}

var wind = {
	x: 0,
	y: 0
};

function draw_all_leaves() {
	var i, leaf, colour;
	for (i = 0; i < all_leaves.length; i++) { // Skip the core node; it has no parent
		leaf = all_leaves[i];
		colour = [colours.leaf[0], colours.leaf[1], colours.leaf[2]];
		colour[0] = 200*(1 - leaf.health);
		ctx.fillStyle = colour_to_rgba(colour, 0.5 - 0.5*(1 - leaf.health));
		ctx.fillRect(leaf.x - leaf_radius/2, leaf.y - leaf_radius/2, leaf_radius, leaf_radius);
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
	return (max_load - (node.children.length*load_factors.node + node.leaves.length*load_factors.leaf));
}

var all_bugs = [];
function update_bugs() {
	var i, bug, theta;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		// Get a little hungrier
		bug.health *= 0.995
		// Interact with plant
		if (!bug.landed) {
			bug.err += 0.5 - 1*Math.random();
			// Bug is seeking some target leaf. First, we need the target leaf's coordinates in the core-zero system
			if (bug.target) {
				t_czx = bug.target.x - cz_coords.x;
				t_czy = bug.target.y - cz_coords.y;
				// What direction should the bug go in?
				theta = Math.atan2(bug.y_cz - t_czy, t_czx - bug.x_cz);
				// Add jitter
				theta += Math.sin(bug.err);
			} else {
				theta = bug.err;
			}
			// Move toward target
			bug.x_cz += bug_speed*Math.cos(theta);
			bug.y_cz -= bug_speed*Math.sin(theta);
			// Compute screen coords
			bug.x = cz_coords.x + bug.x_cz;
			bug.y = cz_coords.y + bug.y_cz;
			if (bug.target) {
				// Test whether it's actually landed and can begin eating
				if (Math.sqrt((bug.x_cz - t_czx)**2 + (bug.y_cz - t_czy)**2) < leaf_radius/2) {
					bug.landed = true;
				}
			} else {
				bug.target = all_leaves[Math.floor(Math.random()*all_leaves.length)];
			}
		} else {
			bug.x = bug.target.x;
			bug.y = bug.target.y;
			// Is the node poisoned?
			if (bug.target.parent.poison) {
				// If so, the bug dies
				remove_bug(bug);
				// And the poison is used up
				bug.target.parent.poison = false;
			} else {
				// Chomp chomp
				bug.target.health -= 0.01;
				bug.health += 0.01
				bug.health = Math.min(0.99, bug.health);
				if (bug.target.health <= 0) {
					remove_leaf(bug.target);
					// Pick a new target
					bug.landed = false;
					bug.target = all_leaves[Math.floor(Math.random()*all_leaves.length)];
				}
			}
		}
		// Die?
		if (bug.health <= 0.01) {
			remove_bug(bug);
		}
	}
}

function remove_leaf(leaf) {
	var del_idx;
	// Remove from parent's leaves
	var parent = leaf.parent;
	del_idx = parent.leaves.indexOf(leaf);
	if (del_idx >= 0) {
		parent.leaves.splice(del_idx, 1);
	}
	// Remove from all_leaves list
	del_idx = all_leaves.indexOf(leaf);
	if (del_idx >= 0) {
		all_leaves.splice(del_idx, 1);
	}
	// :(
}

function add_bug() {
	var bug = {
		x_cz: Math.random()*canv.width - canv.width/2,
		y_cz: -canv.height/2,
		x: null, // will be updated later
		y: null,
		target: all_leaves[Math.floor(Math.random()*all_leaves.length)],
		landed: false,
		health: 1,
		err: 0
	}
	all_bugs.push(bug);
}

function remove_bug(bug) {
	var del_idx = all_bugs.indexOf(bug);
	all_bugs.splice(del_idx, 1);
}

function draw_bugs() {
	var i, bug;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		bug_w = 3 + 2 * Math.random();
		bug_h = 3 + 2 * Math.random();
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(bug.x - bug_w/2, bug.y - bug_h/2, bug_w, bug_h)
		ctx.fillStyle = 'black';
	}
}

function draw_cursor() {
	if (game_mode == 'default') {
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new node: select parent' || game_mode == 'new node: position') {
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.strokeStyle = 'black';
	} else if (game_mode == 'new leaf') {
		ctx.strokeStyle = colour_to_rgba(colours.leaf, 1);
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
	} else if (game_mode == 'poison') {
		ctx.strokeStyle = colour_to_rgba(colours.poison, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.strokeStyle = 'black';
	}
}

function can_add(parent, what) {
	if (what == 'node' | what == 'leaf') {
		return (
			(get_remaining_load(parent) > load_factors[what]) & 
			(plant_stats.sugar > sugar_costs[what]));
	} else if (what == 'poison') {
		return (!parent.poison & plant_stats.sugar > sugar_costs.poison);
	}
}

function respond_to_cursor_position() {
	if (game_mode == 'new node: select parent') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (can_add(mode_persistents.selected_parent, 'node')) {
				// If so, highlight it
				ctx.strokeStyle = colour_to_rgba(colours.node, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.strokeStyle = 'black';
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
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.moveTo(parent.x, parent.y);
		ctx.setLineDash([2, 2]);
		ctx.lineTo(next_coords.x, next_coords.y);
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.strokeStyle = 'black'
	} else if (game_mode == 'new leaf') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'leaf')) {
				ctx.strokeStyle = colour_to_rgba(colours.leaf, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.strokeStyle = 'black';
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'drag view: clicked') {
		cz_coords.x = mode_persistents.gpx_initial.x + (mouse.x - mode_persistents.first_click.x)
		cz_coords.y = mode_persistents.gpx_initial.y + (mouse.y - mode_persistents.first_click.y)
	} else if (game_mode == 'poison') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (can_add(mode_persistents.selected_parent, 'poison')) {
				// If so, highlight it
				ctx.strokeStyle = colour_to_rgba(colours.poison, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.strokeStyle = 'black';
			} else {
				mode_persistents.selected_parent = null;
			}
		}
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
			add_leaf(mode_persistents.selected_parent, theta);
		}
	} else if (game_mode == 'drag view: clicked') {
		game_mode = 'drag view: unclicked'
	} else if (game_mode == 'poison') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.poison = true;
			plant_stats.sugar -= sugar_costs.poison;
		}
	}
}

function respond_to_mousedown(e) {
	if (game_mode == 'drag view: unclicked') {
		mode_persistents.first_click = e;
		mode_persistents.gpx_initial = {
			x: cz_coords.x,
			y: cz_coords.y
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
	} else if (e.key == 'v') {
		mode_persistents = {};
		game_mode = 'drag view: unclicked';
	} else if (e.key == 'd') {
		mode_persistents = {};
		game_mode = 'poison';
	} else if (e.key == 'Escape') {
		if (game_mode == 'new node: position') {
			delete mode_persistents.new_node;
			game_mode = 'new node: select parent';
		} else {
			mode_persistents = {};
			game_mode = 'default';
		}
	}
}

function accumulate_sugar() {
	var i;
	for (i = 0; i < all_nodes.length; i++) {
		plant_stats.sugar += 0.005*all_nodes[i].leaves.length;
	}
}

var bug_rate;
function bug_proliferation() {
	var elapased_time = performance.now() - start_time;
	elapased_time *= 0.0001;
	// bug_rate = 0.01 * (1 + elapased_time) / (100 + elapased_time);
	bug_rate = 1 - (1 / (1 + 0.0001 * plant_stats.sugar));
	if (Math.random() < bug_rate) {
		add_bug();
	}
}

add_node(core, Math.PI/2, max_segment_length)
plant_stats.sugar = 13;
// Main game loop
start_time = performance.now();
function main_loop() {
	// Game logic
	accumulate_sugar();
	bug_proliferation();
	// Pre-graphic stuff
	update_node_coords();
	update_leaf_coords();
	update_bugs();
	// Graphics
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_info();
	draw_cursor();
	draw_nodes();
	draw_all_leaves();
	draw_bugs();
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
	setTimeout(main_loop, 30);
};

// Instructions screen

var instr = [
	'PLANT GAME',
	'',
	'You are a plant. Your goal is to get bigger.',
	'To do so, you need to grow new nodes. However, nodes cost sugar.',
	'To get more sugar, you need to grow leaves to photosynthesize.',
	'There are bugs that want to eat your leaves. To get rid of them,',
	'you can deploy your chemical defenses to the node where they are eating.',
	'This also costs sugar. Good luck! Press "B" to begin.'
];

ctx.clearRect(0, 0, canv.width, canv.height);
line_height = 20;
total_height = line_height * instr.length;
start_height = canv.height/2 - total_height/2;
ctx.font = line_height + 'px Courier';
ctx.textAlign = 'center';
var i;
for (i = 0; i < instr.length; i++) {
	ctx.fillText(instr[i], canv.width/2, start_height + i*line_height);
}
document.onkeydown = function(e) {
	if (e.key == 'b') {
		start_game();
	}
}

function start_game() {
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

	main_loop();
}