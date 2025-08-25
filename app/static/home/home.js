// true is switch to light, false is switch to dark
let mode = false;

function switchMode() {
  document.body.style.setProperty('--background-colour', mode ? '#F9F9F9' : '#000000');
  document.body.style.setProperty('--text-colour', mode ? '#000000' : '#F9F9F9');
  document.body.style.setProperty('--outline-colour', mode ? '#000000' : '#F9F9F9');

  document.querySelector('.mode').innerHTML = mode ? 'LIGHT' : 'DARK';

  // flip mode for next time
  mode = !mode;
}

switchMode();

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
  document.querySelector('#container > .home-element.text-box:nth-child(2)').classList.toggle('active');
}

function mixMode() {
  setTimeout(() => {
    document.querySelectorAll('.title-text').forEach(element => {
      element.classList.add('mixed-colour');
    })
  }, 2200)
}

mixMode()