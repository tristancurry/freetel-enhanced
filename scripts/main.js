//World Parameters

//Physical constants
let mu_0 = Math.PI*4.0e-7; //magnetic permeability of vacuum
let q_e = 1.6e-19; //electronic charge, C
let m_e = 9.11e-31; //electronic mass, m

//Physical construction
let R_coils = 0.07; // coil radius, m
let n_coils = 320; // number of turns in coil
let d_plates = 0.05; // separation of screen plates, metres
let l_screen = 0.10; //length of screen, metres
let a_screen = 0; //angle of rotation of screen about vertical axis through centres of plates, degrees

//Initial voltages. These are user adjustable.
let V_accelerator = 1000; //where outlet is positive
let V_plates = 1000; //where top is most positive

//Initial coil current. User adjustable.
let I_coils = 2; 

//time slowdown factor
let time_slowdown = 1e-6;


//number of calculation cycles per frame
let physics_steps = 10;

//field calculations
//this could be written as vector equations or simply assume this is the field in the 'direction of uniformity'.
function calculate_E_field (V, distance) {
    let E = V/distance;
    return E;
}

function calculate_B_field (n, I, R) {
    let B = (0.8**1.5)*mu_0*n*I/R;
    return B;
}


function calculate_fields () { //this could be called every frame. Or, triggered by inputs on the controls.
    let E = {x: 0, y: calculate_E_field (V_plates, d_plates), z: 0};
    let B = {x: 0, y:0, z: calculate_B_field (n_coils, I_coils, R_coils)};
    let fields = {E, B};
    console.log(fields);
    return(fields);
}


function calculate_charge_velocity (V, q, m) {
    let En_K = q*V;
    let velocity = Math.sqrt(En_K*2/m);
    return velocity; 
}


function Particle (options) {
    var options = options || {};
    this.q = options.q || q_e;
    if (options.q == 0) {this.q = 0;}
    this.mass = options.mass || m_e;
    if (options.mass <= 0) {this.mass = m_e;}
    this.pos = options.pos || {x:0, y:0, z:0};
    this.vel = options.vel || {x:0, y:0, z:0};  
    this.alive = options.alive || true;
}

Particle.prototype.update = function (fields = {E: {x:0,y:0,z:0}}, time_step = 1/60) {
    //if particle 'alive'
    //find acceleration due to fields
    //apply acceleration to velocity
    //apply velocity to position
    if (this.alive) {
        let accn = {x:0, y:0, z:0};
        for (let f in fields) {
            if (f == "E") {
                let fE = fields[f];
                for (let dir in fE) {
                    accn[dir] += this.q*fE[dir]/this.mass;
                }
            } else if (f == "B") {
                //vx Bz => ay
                //vx By => -az
                //vy Bx => az
                //vy Bz => -ax
                //vz Bx => -ay
                //vz By => ax
                let fB = fields[f];
                let accn_B = {x:0,y:0,z:0};
                accn_B.x = this.vel.y*fB.z;
                accn_B.y = -1*this.vel.x*fB.z;
                accn_B.z = this.vel.x*fB.y;
                for (let dir in accn_B) {
                    accn_B[dir]*=this.q/this.mass;
                    accn[dir] += accn_B[dir];
                }
            }
        }

        for (let dir in accn) {
            this.vel[dir] += accn[dir]*time_step;
            this.pos[dir] += this.vel[dir]*time_step;
        }
    }
}

let fieldies = calculate_fields();
// let electron_speed = calculate_charge_velocity(V_accelerator, q_e, m_e);
let party = new Particle();
party.vel.x = calculate_charge_velocity(V_accelerator, party.q, party.mass);


function animate () {
    for (let i  = 0; i < physics_steps; i++) {
        party.update(fieldies, (1/60)*time_slowdown/physics_steps);
    }

    console.log(party.vel);
    requestAnimationFrame(animate);
}

animate();