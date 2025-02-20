
// Update height of instructions container
var container = document.getElementById('instructions-text-container');
var canv_box = document.getElementById('canv').getBoundingClientRect();
var container_box = container.getBoundingClientRect();
var bottom = canv_box.y + canv_box.height;
var height = bottom - container_box.y;
container.style.height = height + 'px';
container.style.maxHeight = height + 'px';

function random_sample(arr) {
	return arr[Math.floor(Math.random()*arr.length)]
}

var n_instruction_pages = 8;
var page_n = 1;
var i, page_control;
for (i = 1; i <= n_instruction_pages; i++) {
	var page_control = document.getElementById('page-control:' + i);
	page_control.onclick = function(e) {
		page_n = e.target.id.split(':')[1];
		update_instruction_pages();
	};
}

var sounds = {
	'branch-break': null,
	'branch-grow': null,
	'leaf-grow': null,
	'defense-add': null,
	'branch-strengthen': null,
	'leaf-eaten': null,
	// 'helper-add': null,
	'flower': null,
	'background': null,
	'bug-buzz': null,
	'bug-eaten': null
}

function load_sounds() {
	var k;
	for (k in sounds) {
		sounds[k] = {play: false, audio: new Audio('audio/' + k + '.mp3')}
	}
}

load_sounds();

function play_sounds() {
	var k;
	for (k in sounds) {
		if (sounds[k].play) {
			sounds[k].audio.pause();
			sounds[k].audio.currentTime = 0;
			sounds[k].audio.play();
			sounds[k].play = false;
		}
	}
}

function update_instruction_pages() {
	var i, page, page_control;
	for (i = 1; i <= n_instruction_pages; i++) {
		page = document.getElementById('instructions:' + i);
		page_control = document.getElementById('page-control:' + i);
		if (i == page_n) {
			page.style.display = '';
			page_control.style.cursor = '';
			page_control.style.backgroundColor = 'gray';
		} else {
			page.style.display = 'none';
			page_control.style.cursor = 'pointer';
			page_control.style.backgroundColor = '';
		}
	}
}
update_instruction_pages();

// Initialize the plant
var all_nodes = [];
var nodes_by_depth = [];
var all_leaves = [];

// Track mouse movement
var mouse = {
	x: null,
	y: null
};

// Track events
var event_records = {
	mousedown: [],
	touchstart: [],
	mouseup: [],
	touchup: [],
	keydown: [],
	keyup: []
};

// Record of the game
var stats = {
	'n_bugs': {'data': [], 'max': -Infinity, 'min': Infinity},
	'n_leaves': {'data': [], 'max': -Infinity, 'min': Infinity},
	'energy': {'data': [], 'max': -Infinity, 'min': Infinity}
}
function highlight_span(span, on_off) {
	if (on_off == 'on') {
		span.style.color = 'white';
		span.style.backgroundColor = 'black';
	} else if (on_off == 'off') {
		span.style.color = 'black';
		span.style.backgroundColor = 'white';
	}
}
function set_plotting_stat(stat) {
	// Un-highlight previous controller button
	if (curr_plotting_stat) {
		highlight_span(document.getElementById('stat-controller:' + curr_plotting_stat), 'off');
	}
	// Set plotting stat and highlight controller button
	curr_plotting_stat = stat;
	highlight_span(document.getElementById('stat-controller:' + curr_plotting_stat), 'on');
}
var curr_plotting_stat;
set_plotting_stat('energy');

function record_event(e) {
	var recorded_info;
	if (e.type.substring(0, 3) == 'key') {
		// Record key identity
		recorded_info = e;
	} else {
		// Record coordinates
		recorded_info = {
			x: e.clientX - viewport.offsetLeft,
			y: e.clientY - viewport.offsetTop
		}
	}
	event_records[e.type] = [recorded_info];
}

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

// Various constants

var bug_speed = 1;
var max_segment_length = 50;
var height_threshold = 7*max_segment_length;
var game_mode = 'default';
var min_leaf_size = 1;
var max_leaf_size = 10;
var min_leaf_weight = 0.01;
var max_leaf_weight = 0.1;
var leaf_length_to_width_ratio = 2;
var mode_persistents = {}; // Container for information that needs to persist between calls to the main loop

