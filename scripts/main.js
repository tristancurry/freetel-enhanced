let canvas_exp = document.getElementById('canvas_exp');
canvas_exp.setAttribute('width', 600);
canvas_exp.setAttribute('height', canvas_exp.width/aspect_ratio);
canvas_exp.style.backgroundColor = 'rgb(0,0,100)';


let ctx_exp = canvas_exp.getContext('2d');
ctx_exp.globalCompositeOperation = "screen";


//screen equation calculation
function calculate_screen_equation () {
    let slope = -1*Math.tan(toRadians(a_screen));
    let intercept = -1*slope*x_screen_axis;
    return {slope, intercept};
}

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
    let I_req = Math.sqrt(m_e/(2*V_accelerator*q_e))*V_plates*R_coils/((0.8**1.5)*mu_0*n_coils*d_plates);
console.log(`Under these conditions, I_coils needed for zero deflection is ${I_req.toFixed(3)}A`);
    return(fields);
}

function calculate_charge_speed (V, q, m) {
    let En_K = q*V;
    let speed = Math.sqrt(En_K*2/m);
    return speed; 
}

function normalise_vector (direction = {x: 1, y: 0, z: 0}) {
    //normalise direction vector
    let norm_dir = {x: 0, y: 0, z: 0};
    direction_mag = Math.sqrt(direction.x**2 + direction.y**2 + direction.z**2);
    for (let dir in direction) {
        norm_dir[dir] = direction[dir]/direction_mag;
    }
    return norm_dir;
}


function calculate_charge_velocity (speed = 0, direction = {x: 1, y: 0, z: 0}, normalised = false) {
    //normalise direction vector
    let new_dir = {...direction};
    if(!normalised) {
        new_dir = normalise_vector(direction);
    }

    let velocity = {}
    for (let dir in new_dir) {
        velocity[dir] = speed*new_dir[dir];
    }
    return velocity;
}

function createParticle (options, particle_list = []) {
    let p = new Particle(options);

    let idx = particle_list.findIndex((particle) => particle.alive == false);

    if(idx < 0) {
        particle_list.push(p);
        if(particle_list.length >= MAX_PARTICLES) {
            particle_list.shift();
        }
    } else {
        particle_list[idx] = p;
    }
}

function createSpot (options, spot_list = []) {
    let s = new Spot(options);
    let idx = spot_list.findIndex((spot) => spot.alive == false);

    if(idx < 0) {
        spot_list.push(s);
    } else {
        spot_list[idx] = s;
    }
}

//Control logic

let check_V_sync = document.getElementById('check_V_sync');
let V_syncing = false;
check_V_sync.addEventListener('change', () => {
    slider_V_plates.dispatchEvent(new Event('input'));
});

let reverse_V_plates = document.getElementById('reverse_V_plates');
let reverse_I_coil = document.getElementById('reverse_I_coil');

reverse_V_plates.addEventListener('change', () => {
    slider_V_plates.dispatchEvent(new Event('input'));
});

reverse_I_coils.addEventListener('change', () => {
    slider_I_coils.dispatchEvent(new Event('input'));
});

let display_V_acc = document.getElementById('display_V_acc');
let display_V_plates = document.getElementById('display_V_plates');
let display_I_coils = document.getElementById('display_I_coils');



