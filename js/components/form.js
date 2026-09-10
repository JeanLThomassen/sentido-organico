export function initBookingForm(root, calendarModule) {
    const step = root.querySelectorAll('.step');
    const nextBtnForm = root.querySelector('#nextBtn');
    const prevBtnForm = root.querySelector('#prevBtn');
    
    // Usamos el selector correcto con guion bajo
    const form_panel = root.querySelectorAll('.form_panel'); 
    
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
            stepPanel[i].classList.remove('form_panel--active');
            steps[i].classList.remove('step--active');
        });
                 
        if (stepPanelOn) stepPanelOn.classList.add('form_panel--active');
        if (stepOn) stepOn.classList.add('step--active');

        // Cambia el texto del botón según el paso en el que estés
        if (index === maxIndex) {
            nextBtnForm.textContent = "Confirmar Cita";
        } else {
            nextBtnForm.textContent = "Siguiente";
        }
    }

    function goToStep(index) {
        if (index > maxIndex) index = maxIndex;
        if (index < 0) index = 0;
        currentStep = index;
        update(currentStep);
    }

    function validateStep(index) {
        if (index === 0) {
            if (!nameInput.value.trim() || !emailInput.value.trim() || !phoneInput.value.trim()) {
                alert('Completá nombre, email y teléfono para continuar.');
                return false;
            }
        }
        if (index === 1) {
            if (!serviceSelect.value) {
                alert('Elegí un servicio para continuar.');
                return false;
            }
        }
        return true;
    }

    const handleNextClick = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === maxIndex) {
            const { selectedDate, selectedTime } = calendarModule.getSelection();
            if (!selectedDate || !selectedTime) {
                alert('Elegí un día y horario para confirmar tu turno.');
                return;
            }
            
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                service: serviceSelect.value,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime
            };

            try {
                const response = await fetch('http://localhost:3000/api/agendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if(result.success) {
                    alert('¡Turno confirmado con éxito en Google Calendar!');
                } else {
                    alert('Error: ' + (result.error || 'No se pudo agendar.'));
                }
            } catch (error) {
                console.error('Error de conexión con Node.js:', error);
                alert('No se pudo conectar con el servidor local (puerto 3000). Asegurate de tener el server.js corriendo.');
            }
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