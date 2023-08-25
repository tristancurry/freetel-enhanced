//Phosphorescent spot object
function Spot (options) {
    var options = options || {};
    this.pos = {...options.pos} || {x:0, y:0, z:0};
    this.alive = options.alive || true;
    this.radius = options.radius || 20;
    if(options.radius == 0) {this.radius = 0;}
    this.colour = options.colour || 'rgba(50,100,255, 0.7)';
    this.decay_time = options.decay_time || 5; //seconds
    this.decay_timer = 0;
}

Spot.prototype.update = function (time_step = 1/60) {
    this.decay_timer += time_step;
    if(this.decay_timer >= this.decay_time) {
        this.unalive();
    }
}

Spot.prototype.render = function (ctx = ctx_exp) {
    //convert natural position to pixel position.
    ///first, get the natural position as a percentage of screen position.
    let pos_rel = {x:0, y:0, z:0};
    for (let dir in pos_rel) {
        pos_rel[dir] = map_p5(this.pos[dir], display_region[dir].min, display_region[dir].max, 0, 1);
    }
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.ellipse(pos_rel.x*ctx.canvas.width, pos_rel.y*ctx.canvas.height, 3, 3, 0, 0, 2*Math.PI);
    ctx.fill();
}

Spot.prototype.unalive = function () {
    this.alive = false;
}