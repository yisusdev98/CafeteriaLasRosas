-- =====================================================================
-- BASE DE DATOS: Cafetería Las Rosas (automatización de pedidos)
-- Requiere MySQL 8.0.16+ (por los CHECK y columnas generadas)
-- Secciones:
--   1. Estructura (tablas)
--   2. Datos de prueba
--   3. Consultas por función (para que el backend las use)
--   4. Procedimiento para cobrar un pedido (genera la boleta)
-- =====================================================================

DROP DATABASE IF EXISTS cafeteria_las_rosas;
CREATE DATABASE cafeteria_las_rosas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cafeteria_las_rosas;

-- =====================================================================
-- 1. ESTRUCTURA
-- =====================================================================

-- 1.1 Roles y usuarios (RF: Gestionar usuarios y roles)
CREATE TABLE roles (
    id_rol     INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    id_rol          INT NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    usuario         VARCHAR(30)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
);

-- 1.2 Catálogo (RF: Registrar producto, Modificar precio y nombre, Consultar carta)
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    categoria   VARCHAR(30)  NOT NULL,
    precio      DECIMAL(10,2) NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_producto_precio CHECK (precio > 0)
);

-- 1.3 Pedidos (RF: Realizar, Modificar, Enviar a caja, Entregar)
-- Flujo de estados: REGISTRADO -> EN_CAJA -> ENTREGADO -> COBRADO
CREATE TABLE pedidos (
    id_pedido      INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente     INT NULL,                -- opcional: el cliente puede no estar registrado
    id_mozo        INT NOT NULL,
    numero_mesa    INT NOT NULL,            -- mesa donde se atiende el pedido
    estado         ENUM('REGISTRADO','EN_CAJA','ENTREGADO','COBRADO') NOT NULL DEFAULT 'REGISTRADO',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedidos_cliente FOREIGN KEY (id_cliente) REFERENCES usuarios (id_usuario),
    CONSTRAINT fk_pedidos_mozo    FOREIGN KEY (id_mozo)    REFERENCES usuarios (id_usuario),
    CONSTRAINT chk_pedido_mesa    CHECK (numero_mesa > 0)
);
CREATE INDEX idx_pedidos_estado ON pedidos (estado);

