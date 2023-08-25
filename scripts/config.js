//World Parameters
const display_width = 0.13 //metres
const display_height = 0.10// metres

const MAX_PARTICLES = 500;
const MAX_VOLTAGE = 5000;
const MAX_CURRENT = 3;

//Physical constants
let mu_0 = Math.PI*4.0e-7; //magnetic permeability of vacuum
let q_e = 1.6e-19; //electronic charge, C
let m_e = 9.11e-31; //electronic mass, m

//Physical construction
let exp_region_width = 0.12 // width in metres of the region in which the fields are approximately uniform
let exp_region_height = 0.052 // height in metres of the region in which there are approx. uniform fields. This'll be about the same as the plate separation.
let d_plates = 0.052; // separation of screen plates, metres
let l_screen = 0.09; //length of screen, metres
let margin = 0.5*(exp_region_width - l_screen); //metres
let x_screen_axis = 0.07; //x-position of central axis of screen, metres 

let R_coils = 0.07; // coil radius, m
let n_coils = 320; // number of turns in coil

let aspect_ratio = display_width/display_height;
let a_screen = 0.1; //angle of rotation of screen about vertical axis through centres of plates, degrees
let pos_injection = {x:0, y: 0.0, z:0}; //position in plate region where particles enter
let az_injection = 0; //azimuth angle for injection (degrees clockwise about y-axis)
let alt_injection = 0; //altitude angle for injection (degrees ccw about z-axis)
let dir_injection = {x: Math.cos(toRadians(alt_injection))*Math.cos(toRadians(az_injection)), y: -1*Math.sin(toRadians(alt_injection)), z: Math.cos(toRadians(alt_injection))*Math.sin(toRadians(az_injection))};
let pos_variability = {x:0, y: 0.0002, z: 0.00017};
let direction_variability = {x:0.00, y:0.00, z: 0.000};
let speed_variability = 0.02;
let phosphor_persistence = 4; //seconds in real time for a spot to remain on the screen

//coordinate setup for various regions.
let display_region = {
    x: {min: 0, max: display_width},
    y: {min: -0.5*display_height, max: 0.5*display_height},
    z: {min: -0.5*display_height, max: 0.5*display_height}
};


let exp_region = {
    x: {min: x_screen_axis - 0.5*exp_region_width, max: x_screen_axis + 0.5*exp_region_width},
    y: {min: -0.5*display_height, max: 0.5*display_height},
    z: {min: -0.1*d_plates, max: 0.1*d_plates}
};

let screen_region = {
    x: {min: x_screen_axis - 0.5*l_screen*Math.cos(toRadians(a_screen)), max: x_screen_axis + 0.5*l_screen*Math.cos(toRadians(a_screen))},
    y: {min: -0.5*d_plates, max: 0.5*d_plates},
    z: {min: -0.1*d_plates, max: 0.1*d_plates}
};

//Initial voltages
let V_accelerator = 1000; //where outlet is positive
let V_plates = 0; //where top is most positive

//Initial coil current
let I_coils = 0; 

//time slowdown factor
let time_slowdown = 1e-8;

//number of calculation cycles per frame
let physics_steps = 10;

let particle_release_timer = 0;
let particle_release_delay = 2; //how many frames to wait before releasing a particle. This will eventually be dictated by a filament current as a per-second rate
let dt = (1/60)*time_slowdown/physics_steps;