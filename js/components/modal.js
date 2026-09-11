export function initServiceModal(root, items) {
    const modal = root.querySelector('#serviceModal');
    const backdrop = root.querySelector('#modalBackdrop');
    const closeBtn = root.querySelector('#modalClose');
    const modalImage = root.querySelector('#modalImage');
    const modalTitle = root.querySelector('#modalTitle');
    const modalDescription = root.querySelector('#modalDescription');

    // Validación clave: Si falta algún elemento del modal, detenemos la función acá para evitar errores.
    if (!modal || !backdrop || !closeBtn) return;

    function openModal(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('.service-text');
        const description = item.dataset.description || '';

        // También validamos que la imagen y el título existan antes de asignarles datos
        if (img && modalImage) {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
        }
        if (title && modalTitle) {
            modalTitle.textContent = title.textContent;
        }
        if (modalDescription) {
            modalDescription.textContent = description;
        }

        modal.hidden = false;
    }

    function closeModal() {
        modal.hidden = true;
    }

    if (items) {
        items.forEach(item => {
            item.addEventListener('click', () => openModal(item));
        });
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}