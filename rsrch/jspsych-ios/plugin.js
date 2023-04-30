var jsPsychIos = (function (jspsych) {
  "use strict";

  const info = {
    name: "ios",
    parameters: {
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: undefined,
      },
      left_title: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Left circle title",
        default: 'Self',
      },
      right_title: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Right circle title",
        default: 'Other',
      },
      diam: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Circle diameter",
        default: 200,
      },
      border_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Circle border width",
        default: 2,
      },
      left_col: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Left border colour",
        default: 'black',
      },
      right_col: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Right border colour",
        default: 'black',
      },
      cursor: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Cursor when circles clickable",
        default: "crosshair",
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      button_label: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Buton label",
        default: "Continue",
      },
      required: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response required",
        default: false,
      }
    },
  };
  class jsPsychHtmlVasResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var prompt = '<div id="jspsych-ios-prompt" style="margin-bottom: 10px;">' + trial.prompt + "</div>";
      var both_circles_container = '<div id="jspsych-ios-circles-container"' +
        'style="position: relative;' +
        'width: ' + 2*(trial.diam + 2*trial.border_width) + 'px;' +
        'height: ' +  (trial.diam + 2*trial.border_width) + 'px;">';
      // Create both circles
      var both_circles = '';
      var side, single_circle_container, title, circle;
      var side_opposites = {'left': 'right', 'right': 'left'};
      for (side in side_opposites) {
        // Create a container for both the circle and title
        var single_circle_container = '<div id="jspsych-ios-' + side + '-circle-container"' +
          'style="position: absolute; display: inline-block;' +
          'width: ' +  (trial.diam + 2*trial.border_width) + 'px;' +
          'height: ' + (trial.diam + 2*trial.border_width) + 'px;' + 
          side + ': 0%">'; // They should be pushed to the edges of the parent container
        // Create the title
        var title = '<div id="jspsych-ios-' + side + '-circle-title"' +
          'style="position: absolute; display: inline-block; bottom: 50%; margin: 10px;' +
          side_opposites[side] + ': 100%">' + // Should be pushed to the edges of the parent container
          trial[side + '_title'] + '</div>';
        // Create the circle
        var circle = '<div id="jspsych-ios-' + side + '-circle"' +
          'style="position: relative; display: inline-block; border-radius: 50%;' +
          'height: ' + trial.diam + 'px;' +
          'width: ' +  trial.diam + 'px;' +
          'border: ' + trial.border_width + 'px solid ' + trial[side + '_col'] +'"></div>';
        // Add them
        both_circles += single_circle_container + title + circle + '</div>';
      }
      var clickable_area = '<div id="jspsych-ios-clickable"' +
        'style="position: absolute; height: 100%; width: 100%; ' +
        'cursor: ' + trial.cursor + ';"></div>';
      // Submit button
      var submit_button = '<button id="jspsych-ios-next" class="jspsych-btn" ' +
        'style="margin-top: 10px" ' +
        (trial.required ? "disabled" : "") + ">" +
        trial.button_label +
        "</button>";
      // Put it all together
      display_element.innerHTML = 
        prompt +
          both_circles_container +
            both_circles +
            clickable_area +
          '</div>' +
        '</div>' +
        submit_button;

      // Interactivity
      var ppn_overlap;
      function update_circles(x) {
        var circles_container = document.getElementById('jspsych-ios-circles-container');
        var container_rect = circles_container.getBoundingClientRect();
        var circle_rad = trial.diam/2 + trial.border_width;
        var left_lim = container_rect.left + circle_rad;
        var right_lim = container_rect.left + 3*circle_rad;
        var rel_left = x - left_lim;
        var rel_right = right_lim - x;
        var circle = document.getElementById('jspsych-ios-right-circle-container');
        if (rel_left < 0) {
          circle.style.right = '';
          circle.style.left = '0px';
          ppn_overlap = 1;
        } else if (rel_right < 0) {
          circle.style.left = '';
          circle.style.right = '0px';
          ppn_overlap = 0;
        } else {
          circle.style.right = '';
          circle.style.left = Math.round(rel_left) + 'px';
          ppn_overlap = 1 - rel_left / (2*circle_rad);
        }
      }
      var clickable_area = document.getElementById('jspsych-ios-clickable');
      var circles_movable = false;
      // Handle mouse events
      clickable_area.onmousedown = function(e) {
        circles_movable = true;
        update_circles(e.clientX);
        var continue_button = document.getElementById("jspsych-ios-next");
        continue_button.disabled = false;
      }
      clickable_area.onmouseup = function(e) {circles_movable = false}
      clickable_area.onmousemove = function(e) {if (circles_movable) {update_circles(e.clientX)}}    
      // Handle touch events
      clickable_area.ontouchstart = function(e) {
        circles_movable = true;
        update_circles(e.changedTouches[e.changedTouches.length - 1].clientX);
        var continue_button = document.getElementById("jspsych-ios-next");
        continue_button.disabled = false;
      }
      clickable_area.ontouchend = function(e) {circles_movable = false}
      clickable_area.ontouchleave = function(e) {circles_movable = false}
      clickable_area.ontouchmove = function(e) {if (circles_movable) {update_circles(e.changedTouches[e.changedTouches.length - 1].clientX)}}

      // Data storage
      var response = {
        rt: null,
        response: null
      }
      var continue_button = document.getElementById("jspsych-ios-next");
      continue_button.onclick = function() {
        // measure response time
        var endTime = performance.now();
        response.rt = Math.round(endTime - startTime);
        response.response = ppn_overlap;
        end_trial();
      };
      function end_trial() {
        var trialdata = {
          rt: response.rt,
          prompt: trial.prompt,
          response: response.response
        };
        display_element.innerHTML = "";
        // next trial
        jsPsych.finishTrial(trialdata);
      }
      // Start the RT clock
      var startTime = performance.now();
    }
  }
  jsPsychHtmlVasResponsePlugin.info = info;

  return jsPsychHtmlVasResponsePlugin;
})(jsPsychModule);
