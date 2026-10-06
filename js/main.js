import { initBookingForm } from './components/form.js';
import { initCalendar } from './components/calendar.js';
import { initServiceModal } from './components/modal.js';
import { initContactWidget } from './components/contact-widget.js';
import { initMobileMenu } from './components/navbar.js';

initMobileMenu(document);

const calendarEl = document.getElementById('calendar');
let calendarModule = null;
if (calendarEl) calendarModule = initCalendar(calendarEl);

const bookingFormEl = document.getElementById('bookingForm');
if (bookingFormEl && calendarModule) initBookingForm(bookingFormEl, calendarModule);

const serviceItems = document.querySelectorAll('.service_case .service-item');
if (serviceItems.length) initServiceModal(document, Array.from(serviceItems));



initContactWidget(document);

const header = document.querySelector('header');

// Un solo listener + rAF: no se recalcula layout en cada evento de scroll.
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        scrollTicking = false;
    });
}, { passive: true });

// Ojo: #serviceModal no entra acá. Empieza con `hidden` (display:none), el
// observer nunca lo marcaría como visible y quedaría con opacity: 0 al abrirlo.
const reveals = document.querySelectorAll('section, .service_case img, .about-text, .contact-inline, #contactWidget');

reveals.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

reveals.forEach(el => revealObserver.observe(el));