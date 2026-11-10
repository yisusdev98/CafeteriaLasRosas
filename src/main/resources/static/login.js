const USERS_KEY = 'lasRosasUsuarios';
const DEFAULT_USERS = [
  { id: 1, nombre: 'Administrador', email: 'admin@lasrosas.com', password: 'admin123', rol: 'Administrador', activo: true },
  { id: 2, nombre: 'María López', email: 'maria@lasrosas.com', password: 'mozo123', rol: 'Mozo', activo: true },
  { id: 3, nombre: 'Carlos Pérez', email: 'carlos@lasrosas.com', password: 'cajero123', rol: 'Cajero', activo: true }
];

function prepararUsuarios() {
  let users = [];
  try { users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch (_) { users = []; }
  DEFAULT_USERS.forEach(base => {
    const actual = users.find(u => u.email === base.email);
    if (!actual) users.push(base);
    else if (!actual.password) actual.password = base.password;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}

function destinoPorRol(rol) {
  return ({ Administrador: 'admin.html', Mozo: 'mozo.html', Cajero: 'cajero.html' })[rol] || null;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');
  prepararUsuarios();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const users = prepararUsuarios();
    const user = users.find(u => u.email === email && u.password === password && u.activo !== false);
    const destino = user && destinoPorRol(user.rol);

    if (!user) {
      message.textContent = 'Correo o contraseña incorrectos, o usuario inactivo.';
      return;
    }
    if (!destino) {
      message.textContent = 'Este rol todavía no tiene un panel habilitado.';
      return;
    }
    localStorage.setItem('usuarioSesion', JSON.stringify({ id: user.id, email: user.email, rol: user.rol, nombre: user.nombre }));
    window.location.href = destino;
  });
});
