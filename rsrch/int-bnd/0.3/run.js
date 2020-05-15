
var timeline = [];

timeline.push({
	type: 'fullscreen',
	fullscreen_mode: true
});

timeline.push({
	type: 'int-bind',
	clock_diam: 100,
	stimulus: 'tone.mp3',
});

jsPsych.init({
	timeline: timeline
});