package pe.edu.utp.cafeteria.dao;

import pe.edu.utp.cafeteria.model.Pedido;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository 
public class PedidoDAO {
    
private final JdbcTemplate jdbcTemplate;

public PedidoDAO(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
}

    // 1. MOZO: Inserta la cabecera del pedido y recupera el ID autogenerado
    public int registrarCabeceraPedido(int idMozo, int numeroMesa, Integer idCliente) {
        String sql = "INSERT INTO pedidos (id_cliente, id_mozo, numero_mesa, estado) VALUES (?, ?, ?, 'REGISTRADO')";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            if (idCliente != null) {
                ps.setInt(1, idCliente);
            } else {
                ps.setNull(1, java.sql.Types.INTEGER);
            }
            ps.setInt(2, idMozo);
            ps.setInt(3, numeroMesa);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().intValue();
    }

    // 2. MOZO: Inserta cada producto que compone la orden
    public void registrarDetalle(int idPedido, int idProducto, int cantidad, double precioUnitario) {
        String sql = "INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(sql, idPedido, idProducto, cantidad, precioUnitario);
    }

    // 3. MOZO: Cambia el estado a EN_CAJA para que el cajero lo vea
    public void enviarACaja(int idPedido) {
        String sql = "UPDATE pedidos SET estado = 'EN_CAJA' WHERE id_pedido = ? AND estado = 'REGISTRADO'";
        jdbcTemplate.update(sql, idPedido);
    }

    // 4. CAJERO: Lista las mesas con consumo que esperan pago
    public List<Pedido> listarPedidosPendientesCobro() {
        String sql = "SELECT p.id_pedido, p.numero_mesa, p.id_mozo, p.estado, p.fecha_creacion, " +
                     "COALESCE(SUM(d.subtotal_linea), 0) AS total " +
                     "FROM pedidos p " +
                     "JOIN detalles_pedido d ON d.id_pedido = p.id_pedido " +
                     "WHERE p.estado IN ('EN_CAJA', 'ENTREGADO') " +
                     "GROUP BY p.id_pedido, p.numero_mesa, p.id_mozo, p.estado, p.fecha_creacion " +
                     "ORDER BY p.fecha_creacion ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Pedido p = new Pedido();
            p.setIdPedido(rs.getInt("id_pedido"));
            p.setNumeroMesa(rs.getInt("numero_mesa"));
            p.setIdMozo(rs.getInt("id_mozo"));
            p.setEstado(rs.getString("estado"));
            p.setFechaCreacion(rs.getTimestamp("fecha_creacion"));
            p.setTotal(rs.getDouble("total"));
            return p;
        });
    }

    // 5. CAJERO: Ejecuta el procedimiento almacenado que calcula IGV y emite boleta
    public void ejecutarCobro(int idPedido, int idCajero, double descuento, double propina) {
        String sql = "CALL sp_cobrar_pedido(?, ?, ?, ?)";
        jdbcTemplate.update(sql, idPedido, idCajero, descuento, propina);
    }

}
