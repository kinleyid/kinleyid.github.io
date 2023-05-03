var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

var trial = {
  type: jsPsychIos,
  prompt: 'Relationship to group?',
  left_diam: 150,
  right_diam: 200,
  left_title: 'Self',
  right_title: 'Group',
  required: true,
  front_circle: 'left',
  movable_circle: 'left',
  both_move: true,
  max_sep: 100
};

jsPsych.run([trial]);
