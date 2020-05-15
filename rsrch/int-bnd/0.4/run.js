
var timeline = [];

timeline.push({
	type: 'fullscreen',
	fullscreen_mode: true
});

timeline.push({
	type: 'instructions',
	pages: [
		'Watch the clock.',
		'Press the space bar whenever you feel like it.',
		'When the clock hand turns green, move it to where it was when you pressed space.',
		'When you are satisfied with your selection, press enter.'
	],
	show_clickable_nav: true,
	post_trial_gap: 1000
});

timeline.push({
	type: 'int-bind',
	clock_diam: 200,
	tone_file: 'tone.mp3',
	tone: false,
	hand_inc: 0.05
});

timeline.push({
	type: 'instructions',
	pages: [
		'Watch the clock.',
		'Listen for the tone.',
		'When the clock hand turns green, move it to where it was when the tone began.',
		'When you are satisfied with your selection, press enter.'
	],
	show_clickable_nav: true,
	post_trial_gap: 1000
});

timeline.push({
	type: 'int-bind',
	clock_diam: 200,
	tone_delay: 2560,
	tone_file: 'tone.mp3',
	key_press: false,
	hand_inc: 0.05
});

timeline.push({
	type: 'instructions',
	pages: [
		'Watch the clock.',
		'Press the space bar whenever you feel like it.',
		'After you press the space bar, you will hear a tone.',
		'When the clock hand turns green, move it to where it was when the tone began.',
		'When you are satisfied with your selection, press enter.'
	],
	show_clickable_nav: true,
	post_trial_gap: 1000
});

timeline.push({
	type: 'int-bind',
	clock_diam: 200,
	tone_file: 'tone.mp3',
	hand_inc: 0.05
});

jsPsych.init({
	timeline: timeline
});