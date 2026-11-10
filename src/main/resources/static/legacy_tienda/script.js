// Este script busca en tiempo real mientras el usuario escribe
document.addEventListener("DOMContentLoaded", () => {
    const inputBuscador = document.getElementById('buscador');

    if (inputBuscador) {
        inputBuscador.addEventListener("keyup", () => {
            const filtro = inputBuscador.value.toLowerCase();
            const tarjetas = document.querySelectorAll(".product-card");

            tarjetas.forEach(card => {
                // Busca en todo el texto del article (nombre, precio, etc.)
                const texto = card.textContent.toLowerCase();
                
                // Si coincide con lo escrito, lo muestra; si no, lo oculta
                if (texto.includes(filtro)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-cart")) {
        const card = e.target.closest(".product-card");

        const producto = {
            nombre: card.querySelector("h3").innerText,
            precio: parseFloat(card.dataset.precio),
            imagen: card.querySelector("img").src,
            cantidad: 1
        };

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        const index = carrito.findIndex(p => p.nombre === producto.nombre);

        if (index !== -1) {
            carrito[index].cantidad++;
        } else {
            carrito.push(producto);
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));

        alert("Producto agregado al carrito");
    }
});