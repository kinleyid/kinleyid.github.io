
// set up canvas
var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');

// set up roads

var n_roads = 4;
var road_width = 14
var roads = [];
var r;
for (r = 0; r < n_roads; r++) {
	roads.push({
		x: canv.width/2 - road_width/2*n_roads + road_width * r,
		dir: 1, // Math.random() < 0.5 ? 1 : -1,
		cars: []
	});
}

function draw_roads() {
	var prior_fs = ctx.fillStyle;
	var r;
	for (r = 0; r < roads.length; r++) {
		ctx.fillStyle = 'gray';
		ctx.fillRect(
			roads[r].x + 1,
			0,
			road_width - 2,
			canv.height
		);
	}
	ctx.fillStyle = prior_fs;
}

var light = {
	red: true,
	y: canv.height/2,
	x: roads[0].x + 20
};

function switch_light() {
	if (light.red) {
		light.red = false;
	} else {
		light.red = true;
	}
}

function draw_light() {
	var prior_fs = ctx.fillStyle;
	var curr_fs = 'green';
	if (light.red) {
		curr_fs = 'red';
	}
	ctx.fillStyle = curr_fs;
	var r;
	for (r = 0; r < roads.length; r++) {
		ctx.fillRect(
			roads[r].x + road_width/2 - 2,
			light.y,
			4, 4);
	}
	ctx.fillStyle = prior_fs;
}

function create_car(road) {
	var speediness = 0.5 + 0.5 * Math.random(); // latent variable
	var car = {
		speediness: speediness,
		y: road.dir == 1 ? -100 : canv.height + 100,
		road: road,
		dy: 0,
		ddy: 0,
		braking: false,
		accel: 0.045*speediness + 0.05*Math.random(),
		max_dy: 8 * speediness,
		max_decel: 0.1 * speediness + 0.2*Math.random(),
		length: 20,
		width: road_width - 4,
		colour: 'rgb(' +
			Math.round(255 * Math.random()) + ',' +
			Math.round(255 * Math.random()) + ',' +
			Math.round(255 * Math.random()) + ')'
	};
	car.stopping_dist = get_stopping_dist(car);
	return(car);
};

function get_stopping_dist(car) {
	var n = Math.ceil(Math.abs(car.dy / car.max_decel));
	var stopping_dist = n * Math.abs(car.dy) - (n - 1) * n / 2 * car.max_decel;
	stopping_dist += 1.2 * car.length; // Try to leave one car length
	if (car.braking) { // If already braking, biased to continue braking
		stopping_dist *= 1.5;
	}
	return(stopping_dist);
}

function check_cars() {
	var r, c, car, oc, othercar, dist;
	for (r = 0; r < roads.length; r++) {
		for (c = 0; c < roads[r].cars.length; c++) {
			car = roads[r].cars[c];
			// first, assume no braking
			car.braking = false;
			// braking for another car?
			for (oc = 0; oc < roads[r].cars.length; oc++) {
				if (oc != c) {
					othercar = roads[r].cars[oc];
					dist = othercar.y - car.y
					if (dist > 0) {
						if (dist <= car.stopping_dist) {
							car.braking = true;
						}
					}
				}
			}
			// braking for the light?
			if (light.red) {
				dist = light.y - car.y;
				if (dist > 0) {
					if (dist <= car.stopping_dist) {
						car.braking = true;
					}
				}
			}
		}
	}
}

function update_cars() {
	var r, c, car;
	for (r = 0; r < roads.length; r++) {
		for (c = roads[r].cars.length - 1; c >= 0; c--) {
			car = roads[r].cars[c];
			if (car.y > canv.height + 100) {
				roads[r].cars.splice(c, 1);
				// remove from list
			} else {
				// update speed and location
				if (car.braking) {
					car.ddy = -car.max_decel;
				} else {
					car.ddy = car.accel*(car.max_dy - car.dy);
				}
				car.dy += car.ddy
				if (car.dy < 0) {
					car.dy = 0;
				}
				// update stopping distance
				car.stopping_dist = get_stopping_dist(car);
				car.y += car.road.dir * car.dy;
			}
		}
	}
}

function draw_cars() {
	var prior_fs = ctx.fillStyle;
	var r, c, car, car_x;
	for (r = 0; r < roads.length; r++) {
		car_x = roads[r].x + 2
		for (c = 0; c < roads[r].cars.length; c++) {
			car = roads[r].cars[c];
			// car body
			ctx.fillStyle = car.colour;
			ctx.fillRect(
				car_x,
				car.y,
				car.width,
				car.length
			);
			// windshields
			ctx.fillStyle = 'black';
			ctx.fillRect(
				car_x + 1,
				car.y + 2,
				car.width - 2,
				car.length*0.2
			);
			ctx.fillRect(
				car_x + 1,
				car.y + car.length*0.6 - 1,
				car.width - 2,
				car.length*0.2
			);
			// lights
			if (car.braking) {
				ctx.fillStyle = 'red';
			} else {
				ctx.fillStyle = 'white';
			}
			ctx.fillRect(
				car_x,
				car.y + car.length - 2,
				2, 2
			);
			ctx.fillRect(
				car_x + car.width - 2,
				car.y + car.length - 2,
				2, 2
			);
		}
	}
	ctx.fillStyle = prior_fs;
}

function draw_instr() {
	ctx.textAlign = 'right';
	ctx.textBaseline = 'middle';
	ctx.font = '12pt serif';
	var txt = '';
	if (!l_pressed) {
		txt = '"L" to change lights';
	} else if (!n_pressed) {
		txt = '"N" to add lane';
	}
	ctx.fillText(
		txt,
		roads[0].x - 10,
		canv.height/2);
}

function game_loop() {
	// generate new cars
	var r;
	for (r = 0; r < roads.length; r++) {
		if (roads[r].cars.length < 10) {
			if (Math.random() < 0.01) {
				var new_car = create_car(roads[r]);
				roads[r].cars.push(new_car);
			}
		}
	}
	check_cars();
	update_cars();
	// graphics
	ctx.clearRect(0, 0, canv.width, canv.height);
	draw_roads();
	draw_cars();
	draw_light();
	draw_instr();
}

// interactivity

var l_pressed = false;
var n_pressed = false;

function add_lane() {
	for (r = 0; r < roads.length; r++) {
		roads[r].x -= road_width/2;
	}
	roads.push({
		x: roads[roads.length - 1].x + road_width,
		dir: 1,
		cars: []
	});
}

document.onkeydown = function(e) {
	if (e.key == 'l') {
		l_pressed = true;
		switch_light();
	} else if (e.key == 'n') {
		n_pressed = true;
		add_lane();
	}
}

setInterval(game_loop, 32);