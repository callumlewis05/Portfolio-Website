const svg = document.querySelector('#projects-title');
// Stop flash at the start (wait for js to load to make svg visible)
// setTimeout(100).then(()  => {
//   svg.style.opacity = 1;
// })
svg.style.opacity = 1;

// Only pick original paths (in case you ever re-run the script)
const originalPaths = Array.from(svg.querySelectorAll('path:not(.base):not(.top)'));

const HITBOX_PADDING = 10;

// Wave timings
const WAVE_STEP_DELAY  = 250; // time between each outward "ring"

// Helper: create SVG element
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// Group paths by letter key
function letterKeyFor(path, fallbackKey) {
  if (path.dataset.letter) return path.dataset.letter;
  const cls = Array.from(path.classList).find(c => c.startsWith('letter-'));
  if (cls) return cls; // e.g. "letter-O"
  return fallbackKey;  // singletons
}

const groups = new Map();
originalPaths.forEach((p, i) => {
  const key = letterKeyFor(p, `__single_${i}`);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
});

// We’ll store per-letter data here (in DOM order)
const letters = [];

// ---- Wave controller (global) ----
let waveTimers = [];
let waveToken = 0;
let activeCenterIndex = null;

function clearWaveTimers() {
  waveTimers.forEach(clearTimeout);
  waveTimers = [];
}

function setLetterState(letterRec, on) {
  // "on" means apply hover state (your existing behavior: hide tops)
  letterRec.desired = on;

  if (letterRec.g.dataset.ready !== '1') return;
  const val = on ? (t => t.dataset.len) : (() => '0');
  letterRec.tops.forEach(t => {
    t.style.strokeDashoffset = on ? t.dataset.len : '0';
  });
}

function startWaveFrom(centerIdx) {
  activeCenterIndex = centerIdx;
  waveToken++;
  const token = waveToken;

  clearWaveTimers();

  // Center reacts immediately (like your old hover)
  setLetterState(letters[centerIdx], true);

  const maxDist = Math.max(centerIdx, (letters.length - 1) - centerIdx);

  // After 0.1s, expand outward: dist 1,2,3...
  for (let dist = 1; dist <= maxDist; dist++) {
    const delay = (dist - 1) * WAVE_STEP_DELAY;
    waveTimers.push(setTimeout(() => {
      if (token !== waveToken || activeCenterIndex !== centerIdx) return;

      const left = centerIdx - dist;
      const right = centerIdx + dist;

      if (left >= 0) setLetterState(letters[left], true);
      if (right < letters.length) setLetterState(letters[right], true);
    }, delay));
  }
}

function reverseWaveFrom(centerIdx) {
  // If you want leave to always run, even if the active center changed,
  // comment out the next line.
  if (activeCenterIndex !== centerIdx) return;

  waveToken++;
  const token = waveToken;

  clearWaveTimers();

  const maxDist = Math.max(centerIdx, (letters.length - 1) - centerIdx);

  // Turn off from center outward: 0, 1, 2, ...
  for (let dist = 0; dist <= maxDist; dist++) {
    const delay = dist * WAVE_STEP_DELAY;

    waveTimers.push(setTimeout(() => {
      if (token !== waveToken) return;

      const left = centerIdx - dist;
      const right = centerIdx + dist;

      if (dist === 0) {
        setLetterState(letters[centerIdx], false);
      } else {
        if (left >= 0) setLetterState(letters[left], false);
        if (right < letters.length) setLetterState(letters[right], false);
      }

      // Only clear at the very end
      if (dist === maxDist) activeCenterIndex = null;
    }, delay));
  }
}


// ---- Build one stroke-group + hitbox per letter ----
for (const [key, paths] of groups.entries()) {
  // Compute union bbox from the ORIGINAL paths (they are in DOM right now)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  paths.forEach(p => {
    const bb = p.getBBox();
    minX = Math.min(minX, bb.x);
    minY = Math.min(minY, bb.y);
    maxX = Math.max(maxX, bb.x + bb.width);
    maxY = Math.max(maxY, bb.y + bb.height);
  });

  const g = svgEl('g', { class: 'stroke-group' });
  g.dataset.letter = key;

  // Replace the first path with the group, remove the rest
  const first = paths[0];
  first.replaceWith(g);
  for (let i = 1; i < paths.length; i++) paths[i].remove();

  // Create ONE hitbox for the whole letter
  const hitbox = svgEl('rect', {
    class: 'hitbox',
    x: minX - HITBOX_PADDING,
    y: minY - HITBOX_PADDING,
    width: (maxX - minX) + HITBOX_PADDING * 2,
    height: (maxY - minY) + HITBOX_PADDING * 2,
  });
  g.appendChild(hitbox);

  // Record (used by wave logic)
  const letterRec = {
    g,
    hitbox,
    tops: [],
    desired: false, // whether we WANT hover-state once ready
  };
  const myIndex = letters.length;
  letters.push(letterRec);
  hitbox.dataset.index = String(myIndex);

  let finished = 0;

  // Recreate each path inside this letter group (base + top)
  paths.forEach((orig) => {
    const base = orig.cloneNode(true);
    base.classList.add('base');

    const top = orig.cloneNode(true);
    top.classList.add('top');

    g.appendChild(base);
    g.appendChild(top);

    const len = top.getTotalLength();
    top.dataset.len = String(len);
    letterRec.tops.push(top);

    // Set dash values for top (with “no transition during setup”)
    top.style.transition = 'none';
    top.style.strokeDasharray = `${len}`;
    top.style.strokeDashoffset = `${len}`; // hidden
    top.getBoundingClientRect();           // commit hidden state
    top.style.transition = '';             // revert to CSS transition

    requestAnimationFrame(() => {
      top.style.strokeDashoffset = '0';    // draw in
    });

    const onDrawDone = (e) => {
      if (e.propertyName !== 'stroke-dashoffset') return;
      top.removeEventListener('transitionend', onDrawDone);
      base.style.opacity = '1';

      finished++;
      if (finished === paths.length) {
        g.dataset.ready = '1';

        // If a wave wants this letter "on" already, apply now
        if (letterRec.desired) {
          letterRec.tops.forEach(t => (t.style.strokeDashoffset = t.dataset.len));
        }
      }
    };
    top.addEventListener('transitionend', onDrawDone);
  });

  // Hook into wave behavior
  hitbox.addEventListener('pointerenter', () => startWaveFrom(myIndex));
  hitbox.addEventListener('pointerleave', () => reverseWaveFrom(myIndex));
}

// document.querySelectorAll(".project-row").forEach(row => {
//   const img = row.querySelector(".gif");
//   if (!img) return; // this row has no gif

//   const still = img.dataset.still;
//   const anim  = img.dataset.anim;
//   if (!still || !anim) return;

//   row.addEventListener("mouseenter", () => { img.src = anim; });
//   row.addEventListener("mouseleave", () => { img.src = still; });
// });

document.querySelectorAll(".row-inner-container").forEach(row => {
  const vids = row.querySelectorAll("video");
  if (!vids) return;

  vids.forEach(v => {
    v.pause(); // ensure paused initially
    row.addEventListener("mouseenter", () => {v.play(); vids[0].classList.add('hi')});
    row.addEventListener("mouseleave", () => {v.pause(); vids[0].classList.remove('hi')}); // holds current frame
  })
});
