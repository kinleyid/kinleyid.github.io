
var timeline = [];

timeline.push({
	type: 'fullscreen',
	fullscreen_mode: true
});

var demo_block = {
	loop_function: function() {
		return true;
	},
	timeline: [
		{
			type: 'instructions',
			pages: [
				'Watch the clock.',
				'Use your right index finger to press the space bar whenever you feel like it.',
				'When the clock hand turns green, use the left and right arrow keys to move it to where it was when you pressed space.',
				'When you are satisfied with your selection, press enter.'
			],
			show_clickable_nav: true,
			post_trial_gap: 1000
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3',
			tone: false
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3',
			tone: false,
			hand_est: false
		},
		{
			type: 'survey-text',
			questions: [
			    {
			    	prompt: 'Where was the hand when you pressed space? (enter as digits)',
			    	name: 'Est'}, 
			]
		},
		{
			type: 'instructions',
			pages: [
				'Watch the clock.',
				'Listen for the tone.',
				'When the clock hand turns green, use the left and right arrow keys move it to where it was when the tone began.',
				'When you are satisfied with your selection, press enter.'
			],
			show_clickable_nav: true,
			post_trial_gap: 1000	
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3',
			key_press: false,
			tone_delay: 600
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3',
			key_press: false,
			tone_delay: 600,
			hand_est: false
		},
		{
			type: 'survey-text',
			questions: [
			    {
			    	prompt: 'Where was the hand when you heard the tone? (enter as digits)',
			    	name: 'Est'}, 
			]
		},
		{
			type: 'instructions',
			pages: [
				'Watch the clock.',
				'Using your right index finger, press the space bar whenever you feel like it.',
				'After you press the space bar, you will hear a tone.',
				'When the clock hand turns green, use the left and right arrow keys to move it to where it was when the tone began.',
				'When you are satisfied with your selection, press enter.'
			],
			show_clickable_nav: true,
			post_trial_gap: 1000
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3'
		},
		{
			type: 'int-bind',
			tone_file: 'tone.mp3',
			hand_est: false
		},
		{
			type: 'survey-text',
			questions: [
			    {
			    	prompt: 'Where was the hand when you heard the tone? (enter as digits)',
			    	name: 'Est'}, 
			]
		}
	]
}

timeline.push(demo_block);

jsPsych.init({
	timeline: timeline
});