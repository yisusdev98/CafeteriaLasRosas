const PEDIDOS_KEY = 'lasRosasPedidos';
const VENTAS_KEY = 'lasRosasVentas';
function readArray(key, fallback = []) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(value) ? value : fallback; }
  catch (_) { return fallback; }
}
let pedidos = readArray(PEDIDOS_KEY, []);
let ventas = readArray(VENTAS_KEY, []);
let pedidoActualId = null;
const $ = id => document.getElementById(id);
const money = n => `S/ ${Number(n || 0).toFixed(2)}`;
const round2 = n => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const escapeHtml = value => String(value ?? '').replace(/[&<>\'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const totalPedido = p => round2((p.items || []).reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0));
const fechaHora = value => value ? new Date(value).toLocaleString('es-PE', {dateStyle:'short',timeStyle:'short'}) : '—';
function localDateString() {
  const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function requireCajero() {
  let sesion = null;
  try { sesion = JSON.parse(localStorage.getItem('usuarioSesion') || 'null'); } catch (_) {}
  if (!sesion || sesion.rol !== 'Cajero') { window.location.href = 'login.html'; return null; }
  return sesion;
}
function savePedidos() { localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos)); }
function saveVentas() { localStorage.setItem(VENTAS_KEY, JSON.stringify(ventas)); }
function showSection(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active-section', s.id === id));
}
function pendientes() { return pedidos.filter(p => p.estadoPedido !== 'Borrador' && p.estadoPago !== 'Pagado'); }
function renderPendientes() {
  const lista = pendientes().sort((a,b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  $('pendientesBody').innerHTML = lista.length ? lista.map(p => `<tr><td><strong>${escapeHtml(p.codigo)}</strong></td><td>${fechaHora(p.createdAt)}</td><td>${escapeHtml(p.mesa)}</td><td>${(p.items || []).map(x => `${escapeHtml(x.nombre)} x${x.cantidad}`).join(', ')}</td><td>${escapeHtml(p.estadoPedido)}</td><td><button class="action-btn" onclick="abrirCobro(${p.id})">Procesar cobro</button></td></tr>`).join('') : '<tr><td colspan="6" class="empty">No hay pedidos pendientes de cobro.</td></tr>';
  updateStats();
}
function abrirCobro(id) {
  pedidos = readArray(PEDIDOS_KEY, []);
  const p = pedidos.find(x => x.id === id);
  if (!p || p.estadoPedido === 'Borrador' || p.estadoPago === 'Pagado') { alert('El pedido ya no está disponible para cobrar. Actualiza la lista.'); renderPendientes(); return; }
  pedidoActualId = id;
  $('cobroPedidoId').value = id; $('cobroTitulo').textContent = `Pedido ${p.codigo}`; $('cobroCodigo').textContent = p.mesa;
  $('cobroItemsBody').innerHTML = (p.items || []).map(x => `<tr><td>${escapeHtml(x.nombre)}</td><td>${money(x.precio)}</td><td>${x.cantidad}</td><td>${money(x.precio * x.cantidad)}</td></tr>`).join('');
  $('descuento').value = '0'; $('propina').value = '0'; $('metodoPago').value = 'Efectivo';
  calcularTotales(); showSection('cobrar');
}
function calcularTotales() {
  const p = pedidos.find(x => x.id === pedidoActualId);
  if (!p) return;
  const subtotal = totalPedido(p); const igv = round2(subtotal * 0.18);
  const descuento = Math.max(0, Number($('descuento').value) || 0);
  const propina = Math.max(0, Number($('propina').value) || 0);
  const total = round2(subtotal + igv - descuento); const totalPagar = round2(total + propina);
  $('subtotalCalc').textContent = money(subtotal); $('subtotalResumen').textContent = money(subtotal);
  $('igvResumen').textContent = money(igv); $('totalResumen').textContent = money(total);
  $('totalPagar').textContent = money(totalPagar);
  $('descuento').max = round2(subtotal + igv);
  return {subtotal,igv,descuento,propina,total,totalPagar};
}
function siguienteBoleta() {
  const key = 'lasRosasUltimaBoleta';
  let numero = Number(localStorage.getItem(key) || 0) + 1;
  localStorage.setItem(key, String(numero));
  return `B001-${String(numero).padStart(6,'0')}`;
}
function crearHtmlBoleta(venta) {
  const rows = (venta.items || []).map(x => `<tr><td>${escapeHtml(x.nombre)}</td><td>${x.cantidad}</td><td>${money(x.precio * x.cantidad)}</td></tr>`).join('');
  return `<div class="receipt-head"><h2>CAFETERÍA LAS ROSAS</h2><h3>BOLETA DE VENTA</h3><p style="text-align:center">${escapeHtml(venta.numeroBoleta || 'Boleta de demostración')}</p><p style="text-align:center">Documento interno de demostración</p></div>
    <hr><div class="receipt-line"><span>Fecha:</span><strong>${escapeHtml(venta.fecha || '')} ${escapeHtml(venta.hora || '')}</strong></div>
    <div class="receipt-line"><span>Pedido:</span><strong>${escapeHtml(venta.pedido || '')}</strong></div><div class="receipt-line"><span>Mesa / cliente:</span><strong>${escapeHtml(venta.cliente || '')}</strong></div>
    <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Importe</th></tr></thead><tbody>${rows || '<tr><td colspan="3">Detalle no disponible</td></tr>'}</tbody></table>
    <div class="receipt-line"><span>Subtotal</span><strong>${money(venta.subtotal ?? venta.total)}</strong></div>
    <div class="receipt-line"><span>IGV (18 %)</span><strong>${money(venta.igv || 0)}</strong></div>
    <div class="receipt-line"><span>Descuento</span><strong>${money(venta.descuento || 0)}</strong></div>
    <div class="receipt-line"><span>Total consumo</span><strong>${money(venta.total ?? 0)}</strong></div>
    <div class="receipt-line"><span>Propina voluntaria</span><strong>${money(venta.propina || 0)}</strong></div>
    <div class="receipt-line"><span>Método de pago</span><strong>${escapeHtml(venta.metodoPago || 'No especificado')}</strong></div>
    <div class="receipt-line receipt-total"><span>TOTAL PAGADO</span><strong>${money(venta.totalPagado ?? venta.total ?? 0)}</strong></div>
    <p style="text-align:center;margin-top:22px">¡Gracias por su preferencia!</p><p style="font-size:10px;text-align:center">No constituye comprobante electrónico autorizado por SUNAT.</p>`;
}
function mostrarBoleta(venta, imprimir = false) {
  const receipt = $('boletaPrint'); receipt.innerHTML = crearHtmlBoleta(venta); receipt.classList.remove('hidden'); receipt.setAttribute('aria-hidden','false');
  if (imprimir) setTimeout(() => window.print(), 150);
}
function registrarCobro(event) {
  event.preventDefault();
  pedidos = readArray(PEDIDOS_KEY, []);
  const p = pedidos.find(x => x.id === pedidoActualId);
  if (!p || p.estadoPago === 'Pagado') { alert('Este pedido ya fue cobrado o no existe.'); renderPendientes(); showSection('pendientes'); return; }
  const calculo = calcularTotales();
  if (calculo.descuento > calculo.subtotal + calculo.igv) { alert('El descuento no puede superar el importe del pedido con IGV.'); return; }
  if (calculo.descuento < 0 || calculo.propina < 0) { alert('El descuento y la propina no pueden ser negativos.'); return; }
  if (!confirm(`¿Registrar el cobro de ${money(calculo.totalPagar)} para el pedido ${p.codigo}?`)) return;
  const ahora = new Date();
  const venta = {
    id: ventas.length ? Math.max(...ventas.map(v => Number(v.id) || 0)) + 1 : 1,
    numeroBoleta: siguienteBoleta(), fecha: localDateString(), hora: ahora.toLocaleTimeString('es-PE'),
    pedido: p.codigo, cliente: p.mesa, subtotal: calculo.subtotal, igv: calculo.igv,
    descuento: calculo.descuento, total: calculo.total, propina: calculo.propina,
    totalPagado: calculo.totalPagar, metodoPago: $('metodoPago').value,
    items: (p.items || []).map(x => ({...x})), cajero: (JSON.parse(localStorage.getItem('usuarioSesion') || '{}')).email
  };
  ventas.push(venta); p.estadoPago = 'Pagado'; p.pagadoAt = ahora.toISOString(); p.numeroBoleta = venta.numeroBoleta; p.totalCobrado = calculo.totalPagar;
  saveVentas(); savePedidos(); pedidoActualId = null;
  renderPendientes(); renderHistorial();
  mostrarBoleta(venta, false);
  $('cobroForm').reset();
  alert(`Cobro registrado. Se generó la boleta ${venta.numeroBoleta}.`);
  showSection('historial');
  imprimirBoleta(venta.id);
}
function imprimirBoleta(id) {
  const venta = ventas.find(v => v.id === id); if (!venta) return;
  mostrarBoleta(venta, true);
}
function renderHistorial() {
  const desde = $('histDesde')?.value || ''; const hasta = $('histHasta')?.value || '';
  const lista = [...ventas].filter(v => (!desde || (v.fecha || '') >= desde) && (!hasta || (v.fecha || '') <= hasta)).sort((a,b) => (b.fecha || '').localeCompare(a.fecha || '') || Number(b.id)-Number(a.id));
  $('historialBody').innerHTML = lista.length ? lista.map(v => `<tr><td><strong>${escapeHtml(v.numeroBoleta || '—')}</strong></td><td>${escapeHtml(v.fecha || '—')}</td><td>${escapeHtml(v.pedido || '—')}</td><td>${escapeHtml(v.cliente || '—')}</td><td>${money(v.subtotal ?? v.total)}</td><td>${money(v.igv || 0)}</td><td>${money(v.descuento || 0)}</td><td>${money(v.propina || 0)}</td><td><strong>${money(v.totalPagado ?? v.total)}</strong></td><td><button class="action-btn" onclick="imprimirBoleta(${v.id})">Ver / imprimir</button></td></tr>`).join('') : '<tr><td colspan="10" class="empty">No hay boletas para el periodo seleccionado.</td></tr>';
  updateStats();
}
function updateStats() {
  $('statPendientes').textContent = pendientes().length;
  const ventasFinales = ventas.filter(v => v.numeroBoleta);
  $('statVentas').textContent = ventasFinales.length;
  $('statIngresos').textContent = money(ventasFinales.reduce((s,v) => s + Number(v.total || 0), 0));
}
function setup() {
  const sesion = requireCajero(); if (!sesion) return;
  $('staffName').textContent = `${sesion.nombre} · Cajero`;
  document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
  renderPendientes(); renderHistorial();
  $('actualizarPendientes').addEventListener('click', () => { pedidos = readArray(PEDIDOS_KEY, []); ventas = readArray(VENTAS_KEY, []); renderPendientes(); });
  $('descuento').addEventListener('input', calcularTotales); $('propina').addEventListener('input', calcularTotales);
  $('cobroForm').addEventListener('submit', registrarCobro);
  $('volverPendientes').addEventListener('click', () => { pedidoActualId = null; showSection('pendientes'); });
  $('filtrarHistorial').addEventListener('click', renderHistorial);
  $('limpiarHistorial').addEventListener('click', () => { $('histDesde').value = ''; $('histHasta').value = ''; renderHistorial(); });
  $('logoutBtn').addEventListener('click', () => { localStorage.removeItem('usuarioSesion'); window.location.href = 'login.html'; });
}
document.addEventListener('DOMContentLoaded', setup);
