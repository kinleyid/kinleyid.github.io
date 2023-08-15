
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
var score = 0;

function make_paddle() {
    var paddle = {
        h: 20*g.h,
        w: 1*g.w,
        x: undefined,
        c: 'black',
        dy: 0
    }
    paddle.y = canv.height/2 - paddle.h/2;
    return(paddle);
}

function make_ball() {
    var ball = {
        r: 1.5*g.w,
        c: 'black',
        dx: 0,
        dy: 0,
        ddy: 0
    }
    ball.y = canv.height/2 - ball.r/2;
    ball.x = canv.width/2 - ball.r/2;
    return(ball);
}

function draw_paddle(object) {
    ctx.fillStyle = object.c;
    ctx.fillRect(object.x, object.y, object.w, object.h);
}

function draw_ball(object) {
    ctx.strokeStyle = object.c;
    ctx.beginPath();
    ctx.arc(object.x, object.y, object.r, 0, 2 * Math.PI);
    ctx.stroke();
}

var player, opponent, ball;

function reset() {
    player = make_paddle();
    player.x = edgeDist;
    opponent = make_paddle();
    opponent.x = canv.width - opponent.w - edgeDist;
    ball = make_ball();
    setTimeout(function() {
        ball.dx = -ballSpeed;
        ball.dy = 0.5*paddleSpeed*(Math.random() < 0.5 ? 1 : -1);
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

function collisionCheck(rect, circ) {
    out = false;
    if (circ.x + circ.r >= rect.x) {
        if (circ.x - circ.r <= rect.x + rect.w) {
            if (circ.y >= rect.y) {
                if (circ.y <= rect.y + rect.h) {
                    out = true;
                }
            }
        }
    }
    return(out)
}

function update(object) {
    if (object.ddy) {
        object.dy += object.ddy;
    }
    if (object.dx) {
        object.x += object.dx;
    }
    object.y += object.dy;
}

function draw_score() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'black';
    ctx.font = '12pt serif'
    ctx.fillText('score: ' + score, canv.width/2, 0)
}

function run() {
    // Update opponent
    // opponent.dy = paddleSpeed*Math.sign(ball.y - (opponent.y + opponent.h/2));
    update(player);
    update(opponent);
    update(ball);
    // Bounce off walls
    if (ball.y - ball.r <= 0) {
        ball.y = ball.r;
        ball.dy *= -1;
    }
    if (ball.y + ball.r >= canv.height) {
        ball.y = canv.height - ball.r;
        ball.dy *= -1;
    }
    if (ball.x + ball.r >= canv.width) {
        ball.x = canv.width - ball.r;
        ball.dx *= -1;
        ball.ddy += (2*Math.random() - 1); // random spin
    }
    if (collisionCheck(player, ball)) {
        score += 1;
        ball.x = player.x + player.w + ball.r;
        ball.dx *= -1;
        ball.ddy += -0.05*player.dy;
    }
    if (ball.x < 0) {
        score = 0;
        reset();
    }
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canv.width, canv.height);
    draw_paddle(player);
    draw_ball(ball);
    draw_score();
}

reset();
setInterval(run, 32);

