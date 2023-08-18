//World Parameters

//Physical constants
let mu_0 = Math.PI*4.0e-7; //magnetic permeability of vacuum
let q_e = 1.6e-19; //electronic charge, C
let m_e = 9.11e-31; //electronic mass, m

//Physical construction
let R_coils = 0.07; // coil radius, m
let n_coils = 320; // number of turns in coil
let d_plates = 0.05; // separation of screen plates, metres

//Initial voltages. These are user adjustable.
let V_accelerator = 1000; //where outlet is positive
let V_plates = 2000; //where top is most positive

//Initial coil current. User adjustable.
let I_coils = 3; 


//field calculations
function calculate_E_field (V, distance) {
    let E = V/distance;
    return E;
}

function calculate_B_field (n, I, R) {
    let B = (0.8**1.5)*mu_0*n*I/R;
    return B;
}

function calculate_fields () { //this could be called every frame. Or, triggered by inputs on the controls.
    let E = calculate_E_field (V_plates, d_plates);
    let B = calculate_B_field (n_coils, I_coils, R_coils);
}


function calculate_charge_velocity (V, q, m) {
    let En_K = q*V;
    let velocity = Math.sqrt(En_K*2/m);
    return velocity; 
} //this might have to belong to the Particle, instead...

