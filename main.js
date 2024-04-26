import * as THREE from 'three';
import { OBJLoader } from '/OBJLoader.js';
import { MTLLoader } from '/MTLLoader.js';
function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

    const fov = 75;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // Cube
    const boxWidth = .75;
    const boxHeight = .75;
    const boxDepth = .75;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const loader = new THREE.TextureLoader();
    const texture = loader.load('lava.png');
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({
        map: texture
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1;
    scene.add(cube);
    // Sphere
    const radius = 0.5;
    const segments = 16;
    const geometrySphere = new THREE.SphereGeometry(radius, segments, segments);
    const materialSphere = new THREE.MeshPhongMaterial({ color: 0xaa8844 }); // brownish yellow
    const sphere = new THREE.Mesh(geometrySphere, materialSphere);
    sphere.position.x = 1.85;
    scene.add(sphere);

    // Cylinder
    const cylinderHeight = 1.5;
    const cylinderRadius = 0.25;
    const cylinderSegments = 32;
    const geometryCylinder = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, cylinderSegments);
    const materialCylinder = new THREE.MeshPhongMaterial({ color: 0x8888aa }); // bluish grey
    const cylinder = new THREE.Mesh(geometryCylinder, materialCylinder);
    cylinder.position.x = -1.85; // Position to the left
    scene.add(cylinder);

    const mtlLoader = new MTLLoader();
    mtlLoader.load('/Car.mtl', (mtl) => {

        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('Car.obj', (car) => {
            // Scale the car - replace x, y, z with your desired scale factors
            car.scale.set(.5, .5, .5);

            // Position the car - replace x, y, z with your desired coordinates
            car.position.set(0, -0.75, 0);

            // Rotate the car if needed - replace x, y, z with rotation angles in radians
            car.rotation.y = Math.PI / 4;
            scene.add(car);

        });
    });

    function render(time) {

        time *= 0.001; // convert time to seconds

        cube.rotation.x = time;
        cube.rotation.y = time;

        sphere.rotation.x = time * 2;
        sphere.rotation.y = time * 2;
        sphere.position.y = Math.sin(time) * 0.25;

        cylinder.rotation.x = time;
        cylinder.rotation.y = time;

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
