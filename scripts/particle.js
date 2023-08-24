//Particle object

function Particle (options) {
    var options = options || {};
    this.q = options.q || q_e;
    if (options.q == 0) {this.q = 0;}
    this.mass = options.mass || m_e;
    if (options.mass <= 0) {this.mass = m_e;}
    this.pos = {...options.pos} || {x:0, y:0, z:0};
    this.vel = {...options.vel} || {x:0, y:0, z:0};  
    this.alive = options.alive || true;
}

Particle.prototype.update = function (fields = {E: {x:0,y:0,z:0}}, time_step = 1/60) {
    //if particle 'alive'
    //find acceleration due to fields
    //apply acceleration to velocity
    //apply velocity to position
    if (this.alive) {
        let accn_E = {x:0, y:0, z:0};
        for (let f in fields) {
            if (f == "E") {
                let fE = fields[f];
                for (let dir in fE) {
                    accn_E[dir] = this.q*fE[dir]/this.mass;
                    this.vel[dir] += accn_E[dir]*time_step;
                }
            } else if (f == "B") {

                let fB = fields[f];
                let accn_B = {x:0,y:0,z:0};
                //do cross-product of particle velocity with B-field
                accn_B.x = this.vel.y*fB.z;
                accn_B.y = -1*this.vel.x*fB.z;
                accn_B.z = this.vel.x*fB.y;
                let velOldSq = (this.vel.x**2) + (this.vel.y**2) + (this.vel.z**2);
                for (let dir in accn_B) {
                    accn_B[dir]*=this.q/this.mass;
                    this.vel[dir] += accn_B[dir]*time_step;
                }
                let velNewSq = (this.vel.x**2) + (this.vel.y**2) + (this.vel.z**2);
                //deal with accidental energy injections by B-field
                if (velOldSq != velNewSq) {
                    let speed_reduction = Math.sqrt(velOldSq/velNewSq);
                    for (let dir in this.vel) {
                        this.vel[dir] = speed_reduction*this.vel[dir];
                    }
                }
            }
        }

        for (let dir in this.pos) {
            this.pos[dir] += this.vel[dir]*time_step;
        }
    }
}

Particle.prototype.unalive = function () {
    this.alive = false;
}

Particle.prototype.render = function (ctx = ctx_exp) {
    //convert natural position to pixel position.
    ///first, get the natural position as a percentage of screen position.
    let pos_rel = {x:0, y:0, z:0};
    for (let dir in pos_rel) {
        pos_rel[dir] = map_p5(this.pos[dir], display_region[dir].min, display_region[dir].max, 0, 1);
    }
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.ellipse(pos_rel.x*ctx.canvas.width, pos_rel.y*ctx.canvas.height, 5, 5, 0, 0, 2*Math.PI);
    ctx.stroke();
}