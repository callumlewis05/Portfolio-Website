function redirect(url) {
  const items = document.getElementsByClassName('home-element');

  const reverseMaps = {
    'in-up': 'out-down',
    'in-down': 'out-up',
    'in-left': 'out-right',
    'in-right': 'out-left',
  }

  Array.from(items).forEach(element => {
    element.style.animation = getComputedStyle(element).animation.replace(
      /(in-up|in-down|in-left|in-right)/g,
      match => reverseMaps[match]
    );
  });

  setTimeout(() => {
    window.location.href = url;
  }, 1000);
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

