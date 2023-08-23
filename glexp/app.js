const container = document.querySelector('#threejs-container');


const width = container.innerWidth;
const height = container.innerHeight;

//Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color('#00b140');

//Camera
const fov = 45 //Field of View
const aspect = window.innerWidth/window.innerHeight;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 10);

//Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.innerWidth, container.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Cube makin
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({ wireframe: true});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//Rendering
container.append(renderer.domElement);
renderer.render(scene, camera);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
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