CREATE TABLE detalles_pedido (
    id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido       INT NOT NULL,
    id_producto     INT NOT NULL,
    cantidad        INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,  -- precio al momento del pedido (no cambia si luego sube el precio)
    subtotal_linea  DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    CONSTRAINT fk_detalles_pedidos   FOREIGN KEY (id_pedido)   REFERENCES pedidos (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_detalles_productos FOREIGN KEY (id_producto) REFERENCES productos (id_producto),
    CONSTRAINT chk_detalle_cantidad  CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio    CHECK (precio_unitario > 0)
);

-- 1.4 Facturación y cobro (RF: Consultar pendientes, Calcular subtotal/IGV, Emitir boleta)
-- Los precios de la carta INCLUYEN IGV (18 %).
CREATE TABLE boletas_venta (
    id_boleta     INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido     INT NOT NULL UNIQUE,
    id_cajero     INT NOT NULL,
    numero_boleta VARCHAR(20) NOT NULL UNIQUE,
    subtotal      DECIMAL(10,2) NOT NULL,           -- base imponible (sin IGV)
    descuento     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    igv           DECIMAL(10,2) NOT NULL,
    propina       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_pagado  DECIMAL(10,2) NOT NULL,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boletas_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos (id_pedido),
    CONSTRAINT fk_boletas_cajero  FOREIGN KEY (id_cajero) REFERENCES usuarios (id_usuario),
    CONSTRAINT chk_boleta_montos  CHECK (descuento >= 0 AND propina >= 0 AND total_pagado >= 0)
);

-- =====================================================================
-- 2. DATOS DE PRUEBA
-- (los password_hash son de ejemplo: el backend debe guardar el hash real, p. ej. bcrypt)
-- =====================================================================

INSERT INTO roles (nombre_rol) VALUES ('ADMINISTRADOR'), ('MOZO'), ('CAJERO'), ('CLIENTE');

INSERT INTO usuarios (id_rol, nombre_completo, usuario, password_hash) VALUES
(1, 'Administrador General', 'admin',   'hash_demo_admin'),
(2, 'Carlos Mendoza',        'cmendoza','hash_demo_mozo1'),
(2, 'Lucía Torres',          'ltorres', 'hash_demo_mozo2'),
(3, 'Rosa Quispe',           'rquispe', 'hash_demo_cajero'),
(4, 'Cliente Frecuente',     'cliente1','hash_demo_cliente');

INSERT INTO productos (nombre, categoria, precio) VALUES
('Café americano',     'BEBIDAS',  5.00),
('Capuchino',          'BEBIDAS',  8.00),
('Jugo de naranja',    'BEBIDAS',  7.00),
('Sándwich de pollo',  'SALADOS', 12.00),
('Empanada de carne',  'SALADOS',  6.00),
('Torta de chocolate', 'POSTRES',  9.00);

-- Pedido 1: ya cobrado
INSERT INTO pedidos (id_cliente, id_mozo, numero_mesa, estado) VALUES (5, 2, 3, 'ENTREGADO');
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(1, 2, 2, 8.00),
(1, 6, 1, 9.00);

-- Pedido 2: enviado a caja
INSERT INTO pedidos (id_cliente, id_mozo, numero_mesa, estado) VALUES (NULL, 3, 5, 'EN_CAJA');
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(2, 4, 1, 12.00),
(2, 3, 1,  7.00);

-- Pedido 3: recién registrado
INSERT INTO pedidos (id_cliente, id_mozo, numero_mesa) VALUES (NULL, 2, 1);
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES
(3, 1, 2, 5.00),
(3, 5, 2, 6.00);

-- =====================================================================
-- 4. PROCEDIMIENTO PARA COBRAR (se define antes de las consultas para poder probarlo)
-- Calcula subtotal e IGV a partir del detalle, genera el número de boleta
-- y cambia el estado del pedido a COBRADO, todo en una transacción.
-- =====================================================================
DELIMITER $$

CREATE PROCEDURE sp_cobrar_pedido(
    IN p_id_pedido INT,
    IN p_id_cajero INT,
    IN p_descuento DECIMAL(10,2),
    IN p_propina   DECIMAL(10,2)
)
BEGIN
    DECLARE v_estado   VARCHAR(20);
    DECLARE v_consumo  DECIMAL(10,2);
    DECLARE v_base     DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_igv      DECIMAL(10,2);
    DECLARE v_siguiente INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT estado INTO v_estado FROM pedidos WHERE id_pedido = p_id_pedido FOR UPDATE;

    IF v_estado IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no existe';
    ELSEIF v_estado NOT IN ('EN_CAJA','ENTREGADO') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no está listo para cobrar';
    END IF;

    SELECT COALESCE(SUM(subtotal_linea), 0) INTO v_consumo
    FROM detalles_pedido WHERE id_pedido = p_id_pedido;

    IF v_consumo = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido no tiene productos';
    END IF;

    IF p_descuento > v_consumo THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El descuento supera el consumo';
    END IF;

    SET v_base     = v_consumo - p_descuento;       -- monto que incluye IGV
    SET v_subtotal = ROUND(v_base / 1.18, 2);       -- base imponible
    SET v_igv      = v_base - v_subtotal;           -- IGV 18 %

    SELECT COALESCE(MAX(id_boleta), 0) + 1 INTO v_siguiente FROM boletas_venta;

    INSERT INTO boletas_venta
        (id_pedido, id_cajero, numero_boleta, subtotal, descuento, igv, propina, total_pagado)
    VALUES
        (p_id_pedido, p_id_cajero, CONCAT('B001-', LPAD(v_siguiente, 8, '0')),
         v_subtotal, p_descuento, v_igv, p_propina, v_base + p_propina);

    UPDATE pedidos SET estado = 'COBRADO' WHERE id_pedido = p_id_pedido;

    COMMIT;
END$$

DELIMITER ;

-- Boleta del pedido 1 (consumo S/ 25.00, sin descuento ni propina)
CALL sp_cobrar_pedido(1, 4, 0.00, 0.00);

-- =====================================================================
-- 3. CONSULTAS POR FUNCIÓN
-- (los ? son parámetros que el backend envía; para probar en Workbench reemplázalos por valores)
-- =====================================================================

-- ---------- ADMINISTRADOR: usuarios y roles ----------
-- Registrar usuario
-- INSERT INTO usuarios (id_rol, nombre_completo, usuario, password_hash) VALUES (?, ?, ?, ?);
-- Cambiar rol de un usuario
-- UPDATE usuarios SET id_rol = ? WHERE id_usuario = ?;
-- Desactivar / activar usuario (no se borra para conservar el historial)
-- UPDATE usuarios SET activo = ? WHERE id_usuario = ?;
-- Listar usuarios con su rol
SELECT u.id_usuario, u.nombre_completo, u.usuario, r.nombre_rol, u.activo
FROM usuarios u
JOIN roles r ON r.id_rol = u.id_rol
ORDER BY r.nombre_rol, u.nombre_completo;
-- Login: busca al usuario activo; el backend compara la contraseña con el hash
-- SELECT id_usuario, id_rol, nombre_completo, password_hash FROM usuarios WHERE usuario = ? AND activo = TRUE;

-- ---------- ADMINISTRADOR: productos ----------
-- Registrar producto
-- INSERT INTO productos (nombre, categoria, precio) VALUES (?, ?, ?);
-- Modificar nombre y precio
-- UPDATE productos SET nombre = ?, precio = ? WHERE id_producto = ?;
-- Desactivar producto (deja de aparecer en la carta)
-- UPDATE productos SET activo = FALSE WHERE id_producto = ?;

-- ---------- TODOS: consultar carta ----------
SELECT id_producto, nombre, categoria, precio
FROM productos
WHERE activo = TRUE
ORDER BY categoria, nombre;

-- ---------- MOZO: pedidos ----------
-- Realizar pedido (1: crear cabecera; 2: agregar cada producto copiando el precio vigente)
-- INSERT INTO pedidos (id_cliente, id_mozo, numero_mesa) VALUES (?, ?, ?);
-- INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario)
--   SELECT ?, id_producto, ?, precio FROM productos WHERE id_producto = ? AND activo = TRUE;

