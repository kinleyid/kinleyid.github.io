
// Screen parameters
var viewport = document.getElementById('viewport');
screen = {
	h: viewport.clientHeight,
	w: viewport.clientWidth
}
var canv = document.getElementById('canv');
canv.height = screen.h;
canv.width = screen.w;
var ctx = canv.getContext('2d');
ctx.textBaseline = "middle";
ctx.textAlign = "center";
var min_dim = Math.min(screen.h, screen.w);

function clear_screen() {
	ctx.clearRect(0, 0, canv.width, canv.height);
	ctx.rect(0, 0, canv.width, canv.height);
	ctx.fillStyle = 'gray';
	ctx.fill();
}

// Clock parameters
var clock_diam = 0.5*min_dim; // 30 mm in original
var clock_rad = clock_diam/2;
var middle_x = screen.w/2;
var middle_y = screen.h/2;

// Drawing clock
function draw_clock() {
	ctx.fillStyle = 'black';
	ctx.strokeStyle = 'black';
	// Circle
	ctx.beginPath();
	ctx.arc(middle_x, middle_y, clock_rad, 0, 2 * Math.PI);
	ctx.stroke();
	// Tick marks and numbers
	var tick_len = 2/30*clock_diam;
	var i, theta;
	for (i = 5; i <= 60; i += 5) {
		theta = Math.PI/2 - 2*Math.PI*i/60;
		// Tick marks
		ctx.beginPath();
		ctx.moveTo(
			middle_x + clock_rad*Math.cos(theta),
			middle_y - clock_rad*Math.sin(theta)
		);
		ctx.lineTo(
			middle_x + (clock_rad + tick_len)*Math.cos(theta),
			middle_y - (clock_rad + tick_len)*Math.sin(theta)
		);
		ctx.stroke();
		// Numbers
		ctx.font = "5mm Arial";
		ctx.fillText(
			i,
			middle_x + (clock_rad + 2*tick_len)*Math.cos(theta),
			middle_y - (clock_rad + 2*tick_len)*Math.sin(theta)
		);
	}
}

// Drawing hand
hand_len = 11/30*clock_diam;
function draw_hand(theta) {
	ctx.beginPath();
	ctx.moveTo(middle_x, middle_y);
	ctx.lineTo(
		middle_x + hand_len*Math.cos(theta),
		middle_y - hand_len*Math.sin(theta)
	);
	ctx.stroke();
}

// Fixation cross
fix_len = 2/30*clock_diam/2;
function draw_fix() {
	var x = [1, 0, -1, 0];
	var y = [0, 1, 0, -1];
	var i;
	for (i = 0; i < 4; i++) {
		ctx.beginPath();
		ctx.moveTo(middle_x, middle_y);
		ctx.lineTo(
			middle_x + x[i]*fix_len,
			middle_y + y[i]*fix_len
		);
		ctx.stroke();
	}
}

// Rotating the hand
var rotation_params = {
	period: 2560, // ms
	last_timestamp: null,
	last_theta: null,
	crit_ev: Infinity
};

function rotate_hand_auto(timestamp) {
	if (rotation_params.last_timestamp == null) { // First time the function is run
		rotation_params.last_timestamp = timestamp;
	} else {
		// Compute clock rotation
		var elapsed_ms = timestamp - rotation_params.last_timestamp;
		dtheta = elapsed_ms / rotation_params.period * Math.PI * 2;
		new_theta = rotation_params.last_theta - dtheta;
		if (new_theta > Math.PI * 2) {
			new_theta = new_theta - Math.PI * 2;
		}
		// Draw stimuli
		clear_screen();
		draw_clock();
		draw_fix();
		draw_hand(new_theta);
		rotation_params.last_timestamp = timestamp;
		rotation_params.last_theta = new_theta;
	}
	if ((timestamp - rotation_params.crit_ev) >= 1000) {
		// End trial
		clear_screen();
		draw_clock()
		// Wait 1 s, then allow manual rotation
		setTimeout(function() {
			// Reset keys
			hand_theta = 0;
			keys_down = {
				l: false,
				r: false,
				e: false,
				latest: null // Most recent key to be pressed, if applicable
			};
			document.onkeydown = function(e) {
				update_keys(e, true)
			};
			document.onkeyup = function(e) {
				update_keys(e, false)
			};
			rotate_hand_manual();
		}, 1000);
	} else {
		// Keep rotating
		window.requestAnimationFrame(rotate_hand_auto);
	}
}

// Manually moving the hand

var keys_down = {
	l: false,
	r: false,
	e: false,
	latest: null // Most recent key to be pressed, if applicable
};

function update_keys(e, is_down) {
	if (e.key == 'ArrowLeft') {
		keys_down.l = is_down;
	} else if (e.key == 'ArrowRight') {
		keys_down.r = is_down;
	} else if (e.key == 'Enter') {
		keys_down.e = true;
	}
	if (is_down) {
		keys_down.latest = e.key;
	} else {
		keys_down.latest = null;
	}
}

var hand_theta = 0;
function rotate_hand_manual() {
	// Work out which direction key press is in
	dir = null;
	if (keys_down.l & keys_down.r) {
		if (keys_down.latest == 'ArrowLeft') {
			dir = 'left';
		} else if (keys_down.latest == 'ArrowRight') {
			dir = 'right';
		}
	} else {
		if (keys_down.l) {
			dir = 'left';
		} else if (keys_down.r) {
			dir = 'right';
		}
	}
	// Rotate hand, if applicable
	if (dir != null) {
		if (dir == 'left') {
			fac = 1;
		} else {
			fac = -1;
		}
		var dtheta = fac * 2*Math.PI/500;
		hand_theta = hand_theta + dtheta;
	}
	clear_screen();
	draw_clock();
	draw_fix();
	ctx.strokeStyle = 'green';
	draw_hand(hand_theta);
	if (keys_down.e) {
		window.onkeydown = null;
		window.onkeyup = null;
		tone_trial();
	} else {
		window.requestAnimationFrame(rotate_hand_manual);
	}
}

// Audio stuff
var tone = new Audio('tone.mp3');
play_tone = tone.play;

clear_screen();
draw_clock();
// setTimeout(rotate_hand_manual, 1000);

var trial_params = {
	press: true,
	tone: true
};

var trial_data = [];

// Run a trial with the tone thing
function tone_trial() {
	// Draw initial yellow cross
	clear_screen();
	draw_clock();
	ctx.strokeStyle = 'yellow';
	draw_fix();
	// Wait 400 ms, then start rotating the clock hand
	rotation_params.last_theta = Math.random()*Math.PI*2;
	rotation_params.crit_ev = Infinity;
	setTimeout(function() {
		// Set key down callback to schedule tone play
		window.onkeydown = function(e) {
			// Schedule tone
			tone_delay = 250;
			setTimeout(function() {
				play_tone.call(tone)
			}, tone_delay);
			// Setting crit_ev will stop the clock hand auto-rotating
			rotation_params.crit_ev = e.timeStamp + tone_delay;
			// Remove onkeydown function
			window.onkeydown = null;
		}
		// Begin rotating the clock hand
		window.requestAnimationFrame(rotate_hand_auto);
	}, 400);
}

setTimeout(tone_trial, 2000);
