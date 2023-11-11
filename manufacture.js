import * as THREE from "./lib/three.module.min.js";
import * as BufferGeometryUtils from "./lib/BufferGeometryUtils.js";

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

//plottable
function calcFaceDirection(geometry, camera) {
  const position = geometry.getAttribute("position");

  const colors = [];
  let cnt = 0;
  let verts = [];

  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i);
    let y = position.getY(i);
    let z = position.getZ(i);

    verts.push([x, y, z]);

    switch (cnt) {
      case 0:
      case 1:
        cnt++;
        break;
      case 2:
        const triangle = new THREE.Triangle();
        triangle.a = new THREE.Vector3(...verts[0]);
        triangle.b = new THREE.Vector3(...verts[1]);
        triangle.c = new THREE.Vector3(...verts[2]);

        const n = new THREE.Vector3();
        const v = new THREE.Vector3();

        triangle.getNormal(n);

        triangle.getMidpoint(v);
        v.subVectors(camera.position, v);

        const sign = n.dot(v);

        let color = new THREE.Color();

        if (sign >= 0) {
          color.setRGB(1, 0, 0);
        } else {
          color.setRGB(1, 1, 1);
        }

        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);

        cnt = 0;
        verts = [];
        break;
    }
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
}

const mergeGeometries = (figures) => {
  const geometries = [];

  figures.forEach((d) => {
    // check if merged group
    if (d.userData.groupMerged) {
      // if it's a group, it can be pushed to merge as such
      geometries.push(d);
    } else {
      // if it's not a group
      // check if it's a simple mesh
      // or an instanced one

      if (!d.isInstancedMesh) {
        // if it's a simple mesh
        d.updateMatrixWorld(true);

        var cloned = d.geometry.clone();

        cloned.applyMatrix4(d.matrixWorld);

        for (const key in cloned.attributes) {
          if (key !== "position" /* || key !== "rotation"*/) {
            cloned.deleteAttribute(key);
          }
        }

        // if (cloned.index) {
        cloned = cloned.toNonIndexed();
        cloned.index = null;
        //}

        geometries.push(cloned);
      } else if (d.instanceMatrix) {
        // if it's an instanced mesh

        var count = monochrome
          ? d.instanceMatrix.count
          : Math.floor(d.instanceMatrix.count / 2);

        for (let i = 0; i < count; i++) {
          var cloned = d.geometry.clone();
          var matrix = new THREE.Matrix4();
          d.getMatrixAt(i, matrix);
          cloned.applyMatrix4(matrix);

          for (const key in cloned.attributes) {
            if (key !== "position" /*|| key !== "rotation"*/) {
              cloned.deleteAttribute(key);
            }
          }

          cloned = cloned.toNonIndexed();

          cloned.index = null;

          geometries.push(cloned);
        }
      }
    }
  });

  return BufferGeometryUtils.mergeGeometries(geometries, false);
};

// not plottable
const meshManufacture = (figures) => {
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
    if (fig.lines) {
      const line = new THREE.LineSegments(edgeGeometry, lineMaterial);
      line.position.set(pos.x, pos.y, pos.z);
      line.rotation.set(rot.x, rot.y, rot.z);
      if (fig.scale) {
        line.scale.set(scale.x, scale.y, scale.z);
      } else {
        line.scale.set(1, 1, 1);
      }

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

const addToScene = (scene, genfigs, camera, plottable) => {
  const meshes = meshManufacture(genfigs.figures, camera);

  if (plottable) {
    const mergedGeometry = mergeGeometries(meshes);

    //calcFaceDirection(mergedGeometry, camera);

    const content = new THREE.Mesh(mergedGeometry, hatchMaterial);

    const line = new THREE.LineSegments(mergedGeometry, lineMaterial);

    scene.add(content, line);
  } else {
    meshes.forEach((d) => scene.add(d));
  }
};

export { addToScene };
