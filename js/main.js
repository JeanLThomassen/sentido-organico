import {initBookingForm} from './components/form.js';
import { initSlider } from './components/slider.js';
import { initCalendar } from './components/calendar.js';

const sliderEl = document.getElementById('slider');
if (sliderEl) initSlider(sliderEl);

const bookingFormEl = document.getElementById('bookingForm');
if (bookingFormEl) initBookingForm(bookingFormEl);

const calendarEl = document.getElementById('calendar');
if (calendarEl) initCalendar(calendarEl);

const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    // Si el usuario baja más de 50 píxeles, se activa el fondo
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        // Si vuelve arriba de todo, vuelve a ser transparente
        header.classList.remove('scrolled');
    }
});