let slider_V_acc = document.getElementById('slider_V_acc');
slider_V_acc.max = MAX_VOLTAGE;
slider_V_acc.value = V_accelerator;
slider_V_acc.addEventListener('input', () => {
    V_accelerator = parseFloat(slider_V_acc.value);
    display_V_acc.innerText = V_accelerator.toFixed(3);

    //handle synchronisation of voltage controls
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
slider_V_plates.max = MAX_VOLTAGE;
slider_V_plates.value = V_plates
slider_V_plates.addEventListener('input', () => {
    let sign = 1;
    if(reverse_V_plates.checked) {sign = -1;}

    V_plates = sign*slider_V_plates.value;
    display_V_plates.innerText = V_plates.toFixed(3);

    fieldies = calculate_fields();

    //handle synchronisation of voltage controls
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
slider_I_coils.max = MAX_CURRENT;


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
    reverse_V_plates.checked = true;
}
if(I_coils < 0) {
    reverse_I_coils.checked = true;
}

slider_V_acc.value = V_accelerator;
slider_V_plates.value = Math.abs(V_plates);
slider_I_coils.value = Math.abs(I_coils)

slider_V_acc.dispatchEvent(new Event('input'));
slider_V_plates.dispatchEvent(new Event('input'));
slider_I_coils.dispatchEvent(new Event('input'));

let particles = [];
let spots = [];

let screen_params = calculate_screen_equation();
let screen_display_dimensions = {};




function animate () {

    ctx_exp.clearRect(0,0, canvas_exp.width, canvas_exp.height);
    ctx_exp.beginPath();


    if (particle_release_timer == 0 && V_accelerator > 0) {
        let p_speed = calculate_charge_speed(V_accelerator, q_e, m_e) * (1 + speed_variability*(-0.5 + Math.random()));

        //modify dir_injection by random variability ('beam width') in each coordinate axis...
        let new_dir = {x:0, y:0, z:0};
        for (let dir in dir_injection) {
            new_dir[dir] = dir_injection[dir] + (direction_variability[dir]*(-0.5 + Math.random()));
        }
        
        let p_vel = calculate_charge_velocity(p_speed, new_dir);

        //set injection position of new particle
        let p_pos = {x:0, y:0, z:0};
        for (let dir in p_pos) {
            p_pos[dir] = pos_injection[dir] + (-0.5 + Math.random())*pos_variability[dir];
        }

        createParticle({pos: p_pos, vel: p_vel}, particles);
    }

    for (let i  = 0; i < physics_steps; i++) {
        for (j = 0, l = particles.length; j < l; j++) {
            let particle = particles[j];
            if (particle.alive) {
                //decide which fields to apply...
                //if outside screen region - only B
                //if outside experiment region - nothing
                //if far outside display region, unalive.
                let pos_code = 0;
                let applied_fields = {};

                for (let dir in particle.pos) {
                    if(
                        particle.pos[dir] >= screen_region[dir].min &&
                        particle.pos[dir] <= screen_region[dir].max
                    ) {pos_code++;}
                    if(
                        particle.pos[dir] >= exp_region[dir].min &&
                        particle.pos[dir] <= exp_region[dir].max
                    ) {pos_code++;}
                    if(
                        particle.pos[dir] >= display_region[dir].min &&
                        particle.pos[dir] <= display_region[dir].max
                    ) {pos_code++;}
                }

                if(pos_code == 9) {
                    //particle within screen region
                    applied_fields = {...fieldies};
                } else if (pos_code >= 6) {
                    //particle within experiment region
                    applied_fields = {...fieldies};
                } else {
                    applied_fields = {}
                }
                
                particle.update(applied_fields, dt);

                if(pos_code < 3) {
                    //particle no longer in display region (plus margins)
                    particle.unalive();
                }

                if (
                    pos_code == 9 &&
                    particle.pos.z >= screen_params.slope*particle.pos.x + screen_params.intercept         
                ) {
                    //back-project the particle's velocity to find out where it intercepted the screen?
                    //need to find a delta-t for intercept then apply to each component of velocity
            
                    createSpot({pos: {...particle.pos}, decay_time: phosphor_persistence}, spots);
                    particle.unalive();

                }
            }
        }


    }

    for (i = 0, l = particles.length; i < l; i++) {
        if(particles[i].alive) {
            particles[i].render();
        }
    }

    for (i = 0, l = spots.length; i < l; i++) {
        if (spots[i].alive) {
            spots[i].update();
            spots[i].render();
        }
    }

    particle_release_timer = (particle_release_timer + 1)%particle_release_delay;

    requestAnimationFrame(animate);
}

animate();