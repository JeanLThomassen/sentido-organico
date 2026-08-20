import {initBookingForm} from './components/form.js';
import { initSlider } from './components/slider.js';
import { initCalendar } from './components/calendar.js';

const sliderEl = document.getElementById('slider');
if (sliderEl) initSlider(sliderEl);

const bookingFormEl = document.getElementById('bookingForm');
if (bookingFormEl) initBookingForm(bookingFormEl);

const calendarEl = document.getElementById('calendar');
if (calendarEl) initCalendar(calendarEl);