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

const TARGET_ASPECT = 703 / 215;

function resize() {
  if (!isTextureLoaded || !renderer || !mesh || !gl) return;

  const containerRect = image.getBoundingClientRect();

  // Available space *inside* the container after the desired inset margin
  const availW = Math.max(1, Math.round(containerRect.width));
  const availH = Math.max(1, Math.round(containerRect.height));

  // Fit a TARGET_ASPECT rectangle into (availW, availH) using "contain"
  let canvasW = availW;
  let canvasH = Math.round(canvasW / TARGET_ASPECT);

  if (canvasH > availH) {
    canvasH = availH;
    canvasW = Math.round(canvasH * TARGET_ASPECT);
  }

  canvasW = Math.max(1, canvasW);
  canvasH = Math.max(1, canvasH);

  // Position canvas inset + centered over the SVG
  const c = gl.canvas;
  image.style.position ||= 'relative';

  c.style.position = 'absolute';
  c.style.left = '50%';
  c.style.top = '50%';
  c.style.transform = 'translate(-50%, -50%)';
  // The inset margin is achieved by sizing against availW/availH above,
  // but if you also want a visible gap even when the container is tight:
  // c.style.outline = '0'; // optional
  c.style.pointerEvents = 'auto';

  // Let ogl.Renderer handle DPR & canvas pixel size
  renderer.setSize(canvasW, canvasH);

  // --- IMPORTANT: match the SVG "contain" behavior (letterboxing) ---
  const imgW = _size[0];
  const imgH = _size[1];

  // "contain" (shows borders instead of cropping)
  const scale = Math.min(canvasW / imgW, canvasH / imgH);

  const renderedW = imgW * scale;
  const renderedH = imgH * scale;

  // In contain, these are <= 1, producing the same kind of padding/borders
  const a1 = renderedW / canvasW;
  const a2 = renderedH / canvasH;

  const resUniform = mesh.program.uniforms.res.value;
  if (resUniform && typeof resUniform.set === 'function') {
    resUniform.set(canvasW, canvasH, a1, a2);
  } else {
    mesh.program.uniforms.res.value = new Vec4(canvasW, canvasH, a1, a2);
  }

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

  const rect = gl?.canvas?.getBoundingClientRect() || image.getBoundingClientRect();

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
setTimeout(() => {
    initWebGL();
}, 2900);
