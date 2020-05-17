
jsPsych.plugins['int-bind'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('int-bind', 'tone_file', 'audio');

  plugin.info = {
    name: 'int-bind',
    description: '',
    parameters: {
      key_press: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Key press',
        default: true,
        description: 'Specifies whether the participant makes a key press.'
      },
      tone: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Tone',
        default: true,
        description: 'Specifies whether a tone is played.'
      },
      tone_file: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Tone file',
        default: undefined,
        description: 'The audio file to be played.'
      },
      hand_est: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: '',
        default: true,
        description: 'Specifies whether the participant moves the hand to estimate an angle.'
      },
      pre_estimation_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Pre-estimation delay',
        default: 1000,
        description: 'The length of time, in ms, that the clock hand disappears before reappearing to be moved by the participant.'
      },
      hand_inc: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Clock hand increment',
        default: Math.PI*2/120,
        description: 'The minimum number of radians a participant can rotate the clock hand.'
      },
      offset_range: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Offset range',
        default: [Math.PI/4, Math.PI/3],
        description: 'When the participant is able to move the clock hand, its initial angle will be offset from the correct angle by an absolute amount drawn from this range (in radians).'
      },
      fix_len: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: 400,
        description: 'Duration of the pre-trial fixation cross in ms.'
      },
      clock_period: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Clock period',
        default: 2560,
        description: 'The period of the clock in ms.'
      },
      tone_delay: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Tone delay',
        default: 250,
        description: 'The time after the key press or the beginning of the clock animation that the tone is played, if applicable.'
      },
      spin_continue: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Residual spinning length',
        default: 1000,
        description: 'The length of time, in ms, after the "critical event" (key press or tone, whichever comes later) that the clock animation continues.'
      },
      clock_diam: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Clock diameter',
        default: 200,
        description: 'The diameter of the clock in pixels.'
      },
      n_maj_ticks: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of major ticks',
        default: 60,
        description: 'The number of major ticks to draw on the clock face.'
      },
      maj_tick_len: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Major tick length',
        default: 12,
        description: 'Length of major ticks in pixels.'
      },
      maj_tick_start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Major tick start',
        default: 0,
        description: 'Where to draw the first major tick, in radians.'
      },
      n_min_ticks: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Number of minor ticks',
        default: 60,
        description: 'The number of minor ticks to draw on the clock face.'
      },
      min_tick_len: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minor tick length',
        default: 6,
        description: 'Length of minor ticks in pixels.'
      },
      min_tick_start: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Minor tick start',
        default: Math.PI*2/120,
        description: 'Where to draw the first minor tick, in radians.'
      },
      num: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Numbers',
        default: [60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5],
        description: 'The numbers to draw around the clock face.'
      },
      num_start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: '',
        default: Math.PI/2,
        description: 'Where to draw the first number, in radians.'
      },
      num_font: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: '',
        default: "5mm Arial",
        description: 'The font for the numbers.'
      },
      num_dist: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: '',
        default: 30,
        description: 'Distance of the numbers from the outer circle of the clock, in pixels.'
      },
      hand_len: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Hand length',
        default: 80,
        description: 'Length of the clock hand in pixels'
      }
    }
  }

  plugin.trial = function(display_element, trial) {


    //Create a canvas element and append it to the DOM
    var canvas = document.createElement("canvas");
    display_element.appendChild(canvas); 
    
    //The document body IS 'display_element' (i.e. <body class="jspsych-display-element"> .... </body> )
    var body = document.getElementsByClassName("jspsych-display-element")[0];
    
    //Get the context of the canvas so that it can be painted on.
    var ctx = canvas.getContext("2d");

    //Declare variables for width and height, and also set the canvas width and height to the window width and height
    canvas.width = trial.clock_diam*2;
    canvas.height = trial.clock_diam*2;
    var middle_x = canvas.width / 2;
    var middle_y = canvas.height / 2;

    trial_data = {};

    function clear_screen() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // clock object
    var clock = {
      diameter: trial.clock_diam,
      radius: trial.clock_diam/2,
      theta: null,
      update_theta: function(delta_theta) {
        clock.theta = clock.theta + delta_theta;
        clock.theta = clock.theta % (Math.PI * 2);
      },
      draw_ticks: function(n_ticks, tick_start, tick_len) {
        // function to draw ticks
        var i, theta;
        for (i = 0; i < n_ticks; i++) {
          theta = tick_start + i * Math.PI * 2 / n_ticks;
          ctx.beginPath();
          ctx.moveTo(
            middle_x + clock.radius*Math.cos(theta),
            middle_y - clock.radius*Math.sin(theta)
          );
          ctx.lineTo(
            middle_x + (clock.radius + tick_len)*Math.cos(theta),
            middle_y - (clock.radius + tick_len)*Math.sin(theta)
          );
          ctx.stroke();
        }
      },
      draw_face: function() {
        // function to draw the clock face
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        // circle
        ctx.beginPath();
        ctx.arc(middle_x, middle_y, clock.radius, 0, 2 * Math.PI);
        ctx.stroke();
        // tick marks, major and minor
        clock.draw_ticks(trial.n_maj_ticks, trial.maj_tick_start, trial.maj_tick_len);
        clock.draw_ticks(trial.n_min_ticks, trial.min_tick_start, trial.min_tick_len);
        // numbers
        var i, theta;
        for (i = 0; i < trial.num.length; i++) {
          theta = trial.num_start + i * Math.PI * 2 / trial.num.length;
          ctx.font = trial.num_font;
          ctx.textBaseline = "middle";
          ctx.textAlign = "center";
          ctx.fillText(
            trial.num[i],
            middle_x + (clock.radius + trial.num_dist)*Math.cos(theta),
            middle_y - (clock.radius + trial.num_dist)*Math.sin(theta)
          );
        }
      },
      fix_col: 'black',
      draw_fix: function() {
        var prior_ss = ctx.strokeStyle;
        ctx.strokeStyle = clock.fix_col;
        var fix_len = 2/30*clock.diameter/2;
        var x = [1, 0, -1, 0];
        var y = [0, 1, 0, -1];
        var i;
        for (i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(middle_x, middle_y);
          ctx.lineTo(
            middle_x + x[i]*fix_len,
            middle_y + y[i]*fix_len
          );
          ctx.stroke();
        }
        ctx.strokeStyle = prior_ss;
      },
      hand_col: 'black',
      draw_hand: function() {
        var prior_ss = ctx.strokeStyle;
        ctx.strokeStyle = clock.hand_col;
        ctx.beginPath();
        ctx.moveTo(middle_x, middle_y);
        ctx.lineTo(
          middle_x + trial.hand_len*Math.cos(clock.theta),
          middle_y - trial.hand_len*Math.sin(clock.theta)
        );
        ctx.stroke();
        ctx.strokeStyle = prior_ss;
      },
      period: trial.clock_period,
      stop: false,
      t_0: null, // when rotation began
      theta_0: null, // initial hand angle
      t_last: null,
      raf_id: null, // requestAnimationFrame ID
      animate: function() {
        timestamp = performance.now();
        if (clock.stop) {
          // stop animation
          window.cancelAnimationFrame(clock.raf_id);
          // draw empty face
          clear_screen();
          clock.draw_face();
          clock.draw_fix();
          // reset
          clock.stop = false;
          clock.t_last = null;
          clock.raf_id = null;
        } else {
          clock.raf_id = window.requestAnimationFrame(clock.animate);
          if (clock.t_0 == null) {
            // first call
            clock.t_0 = timestamp;
            clock.theta_0 = clock.theta;
            clock.t_last = timestamp;
          } else {
            // compute elapsed time and update theta
            var elapsed_ms = timestamp - clock.t_last;
            clock.t_last = timestamp;
            var delta_theta = elapsed_ms / clock.period * Math.PI * 2;
            clock.update_theta(-delta_theta);
          }
          // draw stimuli
          clear_screen();
          clock.draw_face();
          clock.draw_fix();
          clock.draw_hand();
        }
      }
    };

    // rotator object, which responds to keyboard input and moves the clock hand
    function rotate_clock(direction) {
      fac = 0;
      if (direction == 'left') {
        fac = 1;
      } else if (direction == 'right') {
        fac = -1;
      }
      var delta_theta = fac * trial.hand_inc;
      clock.update_theta(delta_theta);
      // draw clock
      clear_screen();
      clock.draw_face();
      clock.draw_fix();
      clock.draw_hand();
    }

    // load audio
    var context = jsPsych.pluginAPI.audioContext();
    if(context !== null){
      var source = context.createBufferSource();
      source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.tone_file);
      source.connect(context.destination);
    } else {
      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.tone_file);
      audio.currentTime = 0;
    }

    function ctrl_fcn(ctrl) {
      // this is the big control flow function. depending
      // on the value of ctrl, it initiates different parts
      // of the trial
      if (ctrl == 'start') { // begin a new trial
        // draw initial yellow cross
        clear_screen();
        clock.fix_col = 'yellow';
        clock.draw_face();
        clock.draw_fix();
        // wait 400 ms, then start rotating the clock hand
        clock.theta = Math.random()*Math.PI*2;
        setTimeout(function() {
          // begin rotating the clock hand
          clock.fix_col = 'black';
          clock.hand_col = 'black';
          window.requestAnimationFrame(clock.animate);
          if (trial.key_press) {
            // add a response listener
            jsPsych.pluginAPI.getKeyboardResponse({
              valid_responses: jsPsych.ALL_KEYS,
              rt_method: 'performance',
              persist: false,
              allow_held_key: false,
              callback_function: function(info) {
                // compute clock theta at the time of response
                trial_data.key_press_theta = clock.theta;
                if (trial.tone) {
                  ctrl_fcn('tone');
                } else {
                  trial_data.target_theta = trial_data.key_press_theta;
                  ctrl_fcn('estimate');
                }
              }
            });
          } else if (trial.tone) {
            // trigger the tone to eventually be played
            ctrl_fcn('tone');
          }
        }, trial.fix_len);
      } else if (ctrl == 'tone') { // play the tone
        // schedule tone
        setTimeout(function() {
          // play the tone
          if(context !== null){
            startTime = context.currentTime;
            source.start(startTime);
          } else {
            audio.play();
          }
          // record cock hand angle of audio
          trial_data.tone_theta = clock.theta;
          trial_data.target_theta = trial_data.tone_theta;
          // trigger estimation?
          ctrl_fcn('estimate');
        }, trial.tone_delay);
      } else if (ctrl == 'estimate') { // estimate the time of the tone
        // schedule end of clock rotation
        setTimeout(function() {
          clock.stop = true;
          // schedule beginning of estimation
          setTimeout(function() {
            if (trial.hand_est) {
              // estimate by moving the clock hand
              jsPsych.pluginAPI.getKeyboardResponse({
                valid_responses: jsPsych.ALL_KEYS,
                rt_method: 'performance',
                persist: true,
                allow_held_key: true,
                callback_function: function(info) {
                  if (info.key == 37) {
                    rotate_clock('left');
                  } else if (info.key == 39) {
                    rotate_clock('right');
                  } else if (info.key == 13) {
                    // record estimated tone theta
                    trial_data.estimated_theta = clock.theta;
                    jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    ctrl_fcn('end');
                  }
                }
              });
              var fac = jsPsych.randomization.sampleWithReplacement([-1, 1], 1)[0];
              var offset = Math.random()*(trial.offset_range[1] - trial.offset_range[0]) + trial.offset_range[0];
              clock.theta = trial_data.target_theta + fac*offset;
              clock.hand_col = 'green';
              rotate_clock();
            } else {
              // assumedly the user has programmed a survey-text trial
              ctrl_fcn('end');
            }
          }, trial.pre_estimation_delay)
        }, trial.spin_continue);
      } else if (ctrl == 'end') {
        end_trial();
      }
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // start the trial
    ctrl_fcn('start');

  };
  return plugin;
})();
