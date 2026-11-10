const listaFavoritos = document.getElementById("listaFavoritos");
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
mostrarFavoritos();
function mostrarFavoritos() {

    listaFavoritos.innerHTML = "";

    if (favoritos.length === 0) {
        listaFavoritos.innerHTML = `
            <h2>No tienes productos favoritos ❤️</h2>
        `;
        return;
    }

    favoritos.forEach((producto, index) => {

        listaFavoritos.innerHTML += `

        <article class="product-card">

            <div class="product-img">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>

            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p class="price">${producto.precio}</p>
                <div class="product-buttons">
                <button
                class="btn-cart"
                onclick="agregarAlCarrito(${index})">
                Añadir
                </button>

                <button
                class="btn-cart"
                onclick="eliminarFavorito(${index})">
                Eliminar
                </button>

                </div>
            </div>
        </article>
        `;
    });

}

// =========================
// ELIMINAR FAVORITO
// =========================

function eliminarFavorito(index) {
    favoritos.splice(index, 1);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos();
}
// =========================
// AGREGAR AL CARRITO
// =========================

function agregarAlCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const producto = favoritos[index];
    const existe = carrito.find(p => p.nombre === producto.nombre);
    if (existe) {
        existe.cantidad++;
    } else {

        carrito.push({
            nombre: producto.nombre,
            precio: parseFloat(
                producto.precio.replace(/<[^>]*>/g, "")
                               .replace("S/", "")
                               .trim()
            ),
            imagen: producto.imagen,
            cantidad: 1
        });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert("Producto agregado al carrito.");
}