
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

var events = {
	mousedown: [],
	mouseup: [],
	keydown: [],
	keyup: []
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
var max_segment_length = 50;
var height_threshold = 7*max_segment_length;
var game_mode = 'default';
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
		health: 1,
		targeting_bugs: []
	};
	parent.leaves.push(new_leaf);
	all_leaves.push(new_leaf)
	plant_stats.energy -= energy_costs.leaf;
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
	energy: 35
	// energy: Infinity
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
		colour = [
			leaf.health*colours.leaf[0] + (1 - leaf.health)*255,
			leaf.health*colours.leaf[1] + (1 - leaf.health)*150,
			leaf.health*colours.leaf[2] + (1 - leaf.health)*0 
		];
		ctx.fillStyle = colour_to_rgba(colour, 0.5 - 0.5*(1 - leaf.health)**6);
		ctx.beginPath();
		ctx.ellipse(leaf.x + cz_coords.x, leaf.y + cz_coords.y, leaf_radius, stem_radius, -leaf.visual_theta, 0, 2*Math.PI);
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
			// Get a little hungrier and possibly die
			bug.health -= 0.001;
			if (Math.random() < (1 - bug.health)**8) {
				bug.alive = false;
			} else {
				// If still alive, behave
				if (bug.target) {
					if (bug.at_target) {
						if (bug.is_helper) {
							if (bug.target.alive) {
								// Eat target bug
								bug.health += bug.target.health; // Smaller bugs provide less nourishment
								bug.health = Math.min(1, bug.health); // Capped at 1
								bug.target.alive = false;
								bug.target = undefined;
								// Find new target on next update
								bug.at_target = false;
							} else {
								bug.at_target = false;
								bug.target = undefined;
							}
						} else {
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
									remove_leaf(bug.target);
									// New target will be picked on the next update
								}						
							}
						}
					} else {
						// Test whether at_target
						if (Math.sqrt((bug.x - bug.target.x)**2 + (bug.y - bug.target.y)**2) < leaf_radius/2) {
							bug.at_target = true;
						}
					}
				} else {
					// Select target
					bug.at_target = false;
					if (bug.is_helper) {
						var candidate_target_idxs = [];
						var j;
						for (j = 0; j < all_bugs.length; j++) {
							if (all_bugs[j].alive & !all_bugs[j].is_helper) {
								candidate_target_idxs.push(j);
							}
						}
						// var target_idx = candidate_target_idxs[Math.floor(Math.random()*candidate_target_idxs.length)];
						var target_idx = random_sample(candidate_target_idxs);
						bug.target = all_bugs[target_idx];
					} else {
						if (all_leaves.length > 0) {
							var target_leaf = all_leaves[Math.floor(Math.random()*all_leaves.length)];
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
			// On leaf
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
		err: 0,
		err_rate: 1 + 0.5*(0.5 - Math.random()),
		speed: bug_speed*(1 + 0.5*(0.5 - Math.random())) + (args['helper'] ? 0.2 : 0) // Helpers are a little faster
	}
	all_bugs.push(bug);
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
		}
	} else if (game_mode == 'remove node') {
		var parent = mode_persistents.selected_parent;
		mark_for_removal(parent);
	} else if (game_mode == 'drag view: clicked') {
		game_mode = 'drag view: unclicked';
	} else if (game_mode == 'defense') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			parent.defense = 3;
			plant_stats.energy -= energy_costs.defense;
		}
	} else if (game_mode == 'helper') {
		if (plant_stats.energy > energy_costs.helper) {
			add_bug({helper: true, at_cursor: true});
			plant_stats.energy -= energy_costs.helper;
		}
	} else if (game_mode == 'flower') {
		var parent = mode_persistents.selected_parent;
		if (parent) {
			flowering_node = parent;
			plant_stats.energy -= energy_costs.flower;
			update_info_div();
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

function respond_to_keydown(e) {
	var key = e.key.toLowerCase();
	if (key == 'l') {
		mode_persistents = {};
		game_mode = 'new leaf';
	} else if (key == 'n') {
		mode_persistents = {};
		game_mode = 'new node: select parent';
	} else if (key == 'v') {
		mode_persistents = {};
		game_mode = 'drag view: unclicked';
	} else if (key == 'h') {
		mode_persistents = {};
		game_mode = 'helper';
	} else if (key == 'd') {
		mode_persistents = {};
		game_mode = 'defense';
	} else if (key == 'r') {
		mode_persistents = {};
		game_mode = 'remove node';
	} else if (key == 's') {
		mode_persistents = {};
		game_mode = 'strengthen';
	} else if (key == 'f') {
		mode_persistents = {};
		game_mode = 'flower';
	} else if (key == 'escape') {
		if (game_mode == 'new node: position') {
			delete mode_persistents.new_node;
			game_mode = 'new node: select parent';
		} else {
			mode_persistents = {};
			game_mode = 'default';
		}
	} else if (key == 'shift' | key == 'control') {
		held_keys[key] = true;
	}
	colour_instructions();
}

function colour_instructions() {
	var controls = document.getElementById('controls');
	var i, span;
	for (i = 0; i < controls.children.length; i++) {
		span = controls.children[i];
		if (('mode-control: ' + game_mode).includes(span.id)) {
			span.style.color = 'white';
			span.style.backgroundColor = 'black';
		} else {
			span.style.color = 'black';
			span.style.backgroundColor = 'white';
		}
	}
}

function respond_to_keyup(e) {
	var key = e.key.toLowerCase();
	if (key == 'shift' | key == 'control') {
		held_keys[key] = false;
	}
}

function accumulate_energy() {
	var i;
	for (i = 0; i < all_nodes.length; i++) {
		plant_stats.energy += 0.005*all_nodes[i].leaves.length;
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
			if (plant_stats.energy >= energy_costs[item]) {
				span.style.color = 'black';
			} else {
				span.style.color = 'gray';
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
		'<p>You need energy to grow leaves, and you need leaves to get energy.</p>' +
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
function main_loop() {
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
	}
	// Pre-graphics stuff
	update_node_coords();
	compute_node_movement();
	remove_nodes();
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
	// Response to user input
	respond_to_cursor_position();
	var event_names = ['mousedown', 'mouseup', 'keydown', 'keyup'];
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

function start_game() {
	document.onmousemove = function(e) {
		mouse.screen_x = e.clientX - viewport.offsetLeft;
		mouse.screen_y = e.clientY - viewport.offsetTop;
		if (game_mode != 'drag view: clicked') {
			// If dragging world, the mouse isn't moving relative to the world
			mouse.x = mouse.screen_x - cz_coords.x;
			mouse.y = mouse.screen_y - cz_coords.y;
		}
	};

	document.onmouseup = function(e) {
		events.mouseup = [{
			x: e.clientX - viewport.offsetLeft,
			y: e.clientY - viewport.offsetTop
		}];
	}

	document.onmousedown = function(e) {
		events.mousedown = [{
			x: e.clientX - viewport.offsetLeft,
			y: e.clientY - viewport.offsetTop
		}];
	}

	document.onkeydown = function(e) {
		events.keydown = [e];
	}

	document.onkeyup = function(e) {
		events.keyup = [e];
	}

	main_loop();
}

start_game();