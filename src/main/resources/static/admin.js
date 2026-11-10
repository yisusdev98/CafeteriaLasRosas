const KEYS = { productos:'lasRosasProductos', usuarios:'lasRosasUsuarios', ventas:'lasRosasVentas' };

const semillas = {
  productos: [
    {id:1,nombre:'Café americano',categoria:'Bebida',precio:6.50,descripcion:'Café caliente preparado al momento.'},
    {id:2,nombre:'Limonada clásica',categoria:'Bebida',precio:8.00,descripcion:'Limonada natural de la casa.'},
    {id:3,nombre:'Hamburguesa Las Rosas',categoria:'Comida',precio:18.00,descripcion:'Hamburguesa de la casa con papas.'},
    {id:4,nombre:'Torta de chocolate',categoria:'Postre',precio:10.00,descripcion:'Porción de torta de chocolate.'},
    {id:5,nombre:'Porción de papas',categoria:'Adicional',precio:6.00,descripcion:'Papas fritas como adicional.'}
  ],
  usuarios: [
    {id:1,nombre:'Administrador',email:'admin@lasrosas.com',password:'admin123',rol:'Administrador',activo:true},
    {id:2,nombre:'María López',email:'maria@lasrosas.com',password:'mozo123',rol:'Mozo',activo:true},
    {id:3,nombre:'Carlos Pérez',email:'carlos@lasrosas.com',password:'cajero123',rol:'Cajero',activo:true}
  ],
  ventas: [
    {id:1,fecha:'2026-10-01',pedido:'P-001',cliente:'Mesa 1',total:32.50},
    {id:2,fecha:'2026-10-02',pedido:'P-002',cliente:'Mesa 3',total:24.00},
    {id:3,fecha:'2026-10-03',pedido:'P-003',cliente:'Mesa 2',total:40.00},
    {id:4,fecha:'2026-10-04',pedido:'P-004',cliente:'Mesa 5',total:18.50},
    {id:5,fecha:'2026-10-05',pedido:'P-005',cliente:'Mesa 4',total:28.00}
  ]
};

function getData(key){
  const saved=localStorage.getItem(KEYS[key]);
  if(saved) return JSON.parse(saved);
  localStorage.setItem(KEYS[key],JSON.stringify(semillas[key]));
  return JSON.parse(JSON.stringify(semillas[key]));
}
function saveData(key,data){localStorage.setItem(KEYS[key],JSON.stringify(data));}
let productos=getData('productos');
let usuarios=getData('usuarios');
let ventas=getData('ventas');

function money(v){return `S/ ${Number(v).toFixed(2)}`}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function nextId(arr){return arr.length?Math.max(...arr.map(x=>Number(x.id)))+1:1}

function requireAdmin(){
  const sesion=JSON.parse(localStorage.getItem('usuarioSesion')||'null');
  if(!sesion || sesion.rol!=='Administrador') { window.location.href='login.html'; return null; }
  return sesion;
}

function renderProductos(){
  const filtro=(document.getElementById('buscarProducto')?.value||'').toLowerCase();
  const body=document.getElementById('productosBody');
  const lista=productos.filter(p=>(p.nombre+' '+p.categoria).toLowerCase().includes(filtro));
  body.innerHTML=lista.length?lista.map(p=>`<tr><td>${p.id}</td><td><strong>${escapeHtml(p.nombre)}</strong></td><td>${escapeHtml(p.categoria)}</td><td>${money(p.precio)}</td><td><button class="action-btn" onclick="editarProducto(${p.id})">Editar</button></td></tr>`).join(''):`<tr><td colspan="5" class="empty">No hay productos registrados.</td></tr>`;
  renderCarta(); updateStats();
}

