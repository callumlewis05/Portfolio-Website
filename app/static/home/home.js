function redirect(url) {
  const items = document.getElementsByClassName('home-element');

  const reverseMaps = {
    'in-up': 'out-down',
    'in-down': 'out-up',
    'in-left': 'out-right',
    'in-right': 'out-left',
  };

  Array.from(items).forEach(element => {
    element.style.animation = getComputedStyle(element).animation.replace(
      /(in-up|in-down|in-left|in-right)/g,
      match => reverseMaps[match]
    );
  });

  // --- SVG draw-out on projects page ---
  let delayMs = 1000; // fallback

  const path = window.location.pathname;
  const onProjects = path === '/projects/' || path === '/projects';

  if (onProjects) {
    delayMs = Math.max(delayMs, animateProjectsTitleOut());
  }

  setTimeout(() => {
    window.location.href = url;
  }, delayMs);
}

/**
 * Animates the #projects-title SVG "out" by setting .top strokeDashoffset to its length.
 * Returns the estimated duration (ms) needed to finish the transition.
 */
function animateProjectsTitleOut() {
  const svg = document.querySelector('#projects-title');
  if (!svg) return 0;

  const bases = Array.from(svg.querySelectorAll('.stroke-group .base'));
  bases.forEach((b) => {
    b.style.opacity = '0';
    b.getBoundingClientRect();
  });
  

  const tops = Array.from(svg.querySelectorAll('.stroke-group .top'));
  if (!tops.length) return 0;

  // Helper: parse "0.6s, 200ms" etc -> max ms
  const maxTimeMsFromList = (listStr) => {
    return Math.max(
      ...listStr.split(',').map(s => {
        const v = s.trim();
        if (!v) return 0;
        if (v.endsWith('ms')) return parseFloat(v);
        if (v.endsWith('s')) return parseFloat(v) * 1000;
        // default assume seconds if unit missing (rare)
        return parseFloat(v) * 1000;
      })
    );
  };

  const getTransitionTotalMs = (el) => {
    const cs = getComputedStyle(el);
    const dur = maxTimeMsFromList(cs.transitionDuration || '0s');
    const del = maxTimeMsFromList(cs.transitionDelay || '0s');
    return dur + del;
  };

  // Ensure lengths exist
  tops.forEach(t => {
    if (!t.dataset.len) {
      try {
        t.dataset.len = String(t.getTotalLength());
      } catch {
        t.dataset.len = '0';
      }
    }
  });

  const maxMs = Math.max(...tops.map(getTransitionTotalMs), 0);

  // Force an actual "out" animation even if currently already hidden:
  // 1) jump to visible (0) without transition
  // 2) next frame: transition to hidden (len)
  tops.forEach(t => {
    t.style.transition = 'none';
    t.style.strokeDashoffset = '0';
  });

  // Commit the "0" state
  svg.getBoundingClientRect();

  // Restore transitions (use CSS-defined transition)
  tops.forEach(t => {
    t.style.transition = '';
  });

  // Animate out on next frame
  requestAnimationFrame(() => {
    tops.forEach(t => {
      t.style.strokeDashoffset = t.dataset.len;
    });
  });

  // Small buffer so we don't cut it too tight
  return Math.ceil(maxMs + 50);
}


function settings() {
  document.querySelector('.settings').classList.toggle('active');
  document.querySelector('.social-links').classList.toggle('active');
  document.querySelector('.container > .home-element.text-box:nth-child(2)').classList.toggle('active');
}

function mixMode(delay = false, dark) {
  if (delay) {
    setTimeout(() => {
      document.querySelectorAll('.title-text').forEach(element => {
        element.classList.add('mixed-colour');
      })
    }, 2200)
  } else {
    document.querySelectorAll('.title-text').forEach(element => {
        if (dark) {
          element.classList.remove('mixed-colour');
        } else {
          element.classList.add('mixed-colour');
        }
      })
  }
}

let dark = true;
let mouseEffectsToggle = false;
let mouseEffects = false;

function toggleColourMode() {
  dark = !dark;

  document.body.classList.add('no-transitions');
  setTimeout(() => document.body.classList.remove('no-transitions'), 300);


  mouseEffects = dark && mouseEffectsToggle;

  document.body.classList.toggle('mouse-effects-on', mouseEffects);
  document.body.classList.toggle('mouse-effects-off', !mouseEffects);

  document.body.style.setProperty('--background-colour', dark ? '#000000' : '#F9F9F9');
  document.body.style.setProperty('--text-colour',       dark ? '#F9F9F9' : '#000000');
  document.body.style.setProperty('--outline-colour',    dark ? '#F9F9F9' : '#000000');

  const svg = document.querySelector('.title');
  svg.style.backgroundColor = dark ? '#000000' : '#F9F9F9';

  svg.querySelectorAll('*').forEach(el => {
    if (el.hasAttribute('fill')) {
      const currentFill = el.getAttribute('fill');
      if (currentFill && currentFill !== 'none') {
        el.setAttribute('fill', dark ? '#F9F9F9' : '#000000');
      }
    }

    if (el.hasAttribute('stroke')) {
      const currentStroke = el.getAttribute('stroke');
      if (currentStroke && currentStroke !== 'none') {
        el.setAttribute('stroke', dark ? '#F9F9F9' : '#000000');
      }
    }
  });

  mixMode(false, dark);
}

const handleMouseMove = e => {
  const target = e.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty('--mouse-x', `${x}px`);
  target.style.setProperty('--mouse-y', `${y}px`);
};

const cards = document.querySelectorAll('.home-element.text-box');
cards.forEach(card => {
  card.addEventListener('mousemove', handleMouseMove);
})

function toggleMouseEffects() {
  mouseEffectsToggle = !mouseEffectsToggle;
  mouseEffects = dark && mouseEffectsToggle;

  document.body.classList.toggle('mouse-effects-on', mouseEffects);
  document.body.classList.toggle('mouse-effects-off', !mouseEffects);
}

(function () {
  const el = document.querySelector('.home-element.title');
  if (!el) return;

  let resizeTimer;
  const DEBOUNCE_MS = 120;

  // When animation ends naturally, hide overlay forever
  el.addEventListener('animationend', () => {
    el.classList.add('overlay-done');
  });

  // If resized before animation ends, interrupt & hide immediately
  function interruptOverlay() {
    if (!el.classList.contains('overlay-done')) {
      el.classList.add('overlay-interrupt');
    }
  }

  // Debounced resize listener
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(interruptOverlay, DEBOUNCE_MS);
  });
})();

