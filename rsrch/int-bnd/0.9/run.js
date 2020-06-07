
function copy_obj(in_obj) {

}

var timeline = [];
/*
timeline.push({
	type: 'fullscreen',
	fullscreen_mode: true
});
*/
// Template for all instructions trials
function instructions(pages) {
	this.pages = pages;
	this.type = 'instructions';
	this.show_clickable_nav = true;
	this.post_trial_gap = 1000;
}
// Template for all intentional binding trials
var error_type = 'none';
function int_bind_trial(cfg) {
	for (a in cfg) {
		this[a] = cfg[a];
	}
	this.type = 'int-bind';
	this.tone_file = 'tone.mp3';
	this.hand_est = false;
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
// Template for estimation:
function estimation(prompt) {
	this.type = 'survey-text';
	this.questions = [
	    {
	    	prompt: prompt,
	    	name: 'Est'
	    } 
	]
}
// Conditional trial for if the participant responds too early
var too_early = {
	timeline: [new instructions([
		'Too early!',
		'Please wait one full rotation to make a response.'
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
var instruction_txt = {
	preamble: [
		'Watch the clock.'
	],
	key: [
		'Wait at least one full rotation but not more than 4 seconds, then use your right index finger to press the space bar.',
		'Avoid deciding ahead of time when you will press space.'
	],
	tone: [
		'Listen for the tone.'
	]
};
// Estimation prompts for each trial type
var prompt_txt = {
	preamble: 'Where was the hand when',
	postable: '(enter as digits)',
	key: 'pressed space',
	tone: 'heard the tone'
};
// Determine the order of trials
// Ensure each combination is represented
var conds = {
	i: ['baseline', 'operant'],
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
//all_conds = jsPsych.randomization.repeat(all_conds, 1);
// Generate trial structures
var i;
for (i = 0; i < all_conds.length; i++) {
	curr_cond = all_conds[i];
	// Generate instructions
	curr_pages = instruction_txt.preamble;
	if (curr_cond.i == 'baseline') {
		curr_pages = curr_pages.concat(
			instruction_txt[curr_cond.j]
		);
	} else {
		curr_pages = curr_pages.concat(
			instruction_txt.key
		);
		if (curr_cond.j == 'tone') {
			curr_pages = curr_pages.concat(instruction_txt.tone);
		}
	}
	curr_pages = curr_pages.concat(['First, we will do 10 practice trials.']);
	curr_instructions = new instructions(curr_pages);
	timeline.push(curr_instructions);
	// Generate actual trial
	cfg = {
		key_press: true,
		tone: true,
		early_ms: 2560,
		timeout_ms: 4000,
		tone_delay_ms: 250
	};
	if (curr_cond.i == 'baseline') {
		if (curr_cond.j == 'key') {
			cfg.tone = false;
		} else {
			cfg.key_press = false;
			cfg.tone_delay_ms += cfg.early_ms;
			cfg.early_ms = false;
			cfg.timeout_ms = false;
		}
	}
	curr_prompt = prompt_txt.preamble +
		' you ' +
		prompt_txt[curr_cond.j] +
		'? ' +
		prompt_txt.postable;
	// First, the practice blocks
	for (j = 0; j < 10; j++) {
		cfg.spin_continue_ms = jsPsych.randomization.sampleWithReplacement([1000, 1500, 2000], 1)[0];
		timeline.push({
			timeline: [
				new int_bind_trial(cfg),
				too_early,
				too_late,
				{
					timeline: [new estimation(curr_prompt)],
					conditional_function: function() {
						return (error_type == 'none');
					}
			    }
			],
			loop_function: function(data) {
		        return (error_type != 'none');
		    }
		});
	}
	timeline.push({
		type: 'instructions',
		pages: [
			'End of practice.',
			'Now the real trials will begin.'
		]
	})
	// Next, the actual trials
	// Eliminate feedback in case there was any
	cfg.early_ms = false;
	cfg.timeout_ms = false;
	for (j = 0; j < 36; j++) {
		cfg.spin_continue_ms = jsPsych.randomization.sampleWithReplacement([1000, 1500, 2000], 1)[0];
		timeline.push(new int_bind_trial(cfg));
		timeline.push(new estimation(curr_prompt));
	}
}

jsPsych.init({
	timeline: timeline
});