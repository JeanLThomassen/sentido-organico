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

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const reveals = document.querySelectorAll('section, .service_case img, .about-text, .contact-inline, #serviceModal, #contactWidget');

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