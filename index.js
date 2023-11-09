import { genererFigures } from "./figures.js";
import * as THREE from "./lib/three.module.min.js";
import { addToScene } from "./manufacture.js";

// r() yields a float between 0 and 1
// hash yields the token's hash
// please reimplement what you need from there, as the anav
// won't have access to the other methods.

for (let i = 0; i < 5; i++) {
  console.log(r());
}

console.log(hash);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.background = new THREE.Color("white");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(2);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 0, 10);

const figures = genererFigures(hash, false, false);

addToScene(scene, figures);

$hl.token.setTraits(figures.features);
$hl.token.setName(figures.features.name);

console.log(scene);
console.log($hl.token.getTraits());

renderer.render(scene, camera);

$hl.token.capturePreview();
