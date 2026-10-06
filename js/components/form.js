export function initBookingForm(root, calendarModule) {
    const step = root.querySelectorAll('.step');
    const nextBtnForm = root.querySelector('#nextBtn');
    const prevBtnForm = root.querySelector('#prevBtn');
    
    const form = document.querySelector('form');
    const successCard = document.querySelector('#successCard');
    const successMessage = document.querySelector('#successMessage');
    const acceptPolicies = root.querySelector('#acceptPolicies');
    const acceptContact = root.querySelector('#acceptContact');

    const form_panel = root.querySelectorAll('.form_panel'); 
    
    const nameInput = root.querySelector('#clientName');
    const emailInput = root.querySelector('#clientEmail');
    const phoneInput = root.querySelector('#clientPhone');
    const serviceSelect = root.querySelector('#service-select');

    let currentStep = 0;
    let isSubmitting = false;
    const steps = Array.from(step);
    const stepPanel = Array.from(form_panel);
    const maxIndex = stepPanel.length - 1;

    const errorBox = root.querySelector('#formError');

    // Mismos patrones que valida el backend (server.js) para no fallar en el envío.
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

    function clearError() {
        if (!errorBox) return;
        errorBox.hidden = true;
        errorBox.textContent = '';
        [nameInput, emailInput, phoneInput, serviceSelect, acceptPolicies, acceptContact].forEach(field => {
            if (!field) return;
            field.classList.remove('input--error');
            field.removeAttribute('aria-invalid');
        });
    }

    // role="alert" en el contenedor anuncia el mensaje a lectores de pantalla.
    function showError(message, field) {
        if (errorBox) {
            errorBox.hidden = false;
            errorBox.textContent = message;
        }
        if (field) {
            field.classList.add('input--error');
            field.setAttribute('aria-invalid', 'true');
            field.focus();
        }
    }

    function update(index) {
        const stepPanelOn = stepPanel[index];
        const stepOn = steps[index];
        
        stepPanel.forEach((_, i) => {
            stepPanel[i].classList.remove('form_panel--active');
            steps[i].classList.remove('step--active');
        });
                 
        if (stepPanelOn) stepPanelOn.classList.add('form_panel--active');
        if (stepOn) stepOn.classList.add('step--active');

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
        clearError();
        update(currentStep);
    }

    function validateStep(index) {
        if (index === 0) {
            const name = nameInput.value.trim();
            if (!name) {
                showError('Completá tu nombre para continuar.', nameInput);
                return false;
            }
            if (name.length < 2) {
                showError('El nombre debe tener al menos 2 caracteres.', nameInput);
                return false;
            }

            const email = emailInput.value.trim();
            if (!email) {
                showError('Completá tu correo electrónico para continuar.', emailInput);
                return false;
            }
            if (!EMAIL_REGEX.test(email)) {
                showError('El correo no tiene un formato válido (ej: nombre@correo.com).', emailInput);
                return false;
            }

            const phone = phoneInput.value.trim();
            if (!phone) {
                showError('Completá tu teléfono para continuar.', phoneInput);
                return false;
            }
            if (!PHONE_REGEX.test(phone.replace(/[\s\-()]/g, ''))) {
                showError('El teléfono debe contener entre 8 y 15 números.', phoneInput);
                return false;
            }
        }
        if (index === 1) {
            if (!serviceSelect.value) {
                showError('Elegí un servicio para continuar.', serviceSelect);
                return false;
            }
        }
        clearError();
        return true;
    }

    const handleNextClick = async () => {
        if (isSubmitting) return;
        if (!validateStep(currentStep)) return;

        if (currentStep === maxIndex) {
            const { selectedDate, selectedTime } = calendarModule.getSelection();
             
            if (!selectedDate || !selectedTime) {
                showError('Elegí un día y horario para confirmar tu turno.');
                return;
            }

            if (acceptPolicies && !acceptPolicies.checked) {
                showError('Debes aceptar las Políticas de Reserva para continuar.', acceptPolicies);
                return;
            }

            if (acceptContact && !acceptContact.checked) {
                showError('Debes autorizar que te contactemos por teléfono o email para continuar.', acceptContact);
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

            // Bloqueo el botón mientras hay una petición en vuelo: evita
            // dobles clics y, por lo tanto, turnos duplicados.
            isSubmitting = true;
            const labelAnterior = nextBtnForm.textContent;
            nextBtnForm.disabled = true;
            nextBtnForm.textContent = 'Confirmando…';

            try {
                const response = await fetch('/api/agendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                if(result.success) {
                    form.style.display = 'none'; 
                    successCard.hidden = false;
                    
                    const dateTimeText = document.querySelector('#dateTimeSelectLabel').textContent; 
                    successMessage.innerHTML = `Te esperamos el<br><strong>${dateTimeText}</strong>.`;
                } else {
                    const detalles = Array.isArray(result.detalles) ? ' ' + result.detalles.join(' ') : '';
                    showError((result.error || 'No se pudo agendar.') + detalles);
                }
            } catch (error) {
                console.error('Error de conexión con Node.js:', error);
                showError('No se pudo conectar con el servidor. Intentá nuevamente.');
            } finally {
                isSubmitting = false;
                nextBtnForm.disabled = false;
                nextBtnForm.textContent = labelAnterior;
            }
        } else {
            goToStep(currentStep + 1);
        }
    };

    const prev = () => goToStep(currentStep - 1); 

    nextBtnForm.addEventListener('click', handleNextClick);
    prevBtnForm.addEventListener('click', prev); 

    // Enter confirma/avanza sin recargar la página.
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleNextClick();
        });
    }

    // Editar un campo (o cambiar el servicio) limpia el mensaje de error.
    [nameInput, emailInput, phoneInput].forEach(input => {
        input.addEventListener('input', clearError);
    });
    serviceSelect.addEventListener('change', clearError);
    [acceptPolicies, acceptContact].forEach(box => {
        if (box) box.addEventListener('change', clearError);
    });

    update(currentStep);
    return { handleNextClick, prev, goToStep };
}