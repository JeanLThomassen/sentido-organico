export function initBookingForm(root) {
    const nextBtnForm = root.querySelector('nextBtn-Form');
    const form_panel = root.querySelectorAll('.form-panel');

    let currentStep = 0;
    const step = Array.from(form_panel.children);
    
    function update(){
        const stepOn = step[0].getBoundingClientRect().display;
        track.style.display = 'display: block';
    }

    function goToNextStep(index) {
        currentStep = (index);
        updateStep();
    }

    const next = () => goToNextStep(currentStep + 1);
    nextBtnForm.addEventListener('click', next);

    update();

    return {next, goToNextStep};
}