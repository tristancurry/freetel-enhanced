const container = document.querySelector('#threejs-container');


const width = container.clientWidth;
const height = container.clientHeight;

//Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('#00b140');

//Camera
const fov = 45 //Field of View
const aspect = container.clientWidth/container.clientHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clienntWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Cube makin
const screen_geometry = new THREE.BoxGeometry(9, 5.2, 0.1);
const screen_material = new THREE.MeshBasicMaterial({ wireframe: true});
const screen = new THREE.Mesh(screen_geometry, screen_material);
screen.translateX(-1.5);
screen.translateZ(-0.05);
screen.rotateY(2*2*Math.PI/360);
scene.add(screen);

const emitter_geometry = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true);
const emitter = new THREE.Mesh(emitter_geometry, screen_material);
emitter.translateX(6.5);
emitter.rotateZ(Math.PI/2);
scene.add(emitter);

const party_geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);





function createParticle(particle_list) {
    let idx = particle_list.findIndex((particle) => particle.alive == false);

    let p = new THREE.Mesh(party_geo, screen_material);
    p.alive = true;
    p.translateX(6.5);

    if(idx < 0) {
        particle_list.push(p);
        // if(particle_list.length >= MAX_PARTICLES) {
        //     particle_list.shift();
        // }
        scene.add(p);
        
    } else {
        particle_list[idx] = p;
        scene.add(p);
    }


}

let particles = [];


//Rendering
container.append(renderer.domElement);
renderer.render(scene, camera);

pTimer = 0;
pDelay = 50;


function animate() {
    pTimer = (pTimer + 1)%pDelay;
    if(pTimer == 0) {
        createParticle(particles);
    }

    for(let i = 0, l = particles.length; i < l; i++) {
        if(particles[i].alive) {
            particles[i].translateX(-0.04);
            if(particles[i].position.x < -10) {
                particles[i].alive = false;
                scene.remove(particles[i]);
            }
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;

const setSize = (container, camera, renderer) => {
    camera.aspect = container.clientWidth/container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}

class Resizer {
    constructor(container, camera, renderer) {
        setSize(container, camera, renderer);

        window.addEventListener('resize', () => {
            setSize(container, camera, renderer);
            this.onResize();
        });
    }

    onResize () {}
}

const resizer = new Resizer(container, camera, renderer);
resizer.onResize = () => {
    this.animate();
};