function resetProductoForm(){
  document.getElementById('productoForm').reset();
  document.getElementById('productoId').value='';
  document.getElementById('productoFormTitle').textContent='Registrar producto';
  document.getElementById('productoSubmit').textContent='Registrar producto';
  document.getElementById('cancelEdit').classList.add('hidden');
}
function editarProducto(id){
  const p=productos.find(x=>x.id===id); if(!p)return;
  document.getElementById('productoId').value=p.id;
  document.getElementById('productoNombre').value=p.nombre;
  document.getElementById('productoCategoria').value=p.categoria;
  document.getElementById('productoPrecio').value=p.precio;
  document.getElementById('productoDescripcion').value=p.descripcion||'';
  document.getElementById('productoFormTitle').textContent='Modificar producto';
  document.getElementById('productoSubmit').textContent='Guardar cambios';
  document.getElementById('cancelEdit').classList.remove('hidden');
  document.getElementById('productoForm').scrollIntoView({behavior:'smooth'});
}

function renderCarta(){
  const grid=document.getElementById('cartaGrid'); if(!grid)return;
  const texto=(document.getElementById('buscarCarta')?.value||'').toLowerCase();
  const cat=document.getElementById('filtroCategoria')?.value||'';
  const lista=productos.filter(p=>(p.nombre+' '+(p.descripcion||'')).toLowerCase().includes(texto)&&(!cat||p.categoria===cat)).sort((a,b)=>a.categoria.localeCompare(b.categoria)||a.nombre.localeCompare(b.nombre));
  grid.innerHTML=lista.length?lista.map(p=>`<article class="menu-card"><span class="category">${escapeHtml(p.categoria)}</span><h3>${escapeHtml(p.nombre)}</h3><p>${escapeHtml(p.descripcion||'Sin descripción')}</p><span class="price">${money(p.precio)}</span></article>`).join(''):`<div class="empty">No se encontraron productos en la carta.</div>`;
}

