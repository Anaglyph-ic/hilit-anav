const genererFigures = (hash, anaverse) => {
  function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
      (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)),
        (h = (h << 13) | (h >>> 19));
    return function () {
      (h = Math.imul(h ^ (h >>> 16), 2246822507)),
        (h = Math.imul(h ^ (h >>> 13), 3266489909));
      return (h ^= h >>> 16) >>> 0;
    };
  }

  function sfc32(a, b, c, d) {
    return function () {
      a |= 0;
      b |= 0;
      c |= 0;
      d |= 0;
      var t = (((a + b) | 0) + d) | 0;
      d = (d + 1) | 0;
      a = b ^ (b >>> 9);
      b = (c + (c << 3)) | 0;
      c = (c << 21) | (c >>> 11);
      c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }

  const seed = xmur3(hash);

  const r = () => sfc32(seed(), seed(), seed(), seed())();

  console.log(hash);

  const rint = (n) => Math.floor(r() * n);

  const figures = [];
  const features = {};
  const u = 1;

  // Don't modify above this line
  features.name = "My great anaverse space"; // this name must be generative too

  // below here is your script
  // this example is voluntarily extra-naive in its formulation
  // feel free to take vanilla JS shortcuts like spread syntax et al

  for (let i = 0; i < 5; i++) {
    console.log(r());
  }

  // This function pushes a cube in the figure array
  // It takes a pos argument that is a {x,y,z} object.

  const cube = (pos) =>
    figures.push({
      geometry: {
        type: "BoxGeometry", // Type of geometry [list here https://threejs.org/docs/index.html?q=geometry]
        args: [
          // Arguments relevant to the geometry (check THREE API)
          (0.1 + r()) * u, // Cube width
          (0.1 + r()) * u, // Cube height
          (0.1 + r()) * u, // Cube depth
        ],
      },
      pos: {
        // Position
        x: pos.x * u,
        y: pos.y * u,
        z: pos.z * u,
      },
      rot: {
        // Rotation
        x: 0,
        y: 0,
        z: 0,
      },
      lines: true, // Display color segments (like wireframe, but faces not triangles)
      hatch: true, // Fill with white texture
      full: false, // Fill with color texture (in the anaverse, red and cyan)
    });

  for (let x = -5; x < 5; x++) {
    for (let y = -5; y < 5; y++) {
      for (let z = -5; z < 5; z++) {
        // set up position
        if (x + y < r() * 3) {
          const pos = { x: x, y: y, z: z };

          // call the function
          cube(pos);
        }
      }
    }
  }

  // both are needed
  return { figures, features };
};

export { genererFigures };
