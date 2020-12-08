
var timeline = [];

var fullscreen = {
	type: 'fullscreen',
	fullscreen_mode: true
}
timeline.push(fullscreen);

//***************INT BIND TASK

// Template for all instructions trials
function instructions(pages) {
	this.pages = pages;
	this.type = 'instructions';
	this.show_clickable_nav = true;
	this.post_trial_gap = 1000;
}

// Initial instructions
timeline.push(new instructions(['You will complete 4 blocks of this experiment. New instructions will pop-up at the start of each block. CAREFULLY READ THE INSTRUCTIONS, AS THEY CHANGE SLIGHTLY IN IMPORTANT WAYS. Failing to do so may lead to your data being unusable for this experiment.']))

// Template for all intentional binding trials
var error_type = 'none';
function int_bind_trial(cfg) {
	for (a in cfg) {
		this[a] = cfg[a];
	}
	this.type = 'int-bind';
	this.tone_file = './tone.mp3';
	this.hand_est = true;
	this.on_start = function() {
		error_type = 'none';
	};
	this.on_finish = function(data) {
		if (data.early) {
			error_type = 'early';
		} else if (data.timeout) {
			error_type = 'late';
		}
	}
}
// Conditional trial for if the participant responds too early
var too_early = {
	timeline: [new instructions([
		'Too early!',
		'Please wait at least one full rotation to make a response.'
	])],
	conditional_function: function(){
		return (error_type == 'early');
    }
};
// Conditional trial for if the participant doesn't respond in time
var too_late = {
	timeline: [new instructions([
		'Too late!',
		'Please make a response within 4 seconds.'
	])],
	conditional_function: function(){
        return (error_type == 'late');
    }
};
// Instructions for each trial type
var n_practice = 5,
	n_trials = 40;