function add_node(node, theta, length) {
	var jitter = 0.6*(Math.random() - 0.5);
	// theta += jitter;
	var new_node = {
		parent: node,
		theta: {
			rel: { // theta relative to parent
				ur: theta + jitter - node.theta.abs, // original
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
		defense: 0,
		broken: false,
		depth: node.depth + 1
	};
	// new_node.dtheta += 0.2*(0.5 - Math.random());
	// new_node.parent.dtheta += 0.2*(0.5 - Math.random());
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
	plant_stats.energy -= energy_costs.node;
}

function update_weights(node) {
	// node.weight += 1;
	if (node.parent) {
		update_weights(node.parent)
	}
}

function add_leaf(parent) {
	var theta = Math.random() * 2 * Math.PI;
	var new_leaf = {
		parent: parent,
		theta: theta,
		sway: 0,
		age: 0,
		mature_rate: Math.random()*0.05,
		maturity: 0,
		size: min_leaf_size,
		weight: min_leaf_weight,
		health: 1,
		targeting_bugs: []
	};
	parent.leaves.push(new_leaf);
	all_leaves.push(new_leaf)
	plant_stats.energy -= energy_costs.leaf;
	sounds['leaf-grow'].play = true;
}

function add_max_leaves(node, args) {
	while (can_add(node, 'leaf')) {
		add_leaf(node);
	}
	if (args['recursive']) {
		var i;
		for (i = 0; i < node.children.length; i++) {
			add_max_leaves(node.children[i], args);
		}
	}
}

// Each node can only hold so much. How much does each item factor in?
var load_factors = {
	leaf: 0.5,
	node: 1
}
// Each new addition costs energy. How much do they cost?
var energy_costs = {
	leaf: 2,
	node: 5,
	weight: 4,
	defense: 10,
	helper: 30,
	flower: 1000
}
var max_theta_change = Math.PI/2;
var stem_radius = 5;
var leaf_radius = 10;

// Colours----------------------
var colours = {
	node: [150, 75, 0],
	leaf: [0, 200, 0],
	defense: [200, 0, 0],
	flower: [227, 61, 148],
	bug: [0, 0, 0],
	helper: [255, 127, 80]
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

// Graphics to display stats
var stats_canv = document.getElementById('stats-canv');
var stats_ctx = stats_canv.getContext('2d');

// Coordinate system: the origin of the underlying
// geometry will be the plant's core
// I.e., this is the location of the origin of a core-based coordinate system,
// relative to the screen-based coordinate system
var cz_coords = {
	x: canv.width/2,
	y: canv.height - 100
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
	// Mass of wood
	var node_m = node.length / max_segment_length * node.weight;
	// Mass of leaves
	var leaf_m = 0;
	var i;
	for (i = 0; i < node.leaves.length; i++) {
		leaf_m += node.leaves[i].weight;
	}
	// Total mass
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
	var theta = Math.atan2(node.cog.y - node.parent.y, node.cog.x - node.parent.x) + Math.PI/2;
	var torque = {
		mag: Math.abs(r * F * Math.sin(theta)),
		dir: -Math.sign(node.cog.x - node.parent.x)
	};
	return torque;
}

function compute_node_movement() {
	// Start from the outermost branches
	var d;
	for (d = nodes_by_depth.length - 1; d >= 0; d--) {
		var nodes = nodes_by_depth[d];
		var i, node, torque, hooke, max_hooke;
		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			node.cog = compute_centre_of_gravity(node);
			torque = compute_torque(node);
			// Compute spring force
			var angular_displacement = node.theta.rel.curr - node.theta.rel.ur;
			if (Math.abs(angular_displacement) > Math.PI/4) {
				mark_for_removal(node);
				node.parent.draw_break = 10;
				sounds['branch-break'].play = true;
			}
			// hooke = - (1 - 1 / (1 + node.weight)**0.1) * angular_displacement; // can experiment with different spring constants
			// hooke = - 0.5*node.weight**2 * angular_displacement; // can experiment with different spring constants
			// max_hooke = node.weight*0.05;
			hooke = - 0.8*node.weight**1.2 * Math.sign(angular_displacement)*Math.abs(angular_displacement); // can experiment with different spring constants
			// hooke = Math.sign(hooke)*Math.min(max_hooke, Math.abs(hooke));
			// hooke = -0.8*angular_displacement;
			var F = torque.mag*torque.dir + hooke;
			// var ddtheta = F / node.weight - 0.1*node.weight**1.5*node.dtheta;
			var ddtheta = F / node.weight - 0.1*node.dtheta; // damped by final term
			node.dtheta += ddtheta;
			node.theta.rel.curr += node.dtheta;
		}
	}
}

function update_leaves() {
	var i, leaf;
	for (i = 0; i < all_leaves.length; i++) {
		leaf = all_leaves[i];
		leaf.age++;
		leaf.maturity = 1 - Math.exp(-leaf.mature_rate*leaf.age);
		leaf.size = min_leaf_size + leaf.maturity*(max_leaf_size - min_leaf_size);
		leaf.weight = min_leaf_weight + leaf.maturity*(max_leaf_weight - min_leaf_weight);
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
			leaf.size);
		leaf.x = next_coords.x;
		leaf.y = next_coords.y;
	}
}

function draw_nodes() {
	reset_ctx();
	// Draw core
	ctx.fillStyle = colour_to_rgba(colours.node, 1);
	ctx.beginPath();
	ctx.arc(core.x + cz_coords.x, core.y + cz_coords.y, 2, 0, 2 * Math.PI);
	ctx.fill();
	// Draw nodes
	var i, node;
	ctx.strokeStyle = colour_to_rgba(colours.node, 1);
	ctx.fillStyle = colour_to_rgba(colours.defense, 1);
	var x, y;
	for (i = 0; i < all_nodes.length; i++) { // Skip the core node; it has no parent
		node = all_nodes[i];
		ctx.lineWidth = Math.sqrt(node.weight);
		ctx.beginPath();
		ctx.moveTo(node.parent.x + cz_coords.x, node.parent.y + cz_coords.y);
		ctx.lineTo(node.x + cz_coords.x, node.y + cz_coords.y);
		ctx.stroke();
		x = node.x + cz_coords.x;
		y = node.y + cz_coords.y;
		if (node.defense > 0) {
			ctx.beginPath();
			ctx.arc(x, y, 2*node.defense**0.5, 0, 2 * Math.PI);
			ctx.fill();
		}
		if (node.draw_break > 0) {
			ctx.beginPath();
			ctx.moveTo(x + 2, y + 2);
			ctx.lineTo(x + 4, y + 4);
			ctx.moveTo(x - 2, y - 2);
			ctx.lineTo(x - 4, y - 4);
			ctx.moveTo(x - 2, y + 2);
			ctx.lineTo(x - 4, y + 4);
			ctx.moveTo(x + 2, y - 2);
			ctx.lineTo(x + 4, y - 4);
			ctx.stroke();				
			node.draw_break -= 1;
		}
	}
}

var plant_stats = {
	energy: 34
	// energy: Infinity
	// energy: 500
}

var wind = {
	x: 0,
	y: 0
};

function draw_leaves() {
	reset_ctx();
	var i, leaf, colour;
	for (i = 0; i < all_leaves.length; i++) {
		leaf = all_leaves[i];
		colour = [
			leaf.health*colours.leaf[0] + (1 - leaf.health)*255,
			leaf.health*colours.leaf[1] + (1 - leaf.health)*150,
			leaf.health*colours.leaf[2] + (1 - leaf.health)*0 
		];
		ctx.fillStyle = colour_to_rgba(colour, 0.5 - 0.5*(1 - leaf.health)**6);
		ctx.beginPath();
		ctx.ellipse(leaf.x + cz_coords.x, leaf.y + cz_coords.y, leaf.size, leaf.size/leaf_length_to_width_ratio, -leaf.visual_theta, 0, 2*Math.PI);
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
				flowering_node.x + cz_coords.x + Math.cos(theta) * radius,
				flowering_node.y + cz_coords.y + Math.sin(theta) * radius,
				radius*2, radius/1.5, theta, 0, 2*Math.PI);
			ctx.fill();		
		}
	}
}

