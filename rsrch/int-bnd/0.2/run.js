
// Screen parameters
var viewport = document.getElementById('viewport');
var screen = {
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
var middle_x = screen.w/2;
var middle_y = screen.h/2;

function clear_screen() {
	ctx.clearRect(0, 0, canv.width, canv.height);
	ctx.rect(0, 0, canv.width, canv.height);
	ctx.fillStyle = 'white';
	ctx.fill();
}

// Clock object
var clock = {
	diameter: 0.5*min_dim,
	radius: 0.5*min_dim/2,
	theta: 0,
	update_theta: function(delta_theta) {
		clock.theta = clock.theta + delta_theta;
		clock.theta = clock.theta % (Math.PI * 2);
	},
	draw_face: function() {
		ctx.fillStyle = 'black';
		ctx.strokeStyle = 'black';
		// Circle
		ctx.beginPath();
		ctx.arc(middle_x, middle_y, clock.radius, 0, 2 * Math.PI);
		ctx.stroke();
		// Tick marks and numbers
		var tick_len = 2/30*clock.diameter;
		var i, tick_theta;
		for (i = 5; i <= 60; i += 5) {
			tick_theta = Math.PI/2 - 2*Math.PI*i/60;
			// Tick marks
			ctx.beginPath();
			ctx.moveTo(
				middle_x + clock.radius*Math.cos(tick_theta),
				middle_y - clock.radius*Math.sin(tick_theta)
			);
			ctx.lineTo(
				middle_x + (clock.radius + tick_len)*Math.cos(tick_theta),
				middle_y - (clock.radius + tick_len)*Math.sin(tick_theta)
			);
			ctx.stroke();
			// Numbers
			ctx.font = "5mm Arial";
			ctx.fillText(
				i,
				middle_x + (clock.radius + 2*tick_len)*Math.cos(tick_theta),
				middle_y - (clock.radius + 2*tick_len)*Math.sin(tick_theta)
			);
		}
	},
	fix_col: 'black',
	draw_fix: function() {
		var prior_ss = ctx.strokeStyle;
		ctx.strokeStyle = clock.fix_col;
		var fix_len = 2/30*clock.diameter/2;
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
		ctx.strokeStyle = prior_ss;
	},
	hand_col: 'black',
	draw_hand: function() {
		var hand_len = 11/30*clock.diameter;
		var prior_ss = ctx.strokeStyle;
		ctx.strokeStyle = clock.hand_col;
		ctx.beginPath();
		ctx.moveTo(middle_x, middle_y);
		ctx.lineTo(
			middle_x + hand_len*Math.cos(clock.theta),
			middle_y - hand_len*Math.sin(clock.theta)
		);
		ctx.stroke();
		ctx.strokeStyle = prior_ss;
	},
	period: 2560,
	stop: false,
	last_t: null,
	raf_id: null, // requestAnimationFrame ID
	animate: function() {
		timestamp = performance.now();
		if (clock.stop) {
			// stop animation
			window.cancelAnimationFrame(clock.raf_id);
			// draw empty face
			clear_screen();
			clock.draw_face();
			clock.draw_fix();
			// reset
			clock.stop = false;
			clock.last_t = null;
			clock.raf_id = null;
		} else {
			clock.raf_id = window.requestAnimationFrame(clock.animate);
			if (clock.last_t == null) {
				// first call
				clock.last_t = timestamp;
			} else {
				// compute elapsed time and update theta
				var elapsed_ms = timestamp - clock.last_t;
				clock.last_t = timestamp;
				var delta_theta = elapsed_ms / clock.period * Math.PI * 2;
				clock.update_theta(-delta_theta);
			}
			// draw stimuli
			clear_screen();
			clock.draw_face();
			clock.draw_fix();
			clock.draw_hand();
		}
	}
}

var rotator = {
	left: false,
	right: false,
	last_key: null,
	update_keys: function(e, is_down) {
		var curr_lr, other_lr;
		if (e.key == 'ArrowLeft') {
			curr_lr = 'left';
			other_lr = 'right';
		} else if (e.key == 'ArrowRight') {
			curr_lr = 'right';
			other_lr = 'left';
		} else if (e.key == 'Enter') {
			rotator.stop = true;
		}
		if (curr_lr) {
			if (is_down) {
				rotator[curr_lr] = true;
				rotator.last_key = curr_lr;
			} else {
				rotator[curr_lr] = false;
				if (rotator[other_lr]) {
					rotator.last_key = other_lr;
				} else {
					rotator.last_key = null;
				}
			}
		}
	},
	stop: false,
	raf_id: null,
	update_clock: function() {
		if (rotator.stop) {
			// cancel self
			window.cancelAnimationFrame(rotator.raf_id);
			// reset
			rotator.stop = false;
			rotator.raf_id = null;
			// start a new trial
			ctrl_fcn('end');
		} else {
			// update hand
			window.requestAnimationFrame(rotator.update_clock);
			var fac = 0;
			if (rotator.last_key == 'left') {
				fac = 1;
			} else if (rotator.last_key == 'right') {
				fac = -1;
			}
			var delta_theta = fac * 2*Math.PI/500;
			clock.update_theta(delta_theta);
			// draw clock
			clear_screen();
			clock.draw_face();
			clock.draw_fix();
			clock.draw_hand();
		}
	}
}

// Audio stuff
var tone = new Audio('tone.mp3');
play_tone = tone.play;

var trial_params = {
	press: true,
	tone: true
};

var trial_data = {
	response_theta: null,
	tone_theta: null
}

function ctrl_fcn(ctrl) {
	// this is the big control flow function. depending
	// on the value of ctrl, it initiates different parts
	// of the experiment
	if (ctrl == 'start') { // begin a new trial
		// draw initial yellow cross
		clear_screen();
		clock.fix_col = 'yellow';
		clock.draw_face();
		clock.draw_fix();
		// wait 400 ms, then start rotating the clock hand
		clock.theta = Math.random()*Math.PI*2;
		setTimeout(function() {
			// set onkeydown callback to schedule tone play
			window.onkeydown = function(e) {
				// record clock hand angle of response
				trial_data.response_theta = clock.theta;
				window.onkeydown = null;
				ctrl_fcn('tone');
			}
			// begin rotating the clock hand
			clock.fix_col = 'black';
			clock.hand_col = 'black';
			window.requestAnimationFrame(clock.animate);
		}, 400);
	} else if (ctrl == 'tone') { // play the tone
		// schedule tone
		setTimeout(function() {
			play_tone.call(tone);
			// record cock hand angle of audio
			trial_data.tone_theta = clock.theta;
			// schedule end of clock rotation
			setTimeout(function() {
				clock.stop = true;
				// schedule beginning of estimation
				setTimeout(function() {
					ctrl_fcn('estimate');
				}, 1000)
			}, 1000);
		}, 250);
	} else if (ctrl == 'estimate') { // estimate the time of the tone
		// pass control to the rotator object
		document.onkeydown = function(e) {
			rotator.update_keys(e, true);
		};
		document.onkeyup = function(e) {
			rotator.update_keys(e, false);
		};
		clock.theta = trial_data.tone_theta;
		clock.hand_col = 'green';
		rotator.update_clock();
	} else if (ctrl == 'end') {
		document.onkeyup = null;
		document.onkeydown = null;
		ctrl_fcn('start');
	}
}

ctrl_fcn('start');