var canv = document.getElementById('anim-canv');
canv.height = canv.clientHeight * 5;
canv.width = canv.clientWidth * 5;
var ctx = canv.getContext('2d');
ctx.lineWidth = 5;

var n_points = 1000; // divide x axis

x_fn = function(x) {return 10*x + 10 / (1 + Math.exp(-(x - 0.5)/0.05))};
win = function(x) {return Math.exp(-(((x - 0.5)/0.25)**2))};

var get_coords = function(x, t) {
  x_coord = x * canv.width;
  y = win(x)*Math.sin(x_fn(x) - t*5);
  y_coord = (0.1 + 0.8 * (y + 1) / 2) * canv.height;
  return {
    x: x_coord,
    y: y_coord
  }
}

var animate = function() {
  var t = performance.now() / 1000;
  ctx.clearRect(0, 0, canv.width, canv.height);
  ctx.beginPath();
  var coords = get_coords(0, t);
  ctx.moveTo(coords.x, coords.y);
  var i;
  for (i = 1; i <= n_points; i++) {
    coords = get_coords(i / n_points, t);
    ctx.lineTo(coords.x, coords.y);
    // ctx.rect(coords.x - 1, coords.y - 1, 2, 4);
    // ctx.fillRect(coords.x, coords.y, 4, 4);
  }
  ctx.stroke();
}
setInterval(animate, 32);