function renderUsuarios(){
  const filtro=(document.getElementById('buscarUsuario')?.value||'').toLowerCase();
  const body=document.getElementById('usuariosBody');
  const lista=usuarios.filter(u=>(u.nombre+' '+u.email+' '+u.rol).toLowerCase().includes(filtro));
  body.innerHTML=lista.length?lista.map(u=>`<tr><td>${u.id}</td><td>${escapeHtml(u.nombre)}</td><td>${escapeHtml(u.email)}</td><td>${escapeHtml(u.rol)}</td><td><span class="status ${u.activo?'active':'inactive'}">${u.activo?'Activo':'Inactivo'}</span></td><td><button class="action-btn" onclick="editarUsuario(${u.id})">Editar</button><button class="action-btn danger" onclick="cambiarEstadoUsuario(${u.id})">${u.activo?'Desactivar':'Activar'}</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty">No hay usuarios.</td></tr>`;
  updateStats();
}
function resetUsuarioForm(){
  document.getElementById('usuarioForm').reset();
  document.getElementById('usuarioId').value='';
  document.getElementById('usuarioFormTitle').textContent='Registrar usuario';
  document.getElementById('usuarioSubmit').textContent='Registrar usuario';
  document.getElementById('cancelUserEdit').classList.add('hidden');
}
function editarUsuario(id){
  const u=usuarios.find(x=>x.id===id); if(!u)return;
  document.getElementById('usuarioId').value=u.id;
  document.getElementById('usuarioNombre').value=u.nombre;
  document.getElementById('usuarioEmail').value=u.email;
  document.getElementById('usuarioRol').value=u.rol;
  document.getElementById('usuarioFormTitle').textContent='Modificar usuario';
  document.getElementById('usuarioSubmit').textContent='Guardar cambios';
  document.getElementById('cancelUserEdit').classList.remove('hidden');
  document.getElementById('usuarioForm').scrollIntoView({behavior:'smooth'});
}
function cambiarEstadoUsuario(id){
  const u=usuarios.find(x=>x.id===id); if(!u)return;
  if(u.email==='admin@lasrosas.com' && u.activo){alert('El administrador principal no puede desactivarse.');return;}
  u.activo=!u.activo; saveData('usuarios',usuarios); renderUsuarios();
}

function renderVentas(){
  const desde=document.getElementById('fechaDesde').value;
  const hasta=document.getElementById('fechaHasta').value;
  const lista=ventas.filter(v=>(!desde||v.fecha>=desde)&&(!hasta||v.fecha<=hasta)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  document.getElementById('ventasBody').innerHTML=lista.length?lista.map(v=>`<tr><td>${v.id}</td><td>${v.fecha}</td><td>${escapeHtml(v.pedido)}</td><td>${escapeHtml(v.cliente)}</td><td><strong>${money(v.total)}</strong></td></tr>`).join(''):`<tr><td colspan="5" class="empty">No hay ventas para el periodo seleccionado.</td></tr>`;
  document.getElementById('ventasCantidad').textContent=lista.length;
  document.getElementById('ventasTotal').textContent=money(lista.reduce((s,v)=>s+Number(v.total),0));
  updateStats();
}
function updateStats(){
  const activos=usuarios.filter(u=>u.activo).length;
  document.getElementById('statProductos').textContent=productos.length;
  document.getElementById('statUsuarios').textContent=activos;
  document.getElementById('statVentas').textContent=ventas.length;
  document.getElementById('statIngresos').textContent=money(ventas.reduce((s,v)=>s+Number(v.total),0));
}

function setup(){
  const sesion=requireAdmin(); if(!sesion)return;
  document.getElementById('adminName').textContent=`${sesion.nombre} · ${sesion.rol}`;
  renderProductos(); renderUsuarios(); renderVentas(); updateStats();

  document.querySelectorAll('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active-section'));
    btn.classList.add('active'); document.getElementById(btn.dataset.section).classList.add('active-section');
  }));

  document.getElementById('productoForm').addEventListener('submit',e=>{
    e.preventDefault();
    const id=Number(document.getElementById('productoId').value);
    const data={nombre:document.getElementById('productoNombre').value.trim(),categoria:document.getElementById('productoCategoria').value,precio:Number(document.getElementById('productoPrecio').value),descripcion:document.getElementById('productoDescripcion').value.trim()};
    if(id){Object.assign(productos.find(p=>p.id===id),data);alert('Producto modificado correctamente.');}else{productos.push({id:nextId(productos),...data});alert('Producto registrado correctamente.');}
    saveData('productos',productos); resetProductoForm(); renderProductos();
  });
  document.getElementById('cancelEdit').addEventListener('click',resetProductoForm);
  document.getElementById('buscarProducto').addEventListener('input',renderProductos);
  document.getElementById('buscarCarta').addEventListener('input',renderCarta);
  document.getElementById('filtroCategoria').addEventListener('change',renderCarta);

  document.getElementById('usuarioForm').addEventListener('submit',e=>{
    e.preventDefault();
    const id=Number(document.getElementById('usuarioId').value);
    const password=document.getElementById('usuarioPassword').value;
    const data={nombre:document.getElementById('usuarioNombre').value.trim(),email:document.getElementById('usuarioEmail').value.trim().toLowerCase(),rol:document.getElementById('usuarioRol').value};
    const duplicate=usuarios.find(u=>u.email===data.email&&u.id!==id);
    if(duplicate){alert('Ya existe un usuario con ese correo.');return;}
    if(id){const actual=usuarios.find(u=>u.id===id);Object.assign(actual,data);if(password)actual.password=password;alert('Usuario modificado correctamente.');}else{if(!password || password.length<4){alert('Ingresa una contraseña de al menos 4 caracteres para el nuevo usuario.');return;}usuarios.push({id:nextId(usuarios),...data,password,activo:true});alert('Usuario registrado correctamente.');}
    saveData('usuarios',usuarios); resetUsuarioForm(); renderUsuarios();
  });
  document.getElementById('cancelUserEdit').addEventListener('click',resetUsuarioForm);
  document.getElementById('buscarUsuario').addEventListener('input',renderUsuarios);
  document.getElementById('filtrarVentas').addEventListener('click',renderVentas);
  document.getElementById('limpiarVentas').addEventListener('click',()=>{document.getElementById('fechaDesde').value='';document.getElementById('fechaHasta').value='';renderVentas();});
  document.getElementById('logoutBtn').addEventListener('click',()=>{localStorage.removeItem('usuarioSesion');window.location.href='login.html';});
}

document.addEventListener('DOMContentLoaded',setup);
