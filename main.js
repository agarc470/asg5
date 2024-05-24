import * as THREE from 'three';
import { OrbitControls } from 'OrbitControl';
import { OBJLoader } from 'OBJLoader';
import { MTLLoader } from 'MTLLoader';
function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight); // set renderer to full screen
    document.body.style.margin = '0'; // remove margin to fill full window

    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 10, 20 );

    const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();
    const scene = new THREE.Scene();

    // load a single image as a skybox using CubeTextureLoader
    const skyboxLoader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyboxLoader.load([
        'sky.jpg', // pos-x
        'sky.jpg', // neg-x
        'sky.jpg', // pos-y
        'sky.jpg', // neg-y
        'sky.jpg', // pos-z
        'sky.jpg'  // neg-z
    ]);
    scene.background = skyboxTexture;

    {

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( './checker.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		texture.colorSpace = THREE.SRGBColorSpace;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}
    
   // Directional light
    const dirLightColor = 0xFFFFFF;
    const dirLightIntensity = 3;
    const dirLight = new THREE.DirectionalLight(dirLightColor, dirLightIntensity);
    dirLight.position.set(-1, 2, 4);
    scene.add(dirLight);
    
    // Ambient light
    const ambLightColor = 0xFFFFFF;
    const ambLightIntensity = .45;
    const ambLight = new THREE.AmbientLight(ambLightColor, ambLightIntensity);
    scene.add(ambLight);

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
    cube.position.set(1, 1, 0); 
    scene.add(cube);
    // Sphere
    const radius = 0.5;
    const segments = 16;
    const geometrySphere = new THREE.SphereGeometry(radius, segments, segments);
    const materialSphere = new THREE.MeshPhongMaterial({ color: 0xaa8844 }); // brownish yellow
    const sphere = new THREE.Mesh(geometrySphere, materialSphere);
    sphere.position.set(1.85, 1, 0); 
    scene.add(sphere);

    // Cylinder
    const cylinderHeight = 1.5;
    const cylinderRadius = 0.25;
    const cylinderSegments = 32;
    const geometryCylinder = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, cylinderSegments);
    const materialCylinder = new THREE.MeshPhongMaterial({ color: 0x8888aa }); // bluish grey
    const cylinder = new THREE.Mesh(geometryCylinder, materialCylinder);
    cylinder.position.set(-1.85, 1, 0); 
    scene.add(cylinder);

    const mtlLoader = new MTLLoader();
    mtlLoader.load('Car.mtl', (mtl) => {

        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('Car.obj', (car) => {
            car.scale.set(.5, .5, .5);
            car.position.set(0, 0, 0);
            car.rotation.y = Math.PI / 4;
            scene.add(car);

            // set up the spotlight
            const spotLight = new THREE.SpotLight(0xFFFFFF, 5);
            spotLight.position.set(car.position.x, car.position.y + 1, car.position.z);  // positioned 1 unit above car
            spotLight.target = car;
            scene.add(spotLight);
        });
    });

    window.addEventListener('resize', () => resizeRendererToDisplaySize(renderer), false);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const shapes = [];  // array to hold shapes and their orbit data

    // add random shapes
    for (let i = 0; i < 20; i++) {
        const shapeData = createRandomShape();
        scene.add(shapeData.mesh);
        shapes.push(shapeData);
    }


    function render(time) {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        time *= 0.001; 
        
        const radius = 2;  
        const speed = 2;  
        
        sphere.rotation.x = time * 2;
        sphere.rotation.y = time * 2;
        sphere.position.x = radius * Math.cos(time * speed);
        sphere.position.z = radius * Math.sin(time * speed);

        cube.rotation.x = time;
        cube.rotation.y = time;
        cube.position.x = (radius+1) * Math.cos(time * speed);
        cube.position.z = (radius+1) * Math.sin(time * speed);

        cylinder.rotation.x = time;
        cylinder.rotation.y = time;
        cylinder.position.x = (radius+2) * Math.cos(time * speed);
        cylinder.position.z = (radius+2) * Math.sin(time * speed);

        shapes.forEach(shape => {
            shape.mesh.position.x = shape.posX + Math.cos(time * shape.speed *25) * 5; // radius of 5
            shape.mesh.position.z = shape.posZ + Math.sin(time * shape.speed *25) * 5;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();

function createRandomShape() {
    const shapeTypes = ['box', 'sphere', 'cylinder'];
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    let geometry;
    let color = new THREE.Color(Math.random(), Math.random(), Math.random());
    let material = new THREE.MeshPhongMaterial({ color });

    switch (type) {
        case 'box':
            geometry = new THREE.BoxGeometry(Math.random() + 0.5, Math.random() + 0.5, Math.random() + 0.5);
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(Math.random() + 0.5, 16, 16);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(Math.random() + 0.5, Math.random() + 0.5, Math.random() * 2 + 1, 16);
            break;
    }

    const mesh = new THREE.Mesh(geometry, material);
    let posX, posY, posZ;
    let distance, speed;
    do {
        posX = (Math.random() - 0.5) * 20;
        posY = (Math.random() + 0.25) * 5;
        posZ = (Math.random() - 0.5) * 20;
        distance = Math.sqrt(posX * posX + posZ * posZ);
        speed = Math.random() * 0.05 + 0.01;  // Random speed for orbiting
    } while (distance < 2);

    mesh.position.set(posX, posY, posZ);
    return {mesh, posX, posY, posZ, speed};
}


