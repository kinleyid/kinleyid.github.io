

var jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData("csv");
  },
});

var all_names = jsPsych.data.getURLVariable('names').split(',');
all_names = jsPsych.randomization.shuffle(all_names);

var name_selection = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    {
      prompt: "Who are you?", 
      name: 'name_selection', 
      options: all_names, 
      required: true
    },
  ],
  on_finish: function(data) {
    var their_name = data.response.name_selection;
    all_names.splice(all_names.indexOf(their_name), 1); // Remove from list of all names
  }
}

var curr_name;
var ios_trials = {
  on_timeline_start: function(trial) {
    curr_name = all_names.pop();
  },
  timeline: [
    {
      type: jsPsychIos,
      left_title: 'Self',
      movable_circle: 'left',
      front_circle: 'left',
      right_border_col: 'blue',
      required: true,
      both_move: true,
      on_start: function(trial) {
        trial.prompt = 'How close are you to ' + curr_name + '?';
        trial.right_title = curr_name;
      }
    },
    {
      type: jsPsychHtmlVasResponse,
      stimulus: 'placeholder',
      required: true,
      scale_width: 300,
      labels: ['Strongly disagree', '', '', '', 'Strongly agree'],
      on_start: function(trial) {
        trial.stimulus = 'Question about ' + curr_name + '?';
      }
    },
    {
      type: jsPsychHtmlVasResponse,
      stimulus: 'placeholder',
      required: true,
      scale_width: 300,
      labels: ['Stronly disagree', 'Neutral', 'Strongly agree'],
      ticks: false,
      on_start: function(trial) {
        trial.stimulus = 'Another question about ' + curr_name + '?';
      }
    }
  ],
  loop_function: function() {return(all_names.length > 0)} // Repeat until no other names left
};

jsPsych.run([name_selection, ios_trials]);