-- Modificar pedido: solo mientras esté REGISTRADO
-- UPDATE detalles_pedido d JOIN pedidos p ON p.id_pedido = d.id_pedido
--    SET d.cantidad = ? WHERE d.id_detalle = ? AND p.estado = 'REGISTRADO';
-- DELETE d FROM detalles_pedido d JOIN pedidos p ON p.id_pedido = d.id_pedido
--    WHERE d.id_detalle = ? AND p.estado = 'REGISTRADO';

-- Enviar pedido a caja
-- UPDATE pedidos SET estado = 'EN_CAJA' WHERE id_pedido = ? AND estado = 'REGISTRADO';
-- Entregar pedido
-- UPDATE pedidos SET estado = 'ENTREGADO' WHERE id_pedido = ? AND estado = 'EN_CAJA';

-- Ver los pedidos de un mozo con su total
SELECT p.id_pedido, p.numero_mesa, p.estado, p.fecha_creacion,
       COALESCE(SUM(d.subtotal_linea), 0) AS total
FROM pedidos p
LEFT JOIN detalles_pedido d ON d.id_pedido = p.id_pedido
WHERE p.id_mozo = 2          -- cambiar por el id del mozo
GROUP BY p.id_pedido, p.numero_mesa, p.estado, p.fecha_creacion
ORDER BY p.fecha_creacion DESC;

-- Detalle de un pedido
SELECT pr.nombre, d.cantidad, d.precio_unitario, d.subtotal_linea
FROM detalles_pedido d
JOIN productos pr ON pr.id_producto = d.id_producto
WHERE d.id_pedido = 2;       -- cambiar por el id del pedido

-- ---------- CAJERO ----------
-- Consultar pedidos pendientes de cobro
SELECT p.id_pedido, p.numero_mesa, u.nombre_completo AS mozo, p.estado,
       SUM(d.subtotal_linea) AS total_consumo
FROM pedidos p
JOIN usuarios u ON u.id_usuario = p.id_mozo
JOIN detalles_pedido d ON d.id_pedido = p.id_pedido
WHERE p.estado IN ('EN_CAJA','ENTREGADO')
GROUP BY p.id_pedido, p.numero_mesa, u.nombre_completo, p.estado
ORDER BY p.fecha_creacion;

-- Cobrar y emitir boleta (calcula subtotal, IGV y total):
-- CALL sp_cobrar_pedido(?, ?, ?, ?);   -- id_pedido, id_cajero, descuento, propina
-- Ejemplo: CALL sp_cobrar_pedido(2, 4, 0.00, 2.00);

-- Consultar boleta emitida
SELECT b.numero_boleta, b.fecha_emision, b.subtotal, b.descuento, b.igv, b.propina, b.total_pagado,
       u.nombre_completo AS cajero
FROM boletas_venta b
JOIN usuarios u ON u.id_usuario = b.id_cajero
WHERE b.id_pedido = 1;

-- Ventas del día (para cierre de caja)
SELECT COUNT(*) AS boletas, COALESCE(SUM(total_pagado), 0) AS total_vendido
FROM boletas_venta
WHERE DATE(fecha_emision) = CURDATE();
