document.addEventListener("DOMContentLoaded", () => {
    const botonesTalla = document.querySelectorAll(".sizes button");
    let tallaSeleccionada = null;

    // Seleccionar talla
    botonesTalla.forEach(btn => {
        btn.addEventListener("click", () => {
            tallaSeleccionada = btn.textContent;
            alert("Has seleccionado la talla: " + tallaSeleccionada);
        });
    });

    // Acción de compra
    document.querySelector(".btn-cart").addEventListener("click", () => {
        if (!tallaSeleccionada) {
            alert("¡Por favor, selecciona una talla antes!");
            return;
        }
        alert("Producto añadido con talla " + tallaSeleccionada);
    });
});