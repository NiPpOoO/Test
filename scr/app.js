import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Свет
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Загрузка скана кабинета
  const loader = new GLTFLoader();
  loader.load('assets/room.glb', (gltf) => {
    scene.add(gltf.scene);
  });

  // Украшение: glowing cube
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc, emissive: 0x00ffcc });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 1, -1); // над столом
  scene.add(cube);

  function animate() {
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  document.getElementById('enter-ar').addEventListener('click', () => {
    renderer.xr.setSessionInit({ optionalFeatures: ['local-floor', 'bounded-floor'] });
    navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] })
      .then(session => renderer.xr.setSession(session));
  });
}

init();
