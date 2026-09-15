// Funcion cards politicas

document.addEventListener('DOMContentLoaded', () => {
    const botonesPoliticas = document.querySelectorAll('.politica-header');
    
    console.log("Botones de políticas encontrados:", botonesPoliticas.length);

    botonesPoliticas.forEach(boton => {
        boton.addEventListener('click', () => {
            console.log("Click detectado en la política");
            
            const tarjetaActual = boton.closest('.card_politicas');
            tarjetaActual.classList.toggle('activa');
        });
    });
});