var postamble = 'You will begin with ' + n_practice + ' practice trials.';
var instruction_txt = {
	baseline: {
		tone: [
			'In this part of the experiment, you will be tasked with watching a clock hand rotate.',
			'At some point, an auditory tone will play.',
			'You will then be prompted to estimate where the clock hand was pointing to at the time of the <b>tone</b>.',
			postamble
		],
		key: [
			'In this part of the experiment, you will be tasked with watching a clock hand rotate.',
			'Your job is to press the spacebar with your RIGHT index finger at some point in time.',
			'However, wait for at least one full clock rotation to press the spacebar.',
			'Do not press the spacebar at a pre-decided and/or stereotypical time points.',
			'After pressing the spacebar, you will be prompted to estimate where the clock hand was pointing to at the time of the <b>keypress</b>.',
			postamble
		]
	},
	operant: {
		tone: [
			'In this part of the experiment, you will be tasked with watching a clock hand rotate.',
			'Your job is to press the spacebar with your RIGHT index finger at some point in time.',
			'However, wait for at least one full clock rotation to press the spacebar.',
			'Do not press the spacebar at a pre-decided and/or stereotypical time points.',
			'After pressing the spacebar, an auditory tone will play.',
			'You will be prompted to estimate where the clock hand was pointing to at the time of the <b>tone</b>.',
			'Once in a while, you will also be asked to rate how much control you feel over your actions.',
			postamble
		],
		key: [
			'In this part of the experiment, you will be tasked with watching a clock hand rotate.',
			'Your job is to press the spacebar with your RIGHT index finger at some point in time.',
			'However, wait for at least one full clock rotation to press the spacebar.',
			'Do not press the spacebar at a pre-decided and/or stereotypical time points.',
			'After pressing the spacebar, an auditory tone will play.',
			'You will be prompted to estimate where the clock hand was pointing to at the time of the <b>keypress</b>.',
			'Once in a while, you will also be asked to rate how much control you feel over your actions.',
			postamble
		]
	}
};
// Estimation prompts for each trial type
var prompt_txt = {
	preamble: 'Where was the hand when',
	postamble: '(arrow keys to move, enter to confirm)',
	key: 'pressed space',
	tone: 'heard the tone'
};
// Determine the order of trials
// Ensure each combination is represented
var conds = {
	i: ['operant', 'baseline'],
	j: ['tone', 'key']
};
var all_conds = [];
var i, j;
for (i = 0; i < conds.i.length; i++) {
	for (j = 0; j < conds.j.length; j++) {
		all_conds.push({
			i: conds.i[i],
			j: conds.j[j]
		});
	}
}
// Randomize
// all_conds = jsPsych.randomization.repeat(all_conds, 1);
// Judgement of agency
function joa() {
	this.type = 'survey-likert';
	this.questions = [
		{
			prompt: 'On a scale of 1–10, to what extent do you feel like you caused the tone? (please click on the number that best represents your answer)',
			name: 'JoA',
			labels: ['0<br><br>Not at all', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br><br>Fully']
		}
	];
	this.post_trial_gap = 500;
}
// Functions to hide cursor and bring it back
var no_mouse = {
	type: 'call-function',
	func: function(){ 
		document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="cursor-toggle"> html { cursor: none; } </style>'); 
	}
};
var yes_mouse = {
	type: 'call-function',
	func: function(){ 
		document.querySelector('head').insertAdjacentHTML('beforeend', '<style id="cursor-toggle"> html { cursor: default; } </style>'); 
	}
};
// Generate trial structures
var min_tone_ms = 2500,
	max_tone_ms = 8000;
var i;
for (i = 0; i < all_conds.length; i++) {
	curr_cond = all_conds[i];
	// Generate instructions
	timeline.push(new instructions(instruction_txt[curr_cond.i][curr_cond.j]));
	// Hide mouse
	timeline.push(no_mouse);
	// Generate actual trial
	cfg = {
		cond_bo: curr_cond.i,
		cond_kt: curr_cond.j,
		early_ms: 2560,
		timeout_ms: false,
		tone_delay_ms: 250,
		spin_continue_ms: function() {
			return(jsPsych.randomization.sampleWithReplacement([1000, 1500, 2000], 1)[0])
		}
	};
	if (curr_cond.i == 'baseline') {
		if (curr_cond.j == 'key') {
			cfg.tone = false;
		} else {
			cfg.key_press = false;
			cfg.tone_delay_ms = function() {
				return(Math.round(min_tone_ms + Math.random()*(max_tone_ms - min_tone_ms)))
			}
			cfg.early_ms = false;
		}
	}
	curr_prompt = prompt_txt.preamble +
		' you ' +
		prompt_txt[curr_cond.j] +
		'? ' +
		prompt_txt.postamble;
	cfg.instructions = curr_prompt;
	// First, the practice blocks
	for (j = 0; j < n_practice; j++) {
		timeline.push({
			data: {
				is_practice: true,
				cond_bo: curr_cond.i,
				cond_kt: curr_cond.j
			},
			timeline: [
				no_mouse,
				new int_bind_trial(cfg),
				yes_mouse,
				too_early,
				too_late
			],
			loop_function: function(data) {
		        return (error_type != 'none');
		    }
		});
	}
	timeline.push(yes_mouse);
	timeline.push(new instructions([
		'End of practice',
		'Now the real trials will begin'
	]));
	timeline.push(no_mouse);
	// Next, the actual trials
	// Eliminate feedback in case there was any
	cfg.early_ms = false;
	cfg.timeout_ms = false;
	var curr_timeline;
	for (j = 0; j < n_trials; j++) {
		curr_timeline = [new int_bind_trial(cfg)];
		if (j % 3 == 0) {
			if (curr_cond.i == 'operant') {
				curr_timeline.push(yes_mouse, new joa(), no_mouse);
			}
		}
		timeline.push({
			data: {
				is_practice: false,
				cond_bo: curr_cond.i,
				cond_kt: curr_cond.j
			},
			timeline: curr_timeline
		});
	}
	timeline.push(yes_mouse);
}

jsPsych.init({
	timeline: timeline
});