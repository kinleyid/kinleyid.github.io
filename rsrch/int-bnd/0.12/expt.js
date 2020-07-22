
var timeline = [];

timeline.push({
	type: 'fullscreen',
	fullscreen_mode: true
});

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

consent = {
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
timeline.push(consent);

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

// ****** Mike's big 5

// Create timeline array (contains the set of triasl we want to run for the experiment)
// Simple welcome message
var welcome = {
	type: "html-keyboard-response",
	stimulus: "Welcome to the experiment. Press any key to begin.",
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
	this.tone_file = './tone.mp3';
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
all_conds = jsPsych.randomization.repeat(all_conds, 1);
// Generate trial structures
var n_practice = 10,
	n_trials = 36;
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
		cond_bo: curr_cond.i,
		cond_kt: curr_cond.j,
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
	for (j = 0; j < n_practice; j++) {
		cfg.spin_continue_ms = jsPsych.randomization.sampleWithReplacement([1000, 1500, 2000], 1)[0];
		timeline.push({
			data: {
				is_practice: true,
				cond_bo: curr_cond.i,
				cond_kt: curr_cond.j
			},
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
	timeline.push(new instructions([
		'End of practice',
		'Now the real trials will begin'
	]));
	// Next, the actual trials
	// Eliminate feedback in case there was any
	cfg.early_ms = false;
	cfg.timeout_ms = false;
	for (j = 0; j < n_trials; j++) {
		cfg.spin_continue_ms = jsPsych.randomization.sampleWithReplacement([1000, 1500, 2000], 1)[0];
		timeline.push({
			data: {
				is_practice: false,
				cond_bo: curr_cond.i,
				cond_kt: curr_cond.j
			},
			timeline: [new int_bind_trial(cfg), new estimation(curr_prompt)]
		})
	}
}

// Ask for email and 

jsPsych.init({
	timeline: timeline,
	show_preload_progress_bar: false,
	on_finish: save_data
});