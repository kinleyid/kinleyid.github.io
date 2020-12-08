
var timeline = [];

var participant_id = jsPsych.randomization.randomID(15);

// utility functions
save_data = function() {
	var form = document.createElement('form');
	document.body.appendChild(form);
	form.method = 'post';
	form.action = './save-data.php';
	var data = {
		txt: jsPsych.data.get().csv(),
		pID: participant_id
	}
	var name;
	for (name in data) {
		var input = document.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = data[name];
		form.appendChild(input);
	}
	form.submit();
}
// Consent form
consent = {
	type: 'external-html',
	url: './consent.html',
	cont_btn: 'start'
};
timeline.push(consent);

get_macid = {
	type: 'external-html',
	url: './get-macid.html',
	cont_btn: 'start',
	check_fn: function(elem) {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", './save-data.php', true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xhr.onreadystatechange = function() { // Call a function when the state changes.
			if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			}
		}
		var txt = 'MacID,results\n' +
			document.getElementById('MacID').value + ',' +
			document.getElementById('results').value;
		xhr.send("pID=zzz&txt=" + txt);
		return true;
	}
};
timeline.push(get_macid);

// Get email, etc
timeline.push({
 	type: 'survey-multi-choice',
	questions: [{
		prompt: 'Do you agree to have your data uploaded to a public repository?',
		name: 'public',
		options: ['Yes', 'No'],
		required:true,
		horizontal: true
	}],
	post_trial_gap: 500
});

// get demographic info
timeline.push({
  type: 'survey-text',
  preamble: '<h1>Demographic questions</h1><br><br><p>Note: these questions are optional and you are free to skip them.</p>',
  questions: [
    {prompt: "Age:"},
    {prompt: "Gender:"},
    {prompt: "Ethnicity:"},
    {prompt: "Dominant hand:"},
    {prompt: "Browser:"}
  ],
});

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
// Template for estimation:
/*
function estimation(prompt) {
	this.type = 'survey-text';
	this.questions = [
	    {
	    	prompt: prompt,
	    	name: 'Est'
	    } 
	]
}
*/
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
all_conds = jsPsych.randomization.repeat(all_conds, 1);
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
				/*
				{
					timeline: [new estimation(curr_prompt)],
					conditional_function: function() {
						return (error_type == 'none');
					}
			    }
			    */
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
// hand check
timeline.push({
 	type: 'survey-multi-choice',
	questions: [{
		prompt: 'Which hand did you use to press the spacebar?',
		name: 'hand',
		options: ['Left', 'Right'],
		required: true,
		horizontal: true
	}],
	post_trial_gap: 500
});

// ****** Mike's big 5

// Create timeline array (contains the set of triasl we want to run for the experiment)
// Simple welcome message
var welcome = {
	type: "html-keyboard-response",
	stimulus: "Welcome to the second part of the experiment. Press any key to begin.",
	post_trial_gap: 500
}
// Pushes the welcome trial into the timeline
timeline.push(welcome)

// Instructions
timeline.push({
	type: "html-keyboard-response",
	stimulus: "<p>For this part of the study, you will complete a 44-item questionnaire.</p><p>The questionnaire contains a number of characteristics that may or may not apply to you.</p><p>Please indicate the extent to which you agree or disagree with each statement.</p><p>You are free to not answer any question that makes you feel uncomfortable (choose the last option).</p><p>Press spacebar to begin.</p>",
	choices: ['spacebar'],
	post_trial_gap: 500
});

// The Survey Qs
var options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree", "I don't want to answer"];

var multi_choice_block = {
 	type: 'survey-multi-choice',
	questions: [
		{prompt: "<br><br>I see myself as someone who is talkative", name: 'Q1', options: options, required:true, horizontal: true},
		{prompt: "<br>I see myself as someone who tends to find fault with others", name: 'Q2', options: options, required:true, horizontal: true},
		{prompt: "<br>I see myself as someone who does a thorough job", name: 'Q3', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is depressed, blue ", name: 'Q4', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is original, comes up with new ideas", name: 'Q5', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is reserved ", name: 'Q6', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is helpful and unselfish with others", name: 'Q7', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who can be somewhat careless", name: 'Q8', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is relaxed, handles stress well", name: 'Q9', options: options, required:true, horizontal: true},
    	{prompt: "<br>I see myself as someone who is curious about many different things", name: 'Q10', options: options, required:true, horizontal: true}
  		],
	post_trial_gap: 500
};
timeline.push(multi_choice_block);

var multi_choice_block2 = {
 	type: 'survey-multi-choice',
	questions: [
	{prompt: "<br><br>I see myself as someone who is full of energy", name: 'Q11', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who starts quarrels with others", name: 'Q12', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is a reliable worker", name: 'Q13', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who can be tense", name: 'Q14', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is ingenious, a deep thinker", name: 'Q15', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who generates a lot of enthusiasm", name: 'Q16', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who has a forgiving nature", name: 'Q17', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who tends to be disorganized", name: 'Q18', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who worries a lot", name: 'Q19', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who has an active imagination", name: 'Q20', options: options, required:true, horizontal: true}
	],
	post_trial_gap: 500
};
timeline.push(multi_choice_block2);

var multi_choice_block3 = {
 	type: 'survey-multi-choice',
	questions: [
	{prompt: "<br><br>I see myself as someone who tends to be quiet", name: 'Q21', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is generally trusting", name: 'Q22', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who tends to be lazy", name: 'Q23', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is emotionally stable, not easily upset", name: 'Q24', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is inventive", name: 'Q25', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who has an assertive personality", name: 'Q26', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who can be cold and aloof", name: 'Q27', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who perseveres until the task is finished", name: 'Q28', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who can be moody", name: 'Q29', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who values artistic, aesthetic experiences", name: 'Q30', options: options, required:true, horizontal: true}
	],
	post_trial_gap: 500
};
timeline.push(multi_choice_block3);

var multi_choice_block4 = {
 	type: 'survey-multi-choice',
	questions: [
	{prompt: "<br><br>I see myself as someone who is sometimes shy, inhibited", name: 'Q31', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is considerate and kind to almost everyone", name: 'Q32', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who does things efficiently", name: 'Q33', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who remains calm in tense situations", name: 'Q34', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who prefers work that is routine", name: 'Q35', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is outgoing, sociable", name: 'Q36', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is sometimes rude to others", name: 'Q37', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who makes plans and follows through with them", name: 'Q38', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who gets nervous easily", name: 'Q39', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who likes to reflect, play with ideas", name: 'Q40', options: options, required:true, horizontal: true}
	],
	post_trial_gap: 500
};
timeline.push(multi_choice_block4);

var multi_choice_block5 = {
 	type: 'survey-multi-choice',
	questions: [
	{prompt: "<br><br>I see myself as someone who has few artistic interests", name: 'Q41', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who likes to cooperate with others", name: 'Q42', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is easily distracted", name: 'Q43', options: options, required:true, horizontal: true},
	{prompt: "<br>I see myself as someone who is sophisticated in art, music of literature", name: 'Q44', options: options, required:true, horizontal: true}
	],
	post_trial_gap: 500
};
timeline.push(multi_choice_block5);

jsPsych.init({
	timeline: timeline,
	show_preload_progress_bar: false,
	on_finish: save_data
});