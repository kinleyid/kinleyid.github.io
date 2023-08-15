
// Initialize the plant
var all_nodes = [];
var nodes_by_depth = [];
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

function reset_ctx() {
	// reset to defaults
	var ctx_defaults = {
		lineCap: 'round',
		strokeStyle: 'black',
		lineWidth: 1,
		font: "20px Courier",
		fillStyle: 'black'
	}
	var k;
	for (k in ctx_defaults) {
		ctx[k] = ctx_defaults[k]
	}
	ctx.setLineDash([]);
}

var bug_speed = 1;

var game_mode = 'default';
var mode_persistents = {}; // Container for information that needs to persist between calls to the main loop

function add_node(node, theta, length) {
	var new_node = {
		parent: node,
		theta: {
			rel: { // theta relative to parent
				ur: theta - node.theta.abs, // original
				curr: theta - node.theta.abs // current
			},
			abs: theta
		},
		dtheta: 0,
		ddtheta: 0,
		length: length,
		weight: 1,
		max_load: 3.1,
		strength: 1,
		children: [],
		leaves: [],
		sway: 0,
		poison: 0,
		broken: false,
		depth: node.depth + 1
	};
	update_weights(node);
	next_coords = get_next_coords(
		node.x,
		node.y,
		new_node.theta.abs,
		new_node.length);
	new_node.x = next_coords.x;
	new_node.y = next_coords.y;
	node.children.push(new_node);
	all_nodes.push(new_node);
	if (nodes_by_depth[new_node.depth]) {
		nodes_by_depth[new_node.depth].push(new_node);
	} else {
		nodes_by_depth.push([new_node]);
	}
	plant_stats.sugar -= sugar_costs.node;
}

function update_weights(node) {
	// node.weight += 1;
	if (node.parent) {
		update_weights(node.parent)
	}
}

function add_leaf(parent, theta) {
	var new_leaf = {
		parent: parent,
		theta: theta,
		sway: 0,
		health: 1
	};
	parent.leaves.push(new_leaf);
	all_leaves.push(new_leaf)
	plant_stats.sugar -= sugar_costs.leaf;
}

var max_segment_length = 50;
// Each node can only hold so much. How much does each item factor in?
var load_factors = {
	leaf: 0.5,
	node: 1
}
// Each new addition costs sugar. How much do they cost?
var sugar_costs = {
	leaf: 2,
	node: 5,
	weight: 5,
	poison: 10,
	flower: 100
}
var max_theta_change = Math.PI/2;
var stem_radius = 5;
var leaf_radius = 10;

// Colours----------------------
var colours = {
	node: [150, 75, 0],
	leaf: [0, 200, 0],
	poison: [200, 0, 0],
	flower: [227, 61, 148]
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
reset_ctx();

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

function update_node_max_loads() {
	var i, node;
	for (i = 0; i < all_nodes.length; i++) {
		all_nodes[i].max_load = 3.1 + all_nodes[i].weight - 1;
	}
}

function update_node_coords() {
	// Updates the current x and y values for all nodes of the plant
	core.x = cz_coords.x;
	core.y = cz_coords.y;
	var i, node;
	for (i = 0; i < all_nodes.length; i++) {
		node = all_nodes[i];
		node.theta.abs = node.parent.theta.abs + node.theta.rel.curr;
		next_coords = get_next_coords(
			node.parent.x,
			node.parent.y,
			node.theta.abs,
			node.length);
		node.x = next_coords.x;
		node.y = next_coords.y;
	}
}

function compute_centre_of_gravity(node) {
	var cog = {
		x: null,
		y: null,
	}
	var node_m = node.length / max_segment_length * node.weight;
	var leaf_m = 0.1*node.leaves.length;
	var m = node_m + leaf_m;
	var i;
	for (i = 0; i < node.children.length; i++) {
		m += node.children[i].cog.m;
	}
	for (dim in cog) {
		var d = (node_m*(node[dim] + node.parent[dim])/2 + leaf_m*node[dim]);
		var i;
		for (i = 0; i < node.children.length; i++) {
			d += node.children[i].cog[dim] * node.children[i].cog.m;
		}
		cog[dim] = d / m;
	}
	cog.m = m;
	return (cog);
}

function compute_torque(node) {
	var r = Math.sqrt((node.cog.x - node.parent.x)**2 + (node.cog.y - node.parent.y)**2);
	var F = 0.001 * node.cog.m; // Can experiment with different gravitational constants
	var theta = Math.atan2(node.parent.y, node.cog.y, node.cog.x - node.parent.x) - Math.PI/2;
	// var theta = node.theta.abs - Math.PI/2;
	var torque = {
		mag: r * F * Math.sin(theta),
		dir: Math.sign(node.cog.x - node.parent.x)
	};
	return torque;
}

function compute_node_movement() {
	// Start from the outermost branches
	var d;
	for (d = nodes_by_depth.length - 1; d >= 0; d--) {
		var nodes = nodes_by_depth[d];
		var i, node, torque, hooke;
		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			node.cog = compute_centre_of_gravity(node);
			torque = compute_torque(node);
			// Compute spring force
			var angular_displacement = node.theta.rel.curr - node.theta.rel.ur;
			if (Math.abs(angular_displacement) > Math.PI/6) {
				node.broken = true;
			}
			// hooke = - (1 - 1 / (1 + node.weight)**0.1) * angular_displacement; // can experiment with different spring constants
			hooke = - 0.5*node.weight**2 * angular_displacement; // can experiment with different spring constants
			// hooke = -0.8*angular_displacement;
			var F = torque.mag*torque.dir + hooke - 0.2*node.weight**1.5*node.dtheta;
			var ddtheta = F / node.weight**1.5;
			node.dtheta += ddtheta;
			node.theta.rel.curr += node.dtheta;
		}
	}
}

