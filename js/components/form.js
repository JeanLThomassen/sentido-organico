export function initBookingForm(root) {
    const step = root.querySelectorAll('.step');
    const nextBtnForm = root.querySelector('#nextBtn');
    const prevBtnForm = root.querySelector('#prevBtn'); 
    const form_panel = root.querySelectorAll('.form_panel');

    let currentStep = 0;
    const steps = Array.from(step);
    const stepPanel = Array.from(form_panel);

    function update(index) {
        const stepPanelOn = stepPanel[index];
        const stepOn = steps[index];

        stepPanel.forEach((_, i) => {
            stepPanel[i].classList.remove('form_panel--active');
            steps[i].classList.remove('step--selected');
        });

        stepPanelOn.classList.add('form_panel--active');
        stepOn.classList.add('step--selected');
    }

    function goToStep(index) {
        const maxIndex = stepPanel.length - 1;

        if (index > maxIndex) index = maxIndex;
        if (index < 0) index = 0;

        currentStep = index;
        update(currentStep);
    }

    const next = () => goToStep(currentStep + 1);
    const prev = () => goToStep(currentStep - 1); 

    nextBtnForm.addEventListener('click', next);
    prevBtnForm.addEventListener('click', prev); 

    update(currentStep);

    return { next, prev, goToStep };
}