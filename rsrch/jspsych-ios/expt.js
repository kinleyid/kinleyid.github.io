var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

var trial = {
  type: jsPsychIos,
  prompt: '[Prompt]',
  right_col: 'blue',
  required: true
};

jsPsych.run([trial]);
