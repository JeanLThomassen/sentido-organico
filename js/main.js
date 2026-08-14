import {initBookingForm} from './components/form.js';
import { initSlider } from './components/slider.js';

const sliderEl = document.getElementById('slider');
if (sliderEl) initSlider(sliderEl);

const bookingFormEl = document.getElementById('bookingForm');
if (bookingFormEl) initBookingForm(bookingFormEl);