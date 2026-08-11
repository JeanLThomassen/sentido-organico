const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-activo');
  } else {
    header.classList.remove('header-activo');
  }
});