function update_leaf_coords() {
	var i, leaf;
	for (i = 0; i < all_leaves.length; i++) {
		leaf = all_leaves[i];
		leaf.sway += 0.05;
		leaf.visual_theta = leaf.theta + 0.1*Math.sin(leaf.sway)
		next_coords = get_next_coords(
			leaf.parent.x,
			leaf.parent.y,
			leaf.visual_theta,
			2.2*stem_radius);
		leaf.x = next_coords.x;
		leaf.y = next_coords.y;
	}
}

function draw_nodes() {
	reset_ctx();
	var i, node;
	ctx.strokeStyle = colour_to_rgba(colours.node, 1);
	ctx.fillStyle = colour_to_rgba(colours.poison, 1);
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		ctx.lineWidth = Math.sqrt(node.weight);
		ctx.beginPath();
		ctx.moveTo(node.parent.x, node.parent.y);
		ctx.lineTo(node.x, node.y);
		ctx.stroke();
		if (node.poison > 0) {
			ctx.beginPath();
			ctx.arc(node.x, node.y, 2*node.poison**0.5, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (node.draw_break > 0) {
			ctx.beginPath();
			ctx.moveTo(node.x + 2, node.y + 2);
			ctx.lineTo(node.x + 4, node.y + 4);
			ctx.moveTo(node.x - 2, node.y - 2);
			ctx.lineTo(node.x - 4, node.y - 4);
			ctx.moveTo(node.x - 2, node.y + 2);
			ctx.lineTo(node.x - 4, node.y + 4);
			ctx.moveTo(node.x + 2, node.y - 2);
			ctx.lineTo(node.x + 4, node.y - 4);
			ctx.stroke();				
			node.draw_break -= 1;
		}
	}
}

var plant_stats = {
	sugar: 35
	// sugar: Infinity
}

var show_controls = true;
var show_stats = true;

function draw_info() {
	ctx.textAlign = 'left';
	var lines = [];
	lines.push(['---[C]ontrols---']);
	if (show_controls) {
		lines.push([
			'New node:    "N"',
			'Remove node: "R"',
			'New leaf:    "L"',
			'Defence:     "D"',
			'Drag view:   "V"',
			'Strengthen:  "W"',
			'Flower:      "F"'
		])
	} else {
		lines.push(['']);
	}
	lines.push(['---[S]tats---'])
	if (show_stats) {
		lines.push([
			'Sugar:      ' + plant_stats.sugar.toFixed(2),
			'Bug rate:   ' + (bug_rate).toFixed(2)
		])
	} else {
		lines.push(['']);
	}
	var line_count = 0;
	var i, j;
	for (i = 0; i < lines.length; i++) {
		for (j = 0; j < lines[i].length; j++) {
			ctx.fillText(lines[i][j], 10, (line_count + 1)*line_height);
			line_count++;
		}
	}
}

var wind = {
	x: 0,
	y: 0
};

function draw_leaves() {
	reset_ctx();
	var i, leaf, colour;
	for (i = 0; i < all_leaves.length; i++) { // Skip the core node; it has no parent
		leaf = all_leaves[i];
		colour = [colours.leaf[0], colours.leaf[1], colours.leaf[2]];
		colour[0] = 200*(1 - leaf.health);
		ctx.fillStyle = colour_to_rgba(colour, 0.5 - 0.5*(1 - leaf.health));
		// ctx.fillRect(leaf.x - leaf_radius/2, leaf.y - leaf_radius/2, leaf_radius, leaf_radius);
		ctx.beginPath();
		ctx.ellipse(leaf.x, leaf.y, leaf_radius, stem_radius, -leaf.visual_theta, 0, 2*Math.PI);
		ctx.fill();
	}
}

function draw_flower() {
	reset_ctx();
	ctx.fillStyle = colour_to_rgba(colours.flower, 0.3);
	var n_petals = 9;
	var n_layers = 5;
	var petal_radius = 10;
	var i, j, theta, offset, radius;
	for (i = 0; i < n_layers; i++) {
		// offset = Math.random()*2*Math.PI;
		offset = i;
		radius = petal_radius*0.8**i;
		for (j = 0; j < n_petals; j++) {
			theta = offset + j/n_petals*2*Math.PI + 0.1*Math.sin(flower_rotation);
			ctx.beginPath();
			ctx.ellipse(
				flowering_node.x + Math.cos(theta) * radius,
				flowering_node.y + Math.sin(theta) * radius,
				radius*2, radius/1.5, theta, 0, 2*Math.PI);
			ctx.fill();		
		}
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
	if (min_dist > 100) {
		selected_node = null;
	}
	return (selected_node);
}

function get_remaining_load(node) {
	return (node.max_load - (node.children.length*load_factors.node + node.leaves.length*load_factors.leaf));
}

function remove_broken_nodes() {
	function mark_for_removal(node) {
		node.remove = true;
		var i;
		while (node.leaves.length > 0) {
			remove_leaf(node.leaves[0]);
		}
		for (i = 0; i < node.children.length; i++) {
			mark_for_removal(node.children[i]);
		}
	}
	var any_broken = false;
	var i;
	for (i = 0; i < all_nodes.length; i++) {
		if (all_nodes[i].broken) {
			any_broken = true;
			var j;
			for (j = 0; j < all_nodes[i].children.length; j++) {
				mark_for_removal(all_nodes[i].children[j]);
			}
			all_nodes[i].children = [];
			all_nodes[i].broken = false;
			all_nodes[i].draw_break = 8;
		}
	}
	if (any_broken) {
		var new_all_nodes = [];
		var i;
		for (i = 0; i < all_nodes.length; i++) {
			if (all_nodes[i].remove) {
				// goodbye
			} else {
				new_all_nodes.push(all_nodes[i])
			}
		}
		all_nodes = new_all_nodes;
		recompute_nodes_by_depth();
	}
}

function recompute_nodes_by_depth() {
	nodes_by_depth = [];
	var node;
	for (i = 0; i < all_nodes.length; i++) {
		node = all_nodes[i];
		if (nodes_by_depth[node.depth]) {
			nodes_by_depth[node.depth].push(node);
		} else {
			nodes_by_depth.push([node]);
		}
	}
}

var all_bugs = [];
function update_bugs() {
	var i, bug, theta;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		// Get a little hungrier
		bug.health *= 0.99
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
				bug.target.parent.poison -= 1;
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
	reset_ctx();
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	var i, bug;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		bug_w = 3 + 2 * Math.random();
		bug_h = 3 + 2 * Math.random();
		ctx.fillRect(bug.x - bug_w/2, bug.y - bug_h/2, bug_w, bug_h)
	}
}

function draw_cursor() {
	reset_ctx();
	if (game_mode == 'default') {
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new node: select parent' || game_mode == 'new node: position') {
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new leaf') {
		ctx.strokeStyle = colour_to_rgba(colours.leaf, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'add weight') {
		ctx.strokeRect(mouse.x-2, mouse.y-2, 4, 4)
	} else if (game_mode == 'remove node') {
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.moveTo(mouse.x - 3, mouse.y - 3);
		ctx.lineTo(mouse.x + 3, mouse.y + 3);
		ctx.moveTo(mouse.x + 3, mouse.y - 3);
		ctx.lineTo(mouse.x - 3, mouse.y + 3);
		ctx.stroke();
	} else if (game_mode == 'drag view: unclicked') {
		ctx.beginPath();
		ctx.moveTo(mouse.x - 5, mouse.y);
		ctx.lineTo(mouse.x + 5, mouse.y);
		ctx.moveTo(mouse.x, mouse.y - 5);
		ctx.lineTo(mouse.x, mouse.y + 5);
		ctx.stroke();
	} else if (game_mode == 'drag view: clicked') {
		ctx.beginPath();
		ctx.moveTo(mouse.x - 8, mouse.y);
		ctx.lineTo(mouse.x + 8, mouse.y);
		ctx.moveTo(mouse.x, mouse.y - 8);
		ctx.lineTo(mouse.x, mouse.y + 8);
		ctx.stroke();
	} else if (game_mode == 'poison') {
		ctx.strokeStyle = colour_to_rgba(colours.poison, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'flower') {
		ctx.fillStyle = colour_to_rgba(colours.flower, 1);
		ctx.beginPath();
		ctx.arc(mouse.x, mouse.y, 3, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function can_add(parent, what) {
	if (what == 'node' | what == 'leaf') {
		return (
			(get_remaining_load(parent) > load_factors[what]) & 
			(plant_stats.sugar > sugar_costs[what]));
	} else if (what == 'poison') {
		return (parent.poison <= 0.1 & plant_stats.sugar > sugar_costs.poison);
	} else if (what == 'strength') {
		return (plant_stats.sugar > sugar_costs.weight)
	} else if (what == 'flower') {
		// return true;
		return (parent.depth > 3 & parent.leaves.length == 0 & parent.children.length == 0 & plant_stats.sugar > sugar_costs.flower);
	}
}

function respond_to_cursor_position() {
	reset_ctx();
	if (game_mode == 'new node: select parent') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (can_add(mode_persistents.selected_parent, 'node')) {
				// If so, highlight it
				ctx.strokeStyle = colour_to_rgba(colours.node, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
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
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.moveTo(parent.x, parent.y);
		ctx.setLineDash([2, 2]);
		ctx.lineTo(next_coords.x, next_coords.y);
		ctx.stroke();
	} else if (game_mode == 'new leaf') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'leaf')) {
				ctx.strokeStyle = colour_to_rgba(colours.leaf, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'add weight') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'strength')) {
				// ctx.strokeStyle = colour_to_rgba(colours.poison, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'remove node') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			ctx.strokeStyle = colour_to_rgba('red', 1);
			ctx.beginPath();
			ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
			ctx.stroke();
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
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'flower') {
		mode_persistents.selected_parent = find_selected_node();
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'flower')) {
				ctx.strokeStyle = colour_to_rgba(colours.flower, 1);
				ctx.beginPath();
				ctx.arc(mode_persistents.selected_parent.x, mode_persistents.selected_parent.y, 5, 0, 2 * Math.PI);
				ctx.stroke();
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	}
}

var flowering_node = null;
var flower_rotation = 0;

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
			// var theta = Math.atan2(parent.y - mouse.y, mouse.x - parent.x);
			var theta = Math.random() * 2 * Math.PI;
			add_leaf(mode_persistents.selected_parent, theta);
		}
	} else if (game_mode == 'add weight') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.weight += 1;
			plant_stats.sugar -= sugar_costs.weight;
		}
	} else if (game_mode == 'remove node') {
		var parent = mode_persistents.selected_parent;
		parent.broken = true;
	} else if (game_mode == 'drag view: clicked') {
		game_mode = 'drag view: unclicked';
	} else if (game_mode == 'poison') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.poison = 3;
			plant_stats.sugar -= sugar_costs.poison;
		}
	} else if (game_mode == 'flower') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			// Win condition!
			flowering_node = parent;
			plant_stats.flower -= sugar_costs.flower;
			all_bugs = [];
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
	} else if (e.key == 'r') {
		mode_persistents = {};
		game_mode = 'remove node';
	} else if (e.key == 'w') {
		mode_persistents = {};
		game_mode = 'add weight';
	} else if (e.key == 'f') {
		mode_persistents = {};
		game_mode = 'flower';
	} else if (e.key == 'Escape') {
		if (game_mode == 'new node: position') {
			delete mode_persistents.new_node;
			game_mode = 'new node: select parent';
		} else {
			mode_persistents = {};
			game_mode = 'default';
		}
	}  else if (e.key == 'c') {
		show_controls = !show_controls;
	} else if (e.key == 's') {
		show_stats = !show_stats;
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
	// bug_rate = 1 - (1 / (1 + 0.0001 * plant_stats.sugar));
	bug_rate = 1 - (1 / (1 + 0.0003 * all_leaves.length));
	if (Math.random() < bug_rate) {
		if (flowering_node) {
			// eden
		} else {
			add_bug();
		}
	}
}

var core = {
	x: cz_coords.x,
	y: cz_coords.y,
	children: [],
	depth: -1,
	theta: {abs: Math.PI/2}
};
add_node(core, Math.PI/2, max_segment_length);

// Main game loop
start_time = performance.now();
function main_loop() {
	// Game logic
	accumulate_sugar();
	bug_proliferation();
	// Pre-graphic stuff
	update_node_coords();
	compute_node_movement();
	update_leaf_coords();
	update_bugs();
	remove_broken_nodes();
	// Graphics
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_info();
	draw_cursor();
	draw_nodes();
	draw_leaves();
	draw_bugs();
	if (flowering_node) {
		flower_rotation += 0.1;
		draw_flower();
	}
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
	setTimeout(main_loop, 16.6*2);
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