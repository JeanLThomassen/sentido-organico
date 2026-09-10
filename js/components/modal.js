export function initServiceModal(root, items) {
    const modal = root.querySelector('#serviceModal');
    const backdrop = root.querySelector('#modalBackdrop');
    const closeBtn = root.querySelector('#modalClose');
    const modalImage = root.querySelector('#modalImage');
    const modalTitle = root.querySelector('#modalTitle');
    const modalDescription = root.querySelector('#modalDescription');

    function openModal(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('.service-text');
        const description = item.dataset.description || '';

        modalImage.src = img.src;
        modalImage.alt = img.alt;
        modalTitle.textContent = title.textContent;
        modalDescription.textContent = description;

        modal.hidden = false;
    }

    function closeModal() {
        modal.hidden = true;
    }

    items.forEach(item => {
        item.addEventListener('click', () => openModal(item));
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}