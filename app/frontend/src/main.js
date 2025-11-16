import { 
    Renderer, 
    Vec2, 
    Vec4, 
    Geometry,
    Texture,
    Program,
    Mesh,
    Flowmap, 
} from 'ogl';

import Lenis from 'lenis'

const lenis = new Lenis();
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

async function loadShader(url) {
    const response = await fetch(url);
    return response.text();
}

// load shaders at top-level (unchanged)
const vertexShader = await loadShader(vertexShaderUrl);
const fragmentShader = await loadShader(fragmentShaderUrl);

// image intrinsic size
const _size = [2000, 2500];
const image = document.querySelector('#image');

// vars that will be set inside initWebGL
let renderer, gl, flowmap, geometry, texture, program, mesh;

let aspect = 1;
const mouse = new Vec2(-1);
const velocity = new Vec2();
let isTextureLoaded = false;
let lastTime;
const lastMouse = new Vec2();

function resize() {
  if (!isTextureLoaded || !renderer || !mesh) return;

  const rect = image.getBoundingClientRect();
  const canvasW = Math.max(1, Math.round(rect.width));
  const canvasH = Math.max(1, Math.round(rect.height));

  // Let ogl.Renderer handle DPR & canvas pixel size
  renderer.setSize(canvasW, canvasH);

  // intrinsic image size
  const imgW = _size[0];
  const imgH = _size[1];

  // scale image uniformly so it COVERs the canvas (no distortion)
  const scale = Math.max(canvasW / imgW, canvasH / imgH);

  // rendered image size after scaling
  const renderedW = imgW * scale;
  const renderedH = imgH * scale;

  // UV multipliers: how many image UVs correspond to the canvas size
  // (used in shader as: uv' = (uv - 0.5) * vec2(a1, a2) + 0.5)
  const a1 = renderedW / canvasW; // x multiplier
  const a2 = renderedH / canvasH; // y multiplier

  // update uniform in-place if possible
  const resUniform = mesh.program.uniforms.res.value;
  if (resUniform && typeof resUniform.set === 'function') {
    resUniform.set(canvasW, canvasH, a1, a2);
  } else {
    mesh.program.uniforms.res.value = new Vec4(canvasW, canvasH, a1, a2);
  }

  // If flowmap needs resizing, call its API; otherwise update.
  if (flowmap && typeof flowmap.resize === 'function') {
    flowmap.resize(canvasW, canvasH);
  } else if (flowmap) {
    flowmap.update();
  }

  aspect = canvasW / canvasH;
}


// mouse/touch handler (unchanged)
function updateMouse(e) {
    e.preventDefault();

    const rect = image.getBoundingClientRect();
    let x, y;

    if (e.changedTouches && e.changedTouches.length) {
        x = e.changedTouches[0].pageX - rect.left;
        y = e.changedTouches[0].pageY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    mouse.set(x / rect.width, 1 - y / rect.height);

    if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(x, y);
    }

    const deltaX = x - lastMouse.x;
    const deltaY = y - lastMouse.y;

    lastMouse.set(x, y);

    const time = performance.now();
    const delta = Math.max(10.4, time - lastTime);
    lastTime = time;
    velocity.x = deltaX / delta;
    velocity.y = deltaY / delta;
    velocity.needsUpdate = true;
}

function update(t) {
    if (!isTextureLoaded) return; // Don't render until texture is loaded

    requestAnimationFrame(update);

    if (!velocity.needsUpdate) {
        mouse.set(-1);
        velocity.set(0);
    }
    velocity.needsUpdate = false;

    flowmap.mouse.copy(mouse);
    flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
    flowmap.update();

    program.uniforms.uTime.value = t * 0.01;
    renderer.render({ scene: mesh });
}

// This function contains all WebGL setup and starts loading the SVG to texture.
// We'll call it after 1600 ms to allow your CSS animation to finish.
function initWebGL() {
    // create renderer and append canvas
    renderer = new Renderer({ dpr: 2 });
    gl = renderer.gl;
    image.appendChild(gl.canvas);

    // Flowmap
    flowmap = new Flowmap(gl, {
        falloff: 0.3,
        dissipation: 0.92,
        alpha: 0.5,
    });

    // Geometry
    geometry = new Geometry(gl, {
        position: {
            size: 2,
            data: new Float32Array([-1, -1, 3, -1, -1, 3]),
        },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    texture = new Texture(gl, {
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
    });

    program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
            uTime: { value: 0 },
            tWater: { value: texture },
            res: {
                // initialize with the current layout rect so resize uniform exists
                value: new Vec4(image.clientWidth || window.innerWidth, image.clientHeight || window.innerHeight, 1, 1),
            },
            tFlow: flowmap.uniform,
        },
    });

    mesh = new Mesh(gl, {
        geometry, program
    });

    // Convert SVG to canvas texture (same approach you had)
    const svgElement = document.querySelector('#image svg');
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = _size[0];
    tempCanvas.height = _size[1];

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = function() {
        tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
        texture.image = tempCanvas;
        URL.revokeObjectURL(url);

        // Mark texture as loaded and force initial sizing/render
        isTextureLoaded = true;

        // Defer the resize until next rAF to ensure layout stabilized after animation
        requestAnimationFrame(() => {
            resize();

            // render an initial frame
            flowmap.update();
            renderer.render({ scene: mesh });

            // start the animation loop
            requestAnimationFrame(update);
        });
    };
    img.src = url;

    // Add event listeners for interaction & resize AFTER canvas exists
    const isTouchCapable = 'ontouchstart' in window;
    if (isTouchCapable) {
        image.addEventListener('touchstart', updateMouse, false);
        image.addEventListener('touchmove', updateMouse, { passive: false });
    } else {
        image.addEventListener('mousemove', updateMouse, false);
    }

    // Use rAF wrapper for resize events to avoid layout thrash
    window.addEventListener('resize', () => requestAnimationFrame(resize), false);
}

// Delay full initialization so CSS animations/transitions on the #image element complete.
// setTimeout(() => {
//     initWebGL();
// }, 2900);
