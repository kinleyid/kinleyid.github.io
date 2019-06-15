
var viewport = document.getElementById('viewport');
var canv = document.getElementById('canv');
canv.height = viewport.clientHeight;
canv.width = viewport.clientWidth;
var ctx = canv.getContext('2d');

// Game parameters
var g = {
    h: canv.height/100,
    w: canv.width/100
};
var paddleSpeed = g.h;
var edgeDist = 10*g.w;
var preGameMs = 1000;
var ballSpeed = 1*g.w;
var score = [0, 0];

function object(type) {
    this.dx = this.dy = 0;
}

function makePaddle() {
    this.h = 20*g.h,
    this.w = 2*g.w,
    this.x = 0
    this.y = canv.height/2 - this.h/2;
    this.c = 'black';
    this.dx = this.dy = 0;
}

function makeBall() {
    this.h = this.w = 2*g.w;
    this.x = canv.width/2 - this.w/2;
    this.y = canv.height/2 - this.h/2;
    this.dx = this.dy = 0;
    this.c = 'black';
}

function draw(object) {
    if (object.c) {
        ctx.fillStyle = object.c;
    } else {
        ctx.fillStyle = 'black';
    }
    ctx.fillRect(object.x, object.y, object.w, object.h);
}

var player, opponent, ball, objectArray;

function reset() {
    player = new makePaddle();
    player.x = edgeDist;
    opponent = new makePaddle();
    opponent.x = canv.width - opponent.w - edgeDist;
    ball = new makeBall();
    objectArray = [player, opponent, ball];
    setTimeout(function() {
        ball.dx = ballSpeed;
        ball.dy = paddleSpeed;
    }, preGameMs);
}


// User controls
window.onkeydown = function(e) {
    if (e.code == 'ArrowUp') {
        player.dy = -paddleSpeed;
    } else if (e.code == 'ArrowDown') {
        player.dy = paddleSpeed;
    }
}

window.onkeyup = function(e) {
    if (e.code == 'ArrowUp' && player.dy < 0
        || e.code == 'ArrowDown' && player.dy > 0) {
        player.dy = 0;
    }
}

function collisionCheck(obj1, obj2) {
    if (obj1.x + obj1.w > obj2.x
        && obj1.x < obj2.x + obj2.w
        && obj1.y + obj1.h > obj2.y
        && obj1.y < obj2.y + obj2.h) {
        return true;
    } else {
        return false;
    }
}

function update(object) {
    object.x += object.dx;
    object.y += object.dy;
}

function run() {
    opponent.dy = paddleSpeed*Math.sign(ball.dy);
    objectArray.map(function(x) {update(x)});
    if (ball.y <= 0 || ball.y >= canv.height - ball.h) {
        ball.dy *= -1;
    }
    if (collisionCheck(ball, player) || collisionCheck(ball, opponent)) {
        ball.dx *= -1;
    }
    // score?
    if (ball.x < 0) {
        // opponent scored
        score[1]++;
        reset();
    } else if (ball.x + ball.w > canv.width) {
        // player scored
        score[0]++;
        reset();
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canv.width, canv.height);
    objectArray.map(function(x) {draw(x)});
}

reset();
setInterval(run, 20);

