/**
 * jspsych-video-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing a video file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["video-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('video-keyboard-response', 'stimulus', 'video');

  plugin.info = {
    name: 'video-keyboard-response',
    description: '',
    parameters: {
      sources: {
        type: jsPsych.plugins.parameterType.VIDEO,
        pretty_name: 'Video',
        default: undefined,
        description: 'The video file to play.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Width',
        default: '',
        description: 'The width of the video in pixels.'
      },
      height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Height',
        default: '',
        description: 'The height of the video display in pixels.'
      },
      autoplay: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Autoplay',
        default: true,
        description: 'If true, the video will begin playing as soon as it has loaded.'
      },
      controls: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Controls',
        default: false,
        description: 'If true, the subject will be able to pause the video or move the playback to any point in the video.'
      },
      start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Start',
        default: null,
        description: 'Time to start the clip.'
      },
      stop: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Stop',
        default: null,
        description: 'Time to stop the clip.'
      },
      rate: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Rate',
        default: 1,
        description: 'The playback rate of the video. 1 is normal, <1 is slower, >1 is faster.'
      },
      trial_ends_after_video: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'End trial after video finishes',
        default: false,
        description: 'If true, the trial will end immediately after the video finishes playing.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when subject makes a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {


    //Create a canvas element and append it to the DOM
    var canvas = document.createElement("canvas");
    display_element.appendChild(canvas); 
    
    //The document body IS 'display_element' (i.e. <body class="jspsych-display-element"> .... </body> )
    var body = document.getElementsByClassName("jspsych-display-element")[0];
    
    //Save the current settings to be restored later
    var originalMargin = body.style.margin;
    var originalPadding = body.style.padding;
    var originalBackgroundColor = body.style.backgroundColor;
    
    //Remove the margins and paddings of the display_element
    body.style.margin = 0;
    body.style.padding = 0;
    body.style.backgroundColor = backgroundColor; //Match the background of the display element to the background color of the canvas so that the removal of the canvas at the end of the trial is not noticed

    //Remove the margins and padding of the canvas
    canvas.style.margin = 0;
    canvas.style.padding = 0;   
    
    //Get the context of the canvas so that it can be painted on.
    var ctx = canvas.getContext("2d");

    //Declare variables for width and height, and also set the canvas width and height to the window width and height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Set the canvas background color
    canvas.style.backgroundColor = backgroundColor;

    // stimulus rendering functions

    // rendering only the clock face
    function draw_clock_face() {
      ctx.fillStyle = 'black';
      ctx.strokeStyle = 'black';
      // Circle
      ctx.beginPath();
      ctx.arc(middle_x, middle_y, clock_rad, 0, 2 * Math.PI);
      ctx.stroke();
      // Tick marks and numbers
      var tick_len = 2/30*clock_diam;
      var i, theta;
      for (i = 5; i <= 60; i += 5) {
        theta = Math.PI/2 - 2*Math.PI*i/60;
        // Tick marks
        ctx.beginPath();
        ctx.moveTo(
          middle_x + clock_rad*Math.cos(theta),
          middle_y - clock_rad*Math.sin(theta)
        );
        ctx.lineTo(
          middle_x + (clock_rad + tick_len)*Math.cos(theta),
          middle_y - (clock_rad + tick_len)*Math.sin(theta)
        );
        ctx.stroke();
        // Numbers
        ctx.font = "5mm Arial";
        ctx.fillText(
          i,
          middle_x + (clock_rad + 2*tick_len)*Math.cos(theta),
          middle_y - (clock_rad + 2*tick_len)*Math.sin(theta)
        );
      }
    }

    // rendering the clock hand
    hand_len = 11/30*clock_diam;
    function draw_hand(theta) {
      ctx.beginPath();
      ctx.moveTo(middle_x, middle_y);
      ctx.lineTo(
        middle_x + hand_len*Math.cos(theta),
        middle_y - hand_len*Math.sin(theta)
      );
      ctx.stroke();
    }

    // clock animation
    function animate_hand() {
      if (stop_rotation) {
        window.cancelAnimationFrame(frameRequestID);
      } else {
        frameRequestID = window.requestAnimationFrame(animate);
        // Compute clock rotation
        var elapsed_ms = timestamp - last_timestamp;
        last_timestamp = timestamp;
        dtheta = elapsed_ms / rotation_period * Math.PI * 2;
        clock.theta = clock.theta - dtheta;
        clock.theta = clock.theta % (Math.PI * 2);
        // Draw stimuli
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw_clock();
        draw_fix();
        draw_hand(clock.theta);
      }
    }

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-video-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'performance',
        persist: false,
        allow_held_key: false,
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
