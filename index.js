import { genererFigures } from "./figures.js";
import * as THREE from "three";
import { addToScene } from "./manufacture.js";
import { SVGRenderer } from "./lib/SVGRenderer.js";

// r() yields a float between 0 and 1
// hash yields the token's hash
// please reimplement what you need from there, as the anav
// won't have access to the other methods.

// 3D is a perspective camera, Plottable is orthographic
const mode = "Plottable"; // use mode = "3D" to switch to 3D.

// The plottable mode is made possible by Garrett Johnson's (gkjohnson)
// work on three-mesh-bvh and three-edge-projector

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.background = new THREE.Color("white");

const renderer =
  mode === "Plottable"
    ? new SVGRenderer()
    : new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(2);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 4, 0);

camera.lookAt(0, 0, 0);

const figures = genererFigures(hash, false, false);

addToScene(scene, figures, mode);

$hl.token.setTraits(figures.features);
$hl.token.setName(figures.features.name);

console.log($hl.token.getTraits());

console.log("Built with Three.js");

if (mode === "Plottable") {
  console.log("and three-edge-projector by Garrett Johnson");
  function render() {
    if (renderer.domElement.childNodes.length > 0) {
      $hl.token.capturePreview();
    } else {
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
  }
  render();
} else {
  renderer.render(scene, camera);
  $hl.token.capturePreview();
}
