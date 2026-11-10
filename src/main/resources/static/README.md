# Sistema de Gestión - Cafetería Las Rosas

Adaptación del antiguo proyecto Diamond Store para el proyecto de Algoritmo y Estructura de Datos.

## Roles y funcionalidades implementadas

### Administrador
- Inicio de sesión y acceso por rol.
- RF02 y RF03: registrar y modificar productos (nombre, categoría, precio y descripción).
- RF04: consultar la carta por categoría y búsqueda.
- RF05: registrar, modificar, activar y desactivar usuarios y roles. Al crear usuarios se asigna una contraseña.
- RF06: consultar el reporte de ventas por fecha.

### Mozo
- RF04: consultar productos disponibles en la carta.
- RF07: registrar pedidos por mesa/referencia con uno o varios productos y cantidades.
- RF08: modificar pedidos que todavía no han sido pagados ni entregados.
- RF09: enviar pedidos a caja; solo los enviados aparecen en la cola del Cajero.
- RF10: marcar pedidos como entregados. El estado del pedido se maneja por separado del estado de pago.

### Cajero
- RF11: consultar pedidos enviados a caja que todavía están pendientes de cobro.
- RF12: calcular subtotal, IGV del 18 %, descuento y total. El descuento se registra como importe en soles.
- RF13: generar boletas con numeración correlativa y opción de ver/imprimir.
- RF14: registrar el cobro, método de pago y propina voluntaria opcional.
- Los cobros generan registros que aparecen en el reporte de ventas del Administrador.

## Accesos de demostración
- Administrador: `admin@lasrosas.com` / `admin123`
- Mozo: `maria@lasrosas.com` / `mozo123`
- Cajero: `carlos@lasrosas.com` / `cajero123`

El Administrador puede crear otros usuarios y asignarles una contraseña desde **Usuarios y roles**.

## Tecnologías y alcance
HTML, CSS, JavaScript y `localStorage`. Los módulos comparten los datos de productos, usuarios, pedidos y ventas en el mismo navegador. No requiere backend para la demostración.

**Importante:** las contraseñas y los datos se guardan localmente para fines académicos; no es un mecanismo de autenticación seguro para producción. La boleta es una representación interna de demostración y no es un comprobante electrónico autorizado por SUNAT. No se integra con pasarelas de pago.

## Cómo ejecutar y probar
Para que los tres paneles compartan el mismo `localStorage`, abre la carpeta `DiamondStore` con Visual Studio Code y usa **Live Server** sobre `login.html`. También puedes abrir una terminal dentro de esa carpeta y ejecutar `python -m http.server 8000`; luego ingresa a `http://localhost:8000/login.html`. Evita abrir cada archivo directamente con `file://`.

## Cómo probar el flujo
1. Inicia sesión como Administrador y registra productos o usuarios.
2. Cierra sesión e ingresa como Mozo. Registra un pedido y pulsa **Enviar a caja**.
3. Cierra sesión e ingresa como Cajero. Abre el pedido, verifica los importes y registra el cobro.
4. Revisa la boleta, el historial y el reporte de ventas desde el panel del Administrador.
