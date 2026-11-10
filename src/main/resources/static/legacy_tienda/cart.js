document.addEventListener("DOMContentLoaded", () => {
    renderizarCarrito();
});

function renderizarCarrito() {
    const contenedor = document.querySelector(".cart-products");
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    if (!contenedor) return;
    
    // Limpiamos el contenedor antes de renderizar para evitar duplicados
    contenedor.innerHTML = ""; 

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    } else {
        carrito.forEach((p, index) => {
            const article = document.createElement("article");
            article.className = "cart-item";
            
            // Usamos los datos guardados; si no existen, ponemos "N/A"
            const cat = p.categoria || "N/A";
            const talla = p.talla || "N/A";
            
            article.innerHTML = `
                <img src="${p.imagen}" alt="${p.nombre}" class="cart-img">
                <div class="cart-info">
                    <h2>${p.nombre}</h2>
              
                </div>
                <div class="cart-actions">
                    <p class="price">S/ ${(p.precio * p.cantidad).toFixed(2)}</p>
                    <div class="quantity">
                        <button onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${p.cantidad}</span>
                        <button onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                    <button class="remove" onclick="eliminar(${index})">Eliminar</button>
                </div>
            `;
            contenedor.appendChild(article);
        });
    }
    actualizarTotal();
}

function cambiarCantidad(index, delta) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    carrito[index].cantidad += delta;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
}

function eliminar(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
}

function actualizarTotal() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let subtotal = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    const envio = 20.00; // Puedes cambiar esto si es dinámico

    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const envioEl = document.getElementById("envio");

    if (subtotalEl) subtotalEl.innerText = `S/ ${subtotal.toFixed(2)}`;
    if (envioEl) envioEl.innerText = `S/ ${envio.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `S/ ${(subtotal + envio).toFixed(2)}`;
}

function finalizarCompra() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    alert("¡Compra finalizada con éxito!");
    localStorage.removeItem("carrito");
    renderizarCarrito();
}