function find_nearest(source, targets) {
	// Finds the node of the plant nearest to the cursor
	var min_dist = Infinity;
	var i, dist, nearest;
	for (i = 0; i < targets.length; i++) {
		dist = Math.sqrt((targets[i].x - source.x)**2 + (targets[i].y - source.y)**2);
		if (dist < min_dist) {
			min_dist = dist;
			nearest = targets[i];
		}
	}
	return (nearest);
}

function find_nearest_node(args) {
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
	if (args.including_core) {
		dist = Math.sqrt((core.x - mouse.x)**2 + (core.y - mouse.y)**2);
		if (dist < min_dist) {
			min_dist = dist;
			selected_node = core;
		}
	}
	if (min_dist > 100) {
		selected_node = null;
	}
	return (selected_node);
}

function get_remaining_load(node) {
	return (node.max_load - (node.children.length*load_factors.node + node.leaves.length*load_factors.leaf));
}

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

function remove_nodes() {
	var any_to_remove = false;
	var i, k;
	for (i = 0; i < all_nodes.length; i++) {
		if (all_nodes[i].remove) {
			any_to_remove = true;
			break;
		}
	}
	if (any_to_remove) { // Only bother if there are any
		// Create new list of all nodes
		var new_all_nodes = [];
		for (i = 0; i < all_nodes.length; i++) {
			if (all_nodes[i].remove) {
				// Remove from parent's children by creating an array not containing to-be-removed node
				var new_children = [];
				for (k = 0; k < all_nodes[i].parent.children.length; k++) {
					if (all_nodes[i].parent.children[k] !== all_nodes[i]) {
						new_children.push(all_nodes[i].parent.children[k]);
					}
				}
				all_nodes[i].parent.children = new_children;
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

function remove_dead_bugs() {
	var alive_bugs = [];
	var i;
	for (i = 0; i < all_bugs.length; i++) {
		if (all_bugs[i].alive) {
			alive_bugs.push(all_bugs[i]);
		}
	}
	all_bugs = alive_bugs;
}

function update_bug_states() {
	var i, bug;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		if (bug.alive) {
			// Get a little hungrier
			// bug.health -= 0.001;
			bug.health *= 0.998;
			if (bug.health < bug.min_health) {
				bug.alive = false;
			} else {
				// If still alive, behave
				if (bug.is_helper) {
					// New target should be selected unless:
					// -there is a current target
					// -the current target is alive
					var select_new_target = true;
					if (bug.target) {
						if (bug.target.alive) {
							select_new_target = false;
							if (bug.at_target) {
								bug.health += bug.target.health; // Smaller bugs provide less nourishment
								bug.health = Math.min(1, bug.health); // Capped at 1
								// Play audio
								sounds['bug-eaten'].play = true;
								sounds['bug-eaten'].audio.volume = bug.target.health; // Smaller sound for smaller bug
								// Remove current target
								bug.target.alive = false;
								bug.target = undefined;
								bug.at_target = false;
								// Find new target
								select_new_target = true;
							} else {
								// Test whether at target
								if (Math.sqrt((bug.x - bug.target.x)**2 + (bug.y - bug.target.y)**2) < leaf_radius/2) {
									bug.at_target = true;
								}
							}
						}
					}
					if (select_new_target) {
						bug.at_target = false;
						var candidate_targets = [];
						var j;
						for (j = 0; j < all_bugs.length; j++) {
							if (all_bugs[j].alive & !all_bugs[j].is_helper) {
								candidate_targets.push(all_bugs[j]);
							}
						}
						bug.target = random_sample(candidate_targets);
					}
				} else {
					// If not helper
					if (bug.target) {
						if (bug.at_target) {
							if (bug.target.parent.defense) {
								// If so, the bug dies
								bug.alive = false;
								// And the defense is used up
								bug.target.parent.defense -= 1;
							} else {
								// Eat target
								bug.target.health -= 0.01;
								bug.health = Math.min(1, bug.health + 0.01); // Only to satiety
								if (bug.target.health <= 0) {
									remove_leaf(bug.target); // This also makes other bugs not target the leaf
									// New target will be picked on the next update
									sounds['leaf-eaten'].play = true;
								}						
							}
						} else {
							// Test whether at_target
							if (Math.sqrt((bug.x - bug.target.x)**2 + (bug.y - bug.target.y)**2) < leaf_radius/2) {
								bug.at_target = true;
							}
						}
					} else {
						if (all_leaves.length > 0) {
							var target_leaf = random_sample(all_leaves);
							// var target_leaf = find_nearest(bug, all_leaves);
							bug.target = target_leaf;
							target_leaf.targeting_bugs.push(bug);
						}
					}
				}
			}
		}
	}
}

function update_bug_coords() {
	var i, bug;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		if (bug.at_target) {
			bug.x = bug.target.x;
			bug.y = bug.target.y;
		} else {
			bug.err += bug.err_rate*(0.5 - Math.random()); // Movement stochasticity
			var theta;
			if (bug.target) {
				// Move toward target
				theta = Math.atan2(bug.target.y - bug.y, bug.target.x - bug.x);
				theta += Math.sin(bug.err);
			} else {
				theta = bug.err;
			}
			bug.x += bug.speed*bug.health*Math.cos(theta);
			bug.y += bug.speed*bug.health*Math.sin(theta)
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
	// Remove from bugs targeting
	var bug;
	while (leaf.targeting_bugs.length > 0) {
		bug = leaf.targeting_bugs.pop();
		bug.target = undefined;
		bug.at_target = false;
	}
}

function add_bug(args) {
	if (args['at_cursor']) {
		x = mouse.x;// + cz_coords.x;
		y = mouse.y;// + cz_coords.y;
	} else {
		x = 0;
		y = -height_threshold;
	}
	var bug = {
		alive: true,
		x: x,
		y: y,
		is_helper: args['helper'],
		target: undefined,
		at_target: false,
		health: 1,
		min_health: Math.random()*0.5,
		err: 0,
		err_rate: 1 + 0.5*(0.5 - Math.random()),
		speed: bug_speed*(1 + 0.5*(0.5 - Math.random())) + (args['helper'] ? 0.4 : 0) // Helpers are a little faster
	}
	all_bugs.push(bug);
	if (!args['helper']) {
		sounds['bug-buzz'].play = true;
	}
}

function remove_bug(bug) {
	var del_idx = all_bugs.indexOf(bug);
	all_bugs.splice(del_idx, 1);
}

function draw_bugs() {
	reset_ctx();
	var i, bug, colour;
	for (i = 0; i < all_bugs.length; i++) {
		bug = all_bugs[i];
		bug_w = bug.health*(3 + 2*Math.random());
		bug_h = bug.health*(3 + 2*Math.random());
		if (bug.is_helper) {
			colour = colours.helper;
		} else {
			colour = colours.bug;
		}
		ctx.fillStyle = colour_to_rgba(colour, 0.5);
		ctx.fillRect(
			bug.x - bug_w/2 + cz_coords.x,
			bug.y - bug_h/2 + cz_coords.y,
			bug_w, bug_h);
	}
}

function draw_cursor() {
	reset_ctx();
	var x = mouse.x + cz_coords.x;
	var y = mouse.y + cz_coords.y;
	if (game_mode == 'default') {
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'helper') {
		ctx.strokeStyle = colour_to_rgba(colours.helper, 1);
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new node: select parent' || game_mode == 'new node: position') {
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'new leaf') {
		ctx.strokeStyle = colour_to_rgba(colours.leaf, 1);
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'strengthen') {
		ctx.strokeRect(x-2, y-2, 4, 4)
	} else if (game_mode == 'remove node') {
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.moveTo(x - 3, y - 3);
		ctx.lineTo(x + 3, y + 3);
		ctx.moveTo(x + 3, y - 3);
		ctx.lineTo(x - 3, y + 3);
		ctx.stroke();
	} else if (game_mode == 'drag view: unclicked') {
		ctx.beginPath();
		ctx.moveTo(x - 5, y);
		ctx.lineTo(x + 5, y);
		ctx.moveTo(x, y - 5);
		ctx.lineTo(x, y + 5);
		ctx.stroke();
	} else if (game_mode == 'drag view: clicked') {
		ctx.beginPath();
		ctx.moveTo(x - 8, y);
		ctx.lineTo(x + 8, y);
		ctx.moveTo(x, y - 8);
		ctx.lineTo(x, y + 8);
		ctx.stroke();
	} else if (game_mode == 'defense') {
		ctx.strokeStyle = colour_to_rgba(colours.defense, 1);
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.stroke();
	} else if (game_mode == 'flower') {
		ctx.fillStyle = colour_to_rgba(colours.flower, 1);
		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function can_add(parent, what) {
	if (what == 'node') {
		if (parent.depth == -1) {
			return (parent.children.length == 0)
		} else {
			return ((get_remaining_load(parent) > load_factors.node) & (plant_stats.energy > energy_costs.node));
		}
	}
	if (what == 'leaf') {
		return (
			(plant_stats.energy > energy_costs.leaf) &
			(get_remaining_load(parent) > load_factors.node) &
			parent.leaves.length < 6 - 2*(parent.weight - 1));
	} else if (what == 'defense') {
		return (parent.defense <= 0.1 & plant_stats.energy > energy_costs.defense);
	} else if (what == 'strength') {
		return (plant_stats.energy > energy_costs.weight)
	} else if (what == 'flower') {
		return (core.y - parent.y > height_threshold & parent.leaves.length == 0 & parent.children.length == 0 & plant_stats.energy > energy_costs.flower);
	}
}

function highlight_node(node, colour) {
	ctx.strokeStyle = colour;
	ctx.beginPath();
	ctx.arc(node.x + cz_coords.x, node.y + cz_coords.y, 5, 0, 2 * Math.PI);
	ctx.stroke();
}

function respond_to_cursor_position() {
	reset_ctx();
	if (game_mode == 'new node: select parent') {
		mode_persistents.selected_parent = find_nearest_node({including_core: true});
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (can_add(mode_persistents.selected_parent, 'node')) {
				highlight_node(mode_persistents.selected_parent, colour_to_rgba(colours.node, 1));
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'new node: position') {
		var parent = mode_persistents.selected_parent;
		var theta = Math.atan2(parent.y - mouse.y, mouse.x - parent.x);
		var length = Math.min(parent.length*0.9, Math.sqrt((mouse.y - parent.y)**2 + (mouse.x - parent.x)**2));
		mode_persistents.new_node = {
			theta: theta,
			length: length
		}
		var next_coords = get_next_coords(parent.x, parent.y, theta, length)
		ctx.strokeStyle = colour_to_rgba(colours.node, 1);
		ctx.beginPath();
		ctx.setLineDash([2, 2]);
		ctx.moveTo(parent.x + cz_coords.x, parent.y + cz_coords.y);
		ctx.lineTo(next_coords.x + cz_coords.x, next_coords.y + cz_coords.y);
		ctx.stroke();
	} else if (game_mode == 'new leaf') {
		mode_persistents.selected_parent = find_nearest_node({including_core: false});
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'leaf')) {
				highlight_node(mode_persistents.selected_parent, colour_to_rgba(colours.leaf, 1));
			} else if (held_keys['control']) {
				// Recursively adding leaves
				highlight_node(mode_persistents.selected_parent, colour_to_rgba(colours.leaf, 1));
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'strengthen') {
		mode_persistents.selected_parent = find_nearest_node({including_core: false});
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'strength')) {
				highlight_node(mode_persistents.selected_parent, 'black');
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'remove node') {
		mode_persistents.selected_parent = find_nearest_node({including_core: false});
		if (mode_persistents.selected_parent) {
			highlight_node(mode_persistents.selected_parent, 'red');
		}
	} else if (game_mode == 'drag view: clicked') {
		cz_coords.x = mode_persistents.gpx_initial.x + (mouse.screen_x - mode_persistents.first_click.x)
		cz_coords.y = mode_persistents.gpx_initial.y + (mouse.screen_y - mode_persistents.first_click.y)
	} else if (game_mode == 'defense') {
		mode_persistents.selected_parent = find_nearest_node({including_core: false});
		if (mode_persistents.selected_parent) { // If null, cursor is too far from any node
			if (can_add(mode_persistents.selected_parent, 'defense')) {
				highlight_node(mode_persistents.selected_parent, colour_to_rgba(colours.defense, 1));
			} else {
				mode_persistents.selected_parent = null;
			}
		}
	} else if (game_mode == 'flower') {
		mode_persistents.selected_parent = find_nearest_node({including_core: false});
		if (mode_persistents.selected_parent) {
			if (can_add(mode_persistents.selected_parent, 'flower')) {
				highlight_node(mode_persistents.selected_parent, colour_to_rgba(colours.flower, 1));
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
		// Start the timer if this is the first node
		if (!game_started) {
			start_time = performance.now();
			game_started = true;
		}
		add_node(
			mode_persistents.selected_parent, 
			mode_persistents.new_node.theta,
			mode_persistents.new_node.length);
		game_mode = 'new node: select parent';
		sounds['branch-grow'].play = true;
	} else if (game_mode == 'new leaf') {
		var selected_node = mode_persistents.selected_parent;
		if (selected_node) {
			if (held_keys['shift']) {
				add_max_leaves(selected_node, {recursive: false});
			} else if (held_keys['control']) {
				add_max_leaves(selected_node, {recursive: true});
			} else {
				add_leaf(selected_node);
			}
		}
	} else if (game_mode == 'strengthen') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.weight += 1;
			parent.length += 1;
			plant_stats.energy -= energy_costs.weight;
			sounds['branch-strengthen'].play = true;
		}
	} else if (game_mode == 'remove node') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			sounds['branch-break'].play = true;
			mark_for_removal(parent);
		}
	} else if (game_mode == 'drag view: clicked') {
		game_mode = 'drag view: unclicked';
	} else if (game_mode == 'defense') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.defense = 3;
			plant_stats.energy -= energy_costs.defense;
			sounds['defense-add'].play = true;
		}
	} else if (game_mode == 'helper') {
		if (plant_stats.energy > energy_costs.helper) {
			add_bug({helper: true, at_cursor: true});
			plant_stats.energy -= energy_costs.helper;
			// sounds['helper-add'].play = true;
		}
	} else if (game_mode == 'flower') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			flowering_node = parent;
			plant_stats.energy -= energy_costs.flower;
			update_info_div();
			sounds['flower'].play = true;
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

var held_keys = {shift: false, control: false};

var key_mode_mapping = {
	'l': 'new leaf',
	'n': 'new node: select parent',
	'v': 'drag view: unclicked',
	'h': 'helper',
	'd': 'defense',
	'r': 'remove node',
	's': 'strengthen',
	'f': 'flower',
	'escape': 'default'
}

function respond_to_keydown(e) {
	var key = e.key.toLowerCase();
	if (key == 'escape' & game_mode == 'new node: position') {
		// Special case: don't clear all persistents because we still want to know which node is highlighted
		switch_to_mode('new node: select parent', {clear_persistents: false});
		delete mode_persistents.new_node;
	} else if (key_mode_mapping[key]) {
		switch_to_mode(key_mode_mapping[key], {clear_persistents: true});
	} else if (key == 'shift' | key == 'control') {
		held_keys[key] = true;
	} else if (key == 'z') {
		toggle_zen_mode();
	}
}

function switch_to_mode(new_mode, args) {
	args = args || {}
	if (args['clear_persistents'] || false) {
		mode_persistents = {};
	}
	game_mode = new_mode;
	highlight_current_mode();
}

function highlight_current_mode() {
	var controls = document.getElementById('controls');
	var i, span;
	for (i = 0; i < controls.children.length; i++) {
		span = controls.children[i];
		if (('mode-control: ' + game_mode).includes(span.id)) {
			highlight_span(span, 'on');
		} else {
			highlight_span(span, 'off');
		}
	}
}

function respond_to_keyup(e) {
	var key = e.key.toLowerCase();
	if (key == 'shift' | key == 'control') {
		held_keys[key] = false;
	}
}

var event_response_mapping = {
	'mousedown': respond_to_mousedown,
	'touchstart': respond_to_mousedown,
	'mouseup': respond_to_mouseup,
	'touchup': respond_to_mouseup,
	'keydown': respond_to_keydown,
	'keyup': respond_to_keyup
}

function record_event(e) {
	var recorded_info;
	if (e.type.substring(0, 3) == 'key') {
		// Record key identity
		recorded_info = e;
	} else {
		// Record coordinates
		recorded_info = {
			x: e.clientX - viewport.offsetLeft,
			y: e.clientY - viewport.offsetTop
		}
	}
	event_records[e.type] = [recorded_info];
}

function respond_to_interaction() {
	for (event_name in event_response_mapping) {
		var most_recent = event_records[event_name].pop();
		if (most_recent) {
			event_response_mapping[event_name](most_recent);
		}
	}
}

function accumulate_energy() {
	var i;
	for (i = 0; i < all_leaves.length; i++) {
		plant_stats.energy += 0.005*all_leaves[i].maturity;
		// plant_stats.energy += 0.005*all_nodes[i].leaves.length;
	}
}

function update_info_div() {
	// Show elapsed time
	var elapsed_ms = game_started ? performance.now() - start_time : 0;
	var parsed_ms = parse_milliseconds(elapsed_ms);
	document.getElementById('elapsed-time').innerText = parsed_ms['mins'] + 'm ' + parsed_ms['secs'] + 's';
	// Show current energy
	document.getElementById('energy').innerText = plant_stats.energy.toFixed(2);
	// Gray out unavailable items
	var costs = document.getElementById('costs');
	var i, span, item;
	for (i = 0; i < costs.children.length; i++) {
		span = costs.children[i];
		if (span.id.includes('energy-costs')) {
			item = span.id.split(':')[1];
			if (plant_stats.energy > energy_costs[item]) {
				span.style.color = 'black';
			} else {
				span.style.color = 'lightgray';
			}
		}
	}
}

function parse_milliseconds(ms) {
	var mins = Math.floor(ms/1000/60);
	var secs = Math.floor(ms/1000 - mins*60);
	return {
		mins: mins,
		secs: secs
	}
}

var bug_rate;
function bug_proliferation() {
	bug_rate = 1 - (1 / (1 + 0.0003 * all_leaves.length));
	// bug_rate = 1;
	if (Math.random() < bug_rate) {
		add_bug({helper: false});
	}
}

function update_stats() {
	// Update data
	var n_nonhelper_bugs = 0;
	var i;
	for (i = 0; i < all_bugs.length; i++) {
		if (!all_bugs[i].is_helper) {
			n_nonhelper_bugs++;
		}
	}

	stats['n_bugs'].data.push(n_nonhelper_bugs);
	stats['n_leaves'].data.push(all_leaves.length);
	stats['energy'].data.push(plant_stats.energy);
	// Update max and min
	var k, last;
	for (k in stats) {
		last = stats[k].data[stats[k].data.length - 1];
		if (last > stats[k].max) {
			stats[k].max = last;
		}
		if (last < stats[k].min) {
			stats[k].min = last;
		}
	}
}

function draw_stats() {
	var stat = stats[curr_plotting_stat];

	stats_ctx.clearRect(0, 0, stats_canv.width, stats_canv.height);

	// Set axes
	var ylim = [stat.min - 1, stat.max + 1];
	var yrange = ylim[1] - ylim[0];
	var xlim = [-1, stat.data.length];
	var xrange = xlim[1] - xlim[0];
	
	stats_ctx.beginPath();
	var i, xcoord, ycoord;
	// Draw first point
	i = 0;
	xcoord = stats_canv.width * (i - xlim[0]) / xrange;
	ycoord = stats_canv.height * (1 - (stat.data[i] - ylim[0]) / yrange);
	stats_ctx.moveTo(xcoord, ycoord);
	// Draw remaining points
	for (i = 1; i < stat.data.length; i++) {
		xcoord = stats_canv.width * (i - xlim[0]) / xrange;
		ycoord = stats_canv.height * (1 - (stat.data[i] - ylim[0]) / yrange);
		stats_ctx.lineTo(xcoord, ycoord);
	}
	stats_ctx.stroke();
}

var core = {
	x: 0,
	y: 0,
	children: [],
	depth: -1,
	length: max_segment_length,
	theta: {abs: Math.PI/2}
};

function draw_height_threshold() {
	reset_ctx();
	ctx.beginPath();
	ctx.setLineDash([2, 2]);
	ctx.moveTo(-20 + cz_coords.x, -height_threshold + cz_coords.y);
	ctx.lineTo(20 + cz_coords.x, -height_threshold + cz_coords.y);
	ctx.stroke();
	ctx.textBaseline = 'middle';
	ctx.textAlign = 'left';
	ctx.font = '12px Courier';
	ctx.fillText('(flowering height)', 22 + cz_coords.x, -height_threshold + cz_coords.y)
}

function lose_cond() {
	var all_instructions = document.getElementById('all-instructions');
	all_instructions.innerHTML = '<h2>Game over!</h2>' + 
		'<p>Right now you have no leaves and no energy to grow any, and the only way you can get energy is by growing leaves</p>' +
		'<p>Reload the page to try again.</p>'
}

function win_cond() {
	// Remove all bugs
	all_bugs = [];
	// Add win note
	var all_instructions = document.getElementById('all-instructions');
	all_instructions.innerHTML = '<h2>Win!</h2>' + 
		'<p>Time: ' + document.getElementById('elapsed-time').innerText + ' s</p>' +
		'<p>Reload page to play again</p>'
}

// Main game loop
var game_started = false; // Begins when first node built
var start_time; // Global placeholder
var game_ended = false;
var loop_count = 0;
var update_and_draw_stats = loop_count % 10 == 0;
function main_loop() {
	loop_count++;
	if (!game_ended) {
		if (flowering_node) {
			win_cond();
			game_ended = true;
		} else if (all_leaves.length == 0 & plant_stats.energy < energy_costs.leaf) {
			lose_cond();
			game_ended = true;
		}
	}

	if (!game_ended) {
		accumulate_energy();
		bug_proliferation();
		if (update_and_draw_stats) {
			update_stats();
		}
	}
	// Pre-graphics stuff
	update_node_coords();
	compute_node_movement();
	remove_nodes();
	update_leaves();
	update_leaf_coords();
	update_bug_states();
	remove_dead_bugs();
	update_bug_coords();
	// Graphics
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_height_threshold();
	draw_cursor();
	draw_nodes();
	draw_leaves();
	draw_bugs();
	if (flowering_node) {
		flower_rotation += 0.1;
		draw_flower();
	} else {
		update_info_div();
	}
	if (update_and_draw_stats) {
		draw_stats();
	}
	// Audio
	play_sounds();
	// Response to user input
	respond_to_cursor_position();
	respond_to_interaction();
	// Schedule next loop iteration
	setTimeout(main_loop, 16.6*2);
};

function respond_to_mousemove(e) {
	mouse.screen_x = e.clientX - viewport.offsetLeft;
	mouse.screen_y = e.clientY - viewport.offsetTop;
	if (game_mode != 'drag view: clicked') {
		// If dragging world, the mouse isn't moving relative to the world
		mouse.x = mouse.screen_x - cz_coords.x;
		mouse.y = mouse.screen_y - cz_coords.y;
	}
}

function start_game() {
	document.getElementById('start-screen').style.display = 'none';
	document.getElementById('stats-credits').style.visibility = '';
	document.getElementById('viewport').style.visibility = '';
	document.getElementById('info').style.visibility = '';

	// Start event listeners
	document.onmousemove = respond_to_mousemove;
	document.addEventListener('touchmove', function(e) {console.log(e); respond_to_mousemove(e)}, false);
	
	for (event_type in event_records) {
		document['on' + event_type] = record_event;
	}

	// Start background ambient audio
	sounds['background'].audio.loop = true;
	sounds['background'].audio.volume = 0.1;
	sounds['background'].audio.play();

	// Start game
	main_loop();
}

var zen_mode = false;
function toggle_zen_mode() {
	if (zen_mode) {
		zen_mode = false;
		document.getElementById('stats-credits').style.visibility = 'visible';
		document.getElementById('info').style.visibility = 'visible';
	} else {
		zen_mode = true;
		document.getElementById('stats-credits').style.visibility = 'hidden';
		document.getElementById('info').style.visibility = 'hidden';
	}
}