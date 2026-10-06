// Función de las cards de políticas (acordeón).
// Los módulos (`type="module"`) se ejecutan después de parsear el HTML,
// así que no hace falta esperar a DOMContentLoaded.
const botonesPoliticas = document.querySelectorAll('.politica-header');

botonesPoliticas.forEach(boton => {
    boton.addEventListener('click', () => {
        const tarjetaActual = boton.closest('.card_politicas');
        tarjetaActual.classList.toggle('activa');
    });
});
