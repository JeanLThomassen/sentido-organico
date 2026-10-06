export function initContactWidget(root) {
    const widget = root.querySelector('#contactWidget');
    const closeBtn = root.querySelector('#closeContactWidget');
    const inlineVersion = root.querySelector('#contactInline');

    // Si la página no tiene el widget (ej: politica.html), no hacemos nada.
    if (!widget || !closeBtn) return;

    closeBtn.addEventListener('click', () => {
        widget.classList.add('contact-widget--hidden');
        if (inlineVersion) inlineVersion.classList.add('contact-inline--visible');
    });
}