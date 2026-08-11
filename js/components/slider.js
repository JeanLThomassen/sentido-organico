export function initSlider(root) {
  const track = root.querySelector('.slider__track');
  const slides = Array.from(track.children);
  const dotsContainer = root.querySelector('.slider__dots');
  const prevBtn = root.querySelector('.slider__btn--prev');
  const nextBtn = root.querySelector('.slider__btn--next');

  let currentIndex = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('slider__dot');
    dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function update() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('slider__dot--active', i === currentIndex));
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    update();
  }

  const next = () => goToSlide(currentIndex + 1);
  const prev = () => goToSlide(currentIndex - 1);

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  update();

  return { next, prev, goToSlide };
}