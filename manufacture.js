import * as THREE from "three";

//base materials
const hatchMaterial = new THREE.MeshBasicMaterial({
  color: "white",
});

const fullMaterial = new THREE.MeshBasicMaterial({
  color: "black",
  side: THREE.DoubleSide,
});

const lineMaterial = new THREE.LineBasicMaterial({
  color: "black",
});

const meshManufacture = (figures, mode) => {
  const meshes = [];

  figures.forEach((fig) => {
    var geometry, edgeGeometry;

    if (fig.geometry.type === "ExtrudeGeometry") {
      var shape = new THREE.Shape();

      fig.geometry.shapeArgs.forEach((d) => shape[d.draw](...d.drawArgs));

      geometry = new THREE.ExtrudeGeometry(shape, fig.geometry.extrudeSettings);

      //      geometry.center();
      edgeGeometry = new THREE.EdgesGeometry(geometry);
    } else {
      // edge zfighting hack

      geometry = new THREE[fig.geometry.type](...fig.geometry.args);
      geometry.center();
      //geometry = calcFaceDirection(geometry, camera);

      edgeGeometry = new THREE.EdgesGeometry(geometry);
    }

    var pos = new THREE.Vector3(fig.pos.x, fig.pos.y, fig.pos.z);
    var rot = new THREE.Vector3(fig.rot.x, fig.rot.y, fig.rot.z);
    var scale;
    if (fig.scale) {
      scale = new THREE.Vector3(fig.scale.x, fig.scale.y, fig.scale.z);
    }
    if (fig.lines && mode === "3D") {
      const line = new THREE.LineSegments(edgeGeometry, lineMaterial);
      line.position.set(pos.x, pos.y, pos.z);
      line.rotation.set(rot.x, rot.y, rot.z);
      if (fig.scale) {
        line.scale.set(scale.x, scale.y, scale.z);
      } else {
        line.scale.set(1, 1, 1);
      }

      // hide lines

      meshes.push(line);
    }

    if (fig.hatch) {
      const hatch = new THREE.Mesh(geometry, hatchMaterial);
      hatch.position.set(pos.x, pos.y, pos.z);
      hatch.rotation.set(rot.x, rot.y, rot.z);
      if (fig.scale) {
        hatch.scale.set(scale.x, scale.y, scale.z);
      }
      meshes.push(hatch);
    }

    if (fig.full) {
      const full = new THREE.Mesh(geometry, fullMaterial);
      full.position.set(pos.x, pos.y, pos.z);
      full.rotation.set(rot.x, rot.y, rot.z);
      if (fig.scale) {
        full.scale.set(scale.x, scale.y, scale.z);
      }
      meshes.push(full);
    }
  });

  return meshes;
};

const addToScene = (scene, genfigs, mode) => {
  const meshes = meshManufacture(genfigs.figures, mode);

  if (mode === "Plottable") {
    const model = new THREE.Group();

    // The scene is viewed from top. Rotate the model
    // to get another perspective.
    model.rotation.x = Math.PI / 2;

    const proj = buildLineProjection(model, meshes);
    scene.add(proj);
  } else {
    meshes.forEach((d) => scene.add(d));
  }
};

export { addToScene };
