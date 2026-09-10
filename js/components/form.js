export function initBookingForm(root, calendarModule) {
    const step = root.querySelectorAll('.step');
    const nextBtnForm = root.querySelector('#nextBtn');
    const prevBtnForm = root.querySelector('#prevBtn');
    const form_panel = root.querySelectorAll('.form-panel');

    const nameInput = root.querySelector('#clientName');
    const emailInput = root.querySelector('#clientEmail');
    const phoneInput = root.querySelector('#clientPhone');
    const serviceSelect = root.querySelector('#service-select');

    let currentStep = 0;
    const steps = Array.from(step);
    const stepPanel = Array.from(form_panel);
    const maxIndex = stepPanel.length - 1;

    function update(index) {
        const stepPanelOn = stepPanel[index];
        const stepOn = steps[index];

        stepPanel.forEach((_, i) => {
            stepPanel[i].classList.remove('form-panel--active');
            steps[i].classList.remove('step--selected');
        });

        stepPanelOn.classList.add('form-panel--active');
        stepOn.classList.add('step--selected');

        nextBtnForm.textContent = index === maxIndex ? 'Confirmar' : 'Siguiente';
    }

    function goToStep(index) {
        if (index > maxIndex) index = maxIndex;
        if (index < 0) index = 0;
        currentStep = index;
        update(currentStep);
    }

    function validateStep(index) {
        if (index === 0 && (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim())) {
            alert('Completá nombre, email y teléfono para continuar.');
            return false;
        }
        if (index === 1 && !serviceSelect.value) {
            alert('Elegí un servicio para continuar.');
            return false;
        }
        return true;
    }

    function collectFormData() {
        const { selectedDate, selectedTime } = calendarModule.getSelection();

        return {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            service: serviceSelect.value,
            date: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
            time: selectedTime
        };
    }

    const handleNextClick = () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === maxIndex) {
            const { selectedDate, selectedTime } = calendarModule.getSelection();
            if (!selectedDate || !selectedTime) {
                alert('Elegí un día y horario para confirmar tu turno.');
                return;
            }

            const formData = collectFormData();
            console.log('Turno confirmado ✅', formData);
            // TODO: acá va el fetch() al backend cuando lo arme
        } else {
            goToStep(currentStep + 1);
        }
    };

    const prev = () => goToStep(currentStep - 1);

    nextBtnForm.addEventListener('click', handleNextClick);
    prevBtnForm.addEventListener('click', prev);

    update(currentStep);

    return { handleNextClick, prev, goToStep };
}