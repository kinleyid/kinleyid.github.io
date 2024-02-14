
var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');

var bus = {
    x: canv.width/2,
    dx: 0, ddx: 0,
    y: canv.height/2,
    dy: 0, ddy: 0,
    w: 30,
    h: 10
}

var keys_down = {
    arrowleft: false,
    arrowright: false,
    arrowup: false
}
document.onkeydown = function(e) {
    var key = e.key.toLowerCase();
    if (keys_down[key] != undefined) {
        keys_down[key] = true;
    }
}
document.onkeyup = function(e) {
    var key = e.key.toLowerCase();
    if (keys_down[key] != undefined) {
        keys_down[key] = false;
    }
}

function update_bus() {
    var accel = 0.1;
    if (keys_down['arrowright']) {
        bus.ddx = accel;
    } else if (keys_down['arrowleft']) {
        bus.ddx = -accel;
    } else {
        bus.ddx = 0;
    }

    bus.ddy = 0.05; // gravity
    if (keys_down['arrowup']) {
        bus.ddy -= accel;
    }

    bus.dx += bus.ddx;
    bus.x += bus.dx;

    bus.dy += bus.ddy;
    bus.y += bus.dy;
}

function draw_bus() {
    ctx.fillStyle = 'black';
    ctx.fillRect(bus.x, bus.y, bus.w, bus.h);
}

function game_loop() {
    
    update_bus();

    ctx.clearRect(0, 0, canv.width, canv.height);
    draw_bus();
}

setInterval(game_loop, 32);