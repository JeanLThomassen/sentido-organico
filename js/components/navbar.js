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


    document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');

    window.addEventListener('scroll', () => {
        if (menuToggle) {
            if (window.scrollY > 50) {
                menuToggle.classList.add('scrolled');
            } else {
                menuToggle.classList.remove('scrolled');
            }
        }
    });
});
}