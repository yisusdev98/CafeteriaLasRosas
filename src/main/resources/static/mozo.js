const PRODUCTOS_KEY = 'lasRosasProductos';
const PEDIDOS_KEY = 'lasRosasPedidos';
const PRODUCTOS_BASE = [
  {id:1,nombre:'Café americano',categoria:'Bebida',precio:6.50,descripcion:'Café caliente preparado al momento.'},
  {id:2,nombre:'Limonada clásica',categoria:'Bebida',precio:8.00,descripcion:'Limonada natural de la casa.'},
  {id:3,nombre:'Hamburguesa Las Rosas',categoria:'Comida',precio:18.00,descripcion:'Hamburguesa de la casa con papas.'},
  {id:4,nombre:'Torta de chocolate',categoria:'Postre',precio:10.00,descripcion:'Porción de torta de chocolate.'},
  {id:5,nombre:'Porción de papas',categoria:'Adicional',precio:6.00,descripcion:'Papas fritas como adicional.'}
];
function readArray(key, fallback = []) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value : fallback; }
  catch (_) { return fallback; }
}
let productos = readArray(PRODUCTOS_KEY, PRODUCTOS_BASE);
if (!localStorage.getItem(PRODUCTOS_KEY)) localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
let pedidos = readArray(PEDIDOS_KEY, []);
let itemsPedido = [];
let editandoPedidoId = null;
const $ = id => document.getElementById(id);
const money = n => `S/ ${Number(n || 0).toFixed(2)}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>\'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const nextId = arr => arr.length ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1 : 1;
const savePedidos = () => localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
const totalPedido = p => (p.items || []).reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0);
const fechaHora = value => value ? new Date(value).toLocaleString('es-PE', {dateStyle:'short',timeStyle:'short'}) : '—';
function requireMozo() {
  let sesion = null;
  try { sesion = JSON.parse(localStorage.getItem('usuarioSesion') || 'null'); } catch (_) {}
  if (!sesion || sesion.rol !== 'Mozo') { window.location.href = 'login.html'; return null; }
  return sesion;
}
function showSection(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active-section', s.id === id));
}
function renderProductOptions() {
  $('productoSelect').innerHTML = productos.map(p => `<option value="${p.id}">${escapeHtml(p.nombre)} · ${money(p.precio)}</option>`).join('');
}
function renderItemsBuilder() {
  $('pedidoItemsBody').innerHTML = itemsPedido.length ? itemsPedido.map((item, i) => `<tr><td>${escapeHtml(item.nombre)}</td><td>${money(item.precio)}</td><td>${item.cantidad}</td><td>${money(item.precio * item.cantidad)}</td><td><button type="button" class="action-btn danger" onclick="quitarItem(${i})">Quitar</button></td></tr>`).join('') : '<tr><td colspan="5" class="empty">Agrega los productos del consumo.</td></tr>';
  $('cantidadLineas').textContent = `${itemsPedido.length} ${itemsPedido.length === 1 ? 'producto' : 'productos'}`;
  $('pedidoSubtotal').textContent = money(itemsPedido.reduce((s, x) => s + x.precio * x.cantidad, 0));
}
function agregarItem() {
  const product = productos.find(p => p.id === Number($('productoSelect').value));
  const cantidad = Number($('productoCantidad').value);
  if (!product) { alert('Primero registra productos desde el panel del Administrador.'); return; }
  if (!Number.isInteger(cantidad) || cantidad < 1) { alert('La cantidad debe ser un número entero mayor que cero.'); return; }
  const existente = itemsPedido.find(x => x.productoId === product.id);
  if (existente) existente.cantidad += cantidad;
  else itemsPedido.push({productoId:product.id,nombre:product.nombre,precio:Number(product.precio),cantidad});
  $('productoCantidad').value = 1;
  renderItemsBuilder();
}
function quitarItem(index) { itemsPedido.splice(index, 1); renderItemsBuilder(); }
function resetPedidoForm() {
  $('pedidoForm').reset(); $('pedidoId').value = '';
  itemsPedido = []; editandoPedidoId = null;
  $('pedidoFormHeading').textContent = 'Registrar pedido';
  $('guardarPedido').textContent = 'Registrar pedido';
  $('cancelarEdicion').classList.add('hidden');
  $('productoCantidad').value = 1;
  renderItemsBuilder();
}
function editarPedido(id) {
  const p = pedidos.find(x => x.id === id);
  if (!p || p.estadoPago === 'Pagado') return;
  editandoPedidoId = id; $('pedidoId').value = id; $('pedidoMesa').value = p.mesa;
  itemsPedido = (p.items || []).map(x => ({...x}));
  $('pedidoFormHeading').textContent = `Modificar pedido ${p.codigo}`;
  $('guardarPedido').textContent = 'Guardar cambios'; $('cancelarEdicion').classList.remove('hidden');
  renderItemsBuilder(); showSection('nuevoPedido'); $('pedidoForm').scrollIntoView({behavior:'smooth'});
}
function enviarCaja(id) {
  const p = pedidos.find(x => x.id === id); if (!p || p.estadoPedido !== 'Borrador') return;
  if (!confirm(`¿Enviar el pedido ${p.codigo} a caja?`)) return;
  p.estadoPedido = 'En caja'; p.enviadoCajaAt = new Date().toISOString(); savePedidos(); renderPedidos(); updateStats();
}
function marcarEntregado(id) {
  const p = pedidos.find(x => x.id === id); if (!p || p.estadoPedido !== 'En caja') return;
  if (!confirm(`¿Marcar el pedido ${p.codigo} como entregado?`)) return;
  p.estadoPedido = 'Entregado'; p.entregadoAt = new Date().toISOString(); savePedidos(); renderPedidos(); updateStats();
}
function renderPedidos() {
  const filtro = $('filtroPedidos')?.value || '';
  const lista = [...pedidos].filter(p => !filtro || p.estadoPedido === filtro).sort((a,b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  $('pedidosBody').innerHTML = lista.length ? lista.map(p => {
    const resumen = (p.items || []).map(x => `${escapeHtml(x.nombre)} x${x.cantidad}`).join(', ');
    let actions = '';
    if (p.estadoPago !== 'Pagado') actions += `<button class="action-btn" onclick="editarPedido(${p.id})">Editar</button>`;
    if (p.estadoPedido === 'Borrador') actions += `<button class="action-btn" onclick="enviarCaja(${p.id})">Enviar a caja</button>`;
    if (p.estadoPedido === 'En caja') actions += `<button class="action-btn" onclick="marcarEntregado(${p.id})">Marcar entregado</button>`;
    return `<tr><td><strong>${escapeHtml(p.codigo)}</strong></td><td>${fechaHora(p.createdAt)}</td><td>${escapeHtml(p.mesa)}</td><td class="detail-cell">${resumen}</td><td>${money(totalPedido(p))}</td><td><span class="status ${p.estadoPedido === 'Entregado' ? 'active' : 'pending'}">${escapeHtml(p.estadoPedido)}</span></td><td>${p.estadoPago === 'Pagado' ? '<span class="status active">Pagado</span>' : '<span class="status pending">Pendiente</span>'}</td><td>${actions || '—'}</td></tr>`;
  }).join('') : '<tr><td colspan="8" class="empty">Todavía no hay pedidos registrados.</td></tr>';
  updateStats();
}
function renderCarta() {
  const texto = ($('buscarCarta')?.value || '').toLowerCase(); const categoria = $('filtroCategoria')?.value || '';
  const lista = productos.filter(p => (`${p.nombre} ${p.descripcion || ''}`).toLowerCase().includes(texto) && (!categoria || p.categoria === categoria));
  $('cartaGrid').innerHTML = lista.length ? lista.map(p => `<article class="menu-card"><span class="category">${escapeHtml(p.categoria)}</span><h3>${escapeHtml(p.nombre)}</h3><p>${escapeHtml(p.descripcion || 'Sin descripción')}</p><span class="price">${money(p.precio)}</span></article>`).join('') : '<div class="empty">No hay productos disponibles.</div>';
}
function updateStats() {
  $('statBorrador').textContent = pedidos.filter(p => p.estadoPedido === 'Borrador').length;
  $('statEnCaja').textContent = pedidos.filter(p => p.estadoPedido === 'En caja').length;
  $('statEntregados').textContent = pedidos.filter(p => p.estadoPedido === 'Entregado').length;
}
function setup() {
  const sesion = requireMozo(); if (!sesion) return;
  $('staffName').textContent = `${sesion.nombre} · Mozo`;
  renderProductOptions(); renderItemsBuilder(); renderPedidos(); renderCarta();
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
  $('agregarProducto').addEventListener('click', agregarItem);
  $('cancelarEdicion').addEventListener('click', resetPedidoForm);
  $('pedidoForm').addEventListener('submit', e => {
    e.preventDefault();
    const mesa = $('pedidoMesa').value.trim();
    if (!mesa) { alert('Ingresa la mesa o referencia del cliente.'); return; }
    if (!itemsPedido.length) { alert('Agrega al menos un producto al pedido.'); return; }
    if (editandoPedidoId) {
      const p = pedidos.find(x => x.id === editandoPedidoId);
      if (!p || p.estadoPago === 'Pagado') { alert('Este pedido ya fue pagado y no puede modificarse.'); return; }
      p.mesa = mesa; p.items = itemsPedido.map(x => ({...x})); p.modificadoAt = new Date().toISOString();
      alert('Pedido modificado correctamente.');
    } else {
      const id = nextId(pedidos);
      pedidos.push({id,codigo:`P-${String(id).padStart(3,'0')}`,mesa,items:itemsPedido.map(x => ({...x})),mozoEmail:sesion.email,createdAt:new Date().toISOString(),estadoPedido:'Borrador',estadoPago:'Pendiente'});
      alert('Pedido registrado como borrador. Recuerda enviarlo a caja.');
    }
    savePedidos(); resetPedidoForm(); renderPedidos(); showSection('pedidos');
  });
  $('filtroPedidos').addEventListener('change', renderPedidos);
  $('actualizarPedidos').addEventListener('click', () => { pedidos = readArray(PEDIDOS_KEY, []); renderPedidos(); });
  $('buscarCarta').addEventListener('input', renderCarta); $('filtroCategoria').addEventListener('change', renderCarta);
  $('logoutBtn').addEventListener('click', () => { localStorage.removeItem('usuarioSesion'); window.location.href = 'login.html'; });
}
document.addEventListener('DOMContentLoaded', setup);
