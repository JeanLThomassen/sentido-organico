const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-activo');
  } else {
    header.classList.remove('header-activo');
  }
});

import { initSlider } from './components/slider.js';

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-activo');
  } else {
    header.classList.remove('header-activo');
  }
});

const sliderEl = document.getElementById('slider');
if (sliderEl) initSlider(sliderEl);