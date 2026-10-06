export function initServiceModal(root, items) {
    const modal = root.querySelector('#serviceModal');
    const backdrop = root.querySelector('#modalBackdrop');
    const closeBtn = root.querySelector('#modalClose');
    const modalImage = root.querySelector('#modalImage');
    const modalTitle = root.querySelector('#modalTitle');
    const modalDescription = root.querySelector('#modalDescription');

    // Si falta algún elemento del modal, detenemos la función acá para evitar errores.
    if (!modal || !backdrop || !closeBtn) return;

    let lastFocused = null;

    function openModal(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('.service-text');
        const description = item.dataset.description || '';

        // Validamos que la imagen y el título existan antes de asignarles datos
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

        lastFocused = document.activeElement;
        modal.hidden = false;
        backdrop.hidden = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.hidden = true;
        backdrop.hidden = true;
        document.body.style.overflow = '';
        // Devolvemos el foco al servicio que abrió el modal
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    if (items) {
        items.forEach(item => {
            item.addEventListener('click', () => openModal(item));
            // Teclado: los service-item son divs con role="button"
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    openModal(item);
                }
            });
        });
    }

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}
