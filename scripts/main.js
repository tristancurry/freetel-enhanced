let canvas_exp = document.createElement('canvas');
canvas_exp.setAttribute('width', 600);
canvas_exp.setAttribute('height', 300);
canvas_exp.style.backgroundColor = 'rgb(0,0,100)';
document.body.appendChild(canvas_exp);

let ctx_exp = canvas_exp.getContext('2d');


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
let aspect_ratio = l_screen/d_plates;
let a_screen = 0; //angle of rotation of screen about vertical axis through centres of plates, degrees
let pos_injection = {x:0, y: 0.0, z:0}; //position in plate region where particles enter
let az_injection = 0; //azimuth angle for injection (degrees clockwise about y-axis)
let alt_injection = 0; //altitude angle for injection (degrees ccw about z-axis)
let dir_injection = {x: Math.cos(toRadians(alt_injection))*Math.cos(toRadians(az_injection)), y: -1*Math.sin(toRadians(alt_injection)), z: Math.cos(toRadians(alt_injection))*Math.sin(toRadians(az_injection))};

//coordinate setup for 'experiment region'. Its z-extent is the same as the distance between the plates.
let exp_region = {
    x: {min: 0, max: l_screen},
    y: {min: -0.5*d_plates, max: 0.5*d_plates},
    z: {min: -0.5*d_plates, max: 0.5*d_plates}
}


//Initial voltages. These are user adjustable.
let V_accelerator = 1000; //where outlet is positive
let V_plates = 2000; //where top is most positive

//Initial coil current. User adjustable.
let I_coils = 0; 

let I_req = Math.sqrt(m_e/(2*V_accelerator*q_e))*V_plates*R_coils/((0.8**1.5)*mu_0*n_coils*d_plates);
console.log(I_req);

//time slowdown factor
let time_slowdown = 1e-9;


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
    return(fields);
}


function calculate_charge_velocity (V, q, m) {
    let En_K = q*V;
    let velocity = Math.sqrt(En_K*2/m);
    return velocity; 
}

// Generally helpful functions

function toRadians (a) {
    return (2*Math.PI*a/360);
}

let map_p5 = function (value, oldMin, oldMax, newMin, newMax) {
  let prop = (value - oldMin)/(oldMax - oldMin);
  let newVal = prop*(newMax - newMin) + newMin;
  return newVal;
}




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

Particle.prototype.unalive = function () {
    this.alive = false;
}

Particle.prototype.render = function (target_width = l_screen, target_height = d_plates) {
    //convert natural position to pixel position.
    ///first, get the natural position as a percentage of screen position.
    let pos_rel = {x:0, y:0, z:0};
    for (let dir in pos_rel) {
        pos_rel[dir] = map_p5(this.pos[dir], exp_region[dir].min, exp_region[dir].max, 0, 1);
    }
    ctx_exp.beginPath();
    ctx_exp.strokeStyle = 'rgb(255,255,255)';
    ctx_exp.ellipse(pos_rel.x*canvas_exp.width, pos_rel.y*canvas_exp.height, 5, 5, 0, 0, 2*Math.PI);
    ctx_exp.stroke();
}

function createParticle (options, particle_list = []) {
    var options = options || {};
    this.q = options.q || q_e;
    if (options.q == 0) {this.q = 0;}
    this.mass = options.mass || m_e;
    if (options.mass <= 0) {this.mass = m_e;}
    this.pos = options.pos || {x:0, y:0, z:0};
    this.vel = options.vel || {x:0, y:0, z:0};  
    this.alive = options.alive || true;
    let p = new Particle(options);

    let idx = particle_list.findIndex((particle) => particle.alive == false);

    if(idx < 0) {
        particle_list.push(p);

    } else {
        particle_list[idx] = p;
    }

}

//Control logic

let check_V_sync = document.getElementById('check_V_sync');
let V_syncing = false;

let reverse_V_plates = document.getElementById('reverse_V_plates');
let reverse_I_coil = document.getElementById('reverse_I_coil');

let display_V_acc = document.getElementById('display_V_acc');
let display_V_plates = document.getElementById('display_V_plates');
let display_I_coils = document.getElementById('display_I_coils');



let slider_V_acc = document.getElementById('slider_V_acc');
slider_V_acc.value = V_accelerator;
slider_V_acc.addEventListener('input', () => {
    V_accelerator = parseFloat(slider_V_acc.value);
    display_V_acc.innerText = V_accelerator.toFixed(3);

    //handle synchronisation
    if(check_V_sync.checked) {
        if(!V_syncing) {
            V_syncing = true;
            slider_V_plates.value = slider_V_acc.value;
            //dispatch event to slider_V_plates
            slider_V_plates.dispatchEvent(new Event('input'));
        } else {
            V_syncing = false;
        }
    }
});


let slider_V_plates = document.getElementById('slider_V_plates');
slider_V_plates.value = V_plates
slider_V_plates.addEventListener('input', () => {
    let sign = 1;
    if(reverse_V_plates.checked) {sign = -1;}

    V_plates = sign*slider_V_plates.value;
    display_V_plates.innerText = V_plates.toFixed(3);

    fieldies = calculate_fields();

    //handle synchronisation
    if(check_V_sync.checked) {
        if(!V_syncing) {
            V_syncing = true;
            slider_V_acc.value = slider_V_plates.value;
            //dispatch event to slider_V_acc
            slider_V_acc.dispatchEvent(new Event('input'));
        } else {
            V_syncing = false;
        }
    }
});

let slider_I_coils = document.getElementById('slider_I_coils');


slider_I_coils.addEventListener('input', () => {
    let sign = 1;
    if(reverse_I_coils.checked) {sign = -1;}
    I_coils = sign*slider_I_coils.value;
    display_I_coils.innerText = I_coils.toFixed(3);

    fieldies = calculate_fields();
});


//Initialise simulation

let fieldies = calculate_fields();
if(V_plates < 0) {
    
}





let particles = [];




let particle_release_timer = 0;
let particle_release_delay = 10; //how many frames to wait before releasing a particle
let dt = (1/60)*time_slowdown/physics_steps;


function animate () {

    ctx_exp.clearRect(0,0, canvas_exp.width, canvas_exp.height);

    if (particle_release_timer == 0 && V_accelerator > 0) {
        let p_speed = calculate_charge_velocity(V_accelerator, q_e, m_e);
        let p_vel = {x:0,y:0,z:0};
        for (let dir in dir_injection) {
            p_vel[dir] = p_speed*dir_injection[dir];
        }
        createParticle({pos: pos_injection, vel: p_vel}, particles);

    }

    for (let i  = 0; i < physics_steps; i++) {
        for (j = 0, l = particles.length; j < l; j++) {
            let particle = particles[j];
            if (particle.alive) {
                particle.update(fieldies, dt);
                for (let dir in exp_region) {
                    if(
                        particle.pos[dir] < exp_region[dir].min - 0.02 ||
                        particle.pos[dir] > exp_region[dir].max + 0.02
                    ) {
                        particle.unalive();
                    } 
                }
            }
        }

    }
    for (j = 0, l = particles.length; j < l; j++) {
        if(particles[j].alive) {
            particles[j].render();
        }

    }

    particle_release_timer = (particle_release_timer + 1)%particle_release_delay;

    requestAnimationFrame(animate);
}

animate();