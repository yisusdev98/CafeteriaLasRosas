document.addEventListener("DOMContentLoaded", () => {

    const tarjetas = document.querySelectorAll(".product-card");

    // =========================
    // APLICAR FILTROS
    // =========================
    window.aplicarFiltros = () => {

        const descuento = document.querySelector('input[name="descuento"]:checked')?.value;
        const talla = document.querySelector('input[name="talla"]:checked')?.value;
        const precio = document.querySelector('input[name="precio"]:checked')?.value;
        const color = document.querySelector('input[name="color"]:checked')?.value;
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value;

        tarjetas.forEach(card => {

            const cardPrecio = parseFloat(card.dataset.precio || 0);
            const cardTalla = card.dataset.talla;
            const cardColor = card.dataset.color;
            const cardCategoria = card.dataset.categoria;

            // =========================
            // FILTRO CATEGORÍA (HOMBRE/MUJER)
            // =========================
            const matchCat = !categoria || cardCategoria === categoria;

            // =========================
            // FILTRO TALLA
            // =========================
            const matchTalla = !talla || cardTalla === talla;

            // =========================
            // FILTRO COLOR
            // =========================
            const matchColor = !color || cardColor === color;

            // =========================
            // FILTRO PRECIO
            // =========================
            let matchPrecio = true;

            if (precio) {
                if (precio === "150") {
                    matchPrecio = cardPrecio < 150;
                } else if (precio === "150-300") {
                    matchPrecio = cardPrecio >= 150 && cardPrecio <= 300;
                } else if (precio === "300") {
                    matchPrecio = cardPrecio > 300;
                }
            }

            // =========================
            // FILTRO DESCUENTO (OFERTAS)
            // =========================
            let matchDescuento = true;

            if (descuento) {
                const badge = card.querySelector(".badge")?.innerText || "0";
                const valor = parseInt(badge.replace("%", "").replace("-", "")) || 0;
                const filtro = parseInt(descuento.replace("%", "").replace("-", ""));

                matchDescuento = valor >= filtro;
            }

            // =========================
            // RESULTADO FINAL
            // =========================
            if (matchCat && matchTalla && matchColor && matchPrecio && matchDescuento) {
                card.classList.remove("oculto");
            } else {
                card.classList.add("oculto");
            }
        });
    };

    // =========================
    // LIMPIAR FILTROS (FIX REAL)
    // =========================
    window.limpiarFiltros = () => {

        document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);

        tarjetas.forEach(c => c.classList.remove("oculto"));
    };

    const btnClear = document.querySelector(".btn-clear");

    if (btnClear) {
        btnClear.addEventListener("click", (e) => {
            e.preventDefault();
            limpiarFiltros();
        });
    }

});
// =========================
// SISTEMA DE FAVORITOS
// =========================

document.addEventListener("DOMContentLoaded", () => {

    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    const productos = document.querySelectorAll(".product-card");

    productos.forEach((producto, index) => {

        const imagen = producto.querySelector("img").src;
        const nombre = producto.querySelector("h3").innerText;
        const precio = producto.querySelector(".price").innerHTML;

        const boton = document.createElement("button");

        boton.className = "btn-favorito";
        boton.innerHTML = "🤍";

        producto.querySelector(".product-img").appendChild(boton);

        if(favoritos.some(p => p.nombre === nombre)){
            boton.innerHTML = "❤️";
        }

        boton.addEventListener("click", () => {

            const existe = favoritos.find(p => p.nombre === nombre);

            if(existe){

                favoritos = favoritos.filter(p => p.nombre !== nombre);

                boton.innerHTML = "🤍";

            }else{

                favoritos.push({
                    id:index,
                    nombre,
                    precio,
                    imagen
                });

                boton.innerHTML="❤️";

            }

            localStorage.setItem("favoritos", JSON.stringify(favoritos));

            actualizarContador();

        });

    });

    function actualizarContador(){

        const contador=document.getElementById("contadorFavoritos");

        if(contador){

            contador.innerText=favoritos.length;

        }

    }

    actualizarContador();

});