document.querySelector(".register-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const pass = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    if (pass !== confirm) {
        alert("Las contraseñas no coinciden.");
    } else {
        alert("Registro exitoso. ¡Bienvenido!");
        console.log("Usuario registrado correctamente.");
    }
});