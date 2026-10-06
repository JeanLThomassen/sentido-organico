export function initMobileMenu(root) {
    const toggleBtn = root.querySelector('#menuToggle');
    const menu = root.querySelector('#menuNav');

    toggleBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('nav-menu--open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    menu.querySelectorAll('.nav-menu__link').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('nav-menu--open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Mismo umbral que el header (js/main.js). Antes había un DOMContentLoaded
    // anidado que volvía a buscar el botón al documento.
    window.addEventListener('scroll', () => {
        toggleBtn.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}
