package pe.edu.utp.cafeteria.dao;

import pe.edu.utp.cafeteria.model.Producto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ProductoDAO {

    private final JdbcTemplate jdbcTemplate;

    public ProductoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Producto> listarActivos() {
        String sql = "SELECT id_producto, nombre, categoria, precio, activo FROM productos WHERE activo = TRUE";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Producto(
                rs.getInt("id_producto"),
                rs.getString("nombre"),
                rs.getString("categoria"),
                rs.getDouble("precio"),
                rs.getBoolean("activo")
        ));
    }

    public int registrar(Producto p) {
        String sql = "INSERT INTO productos (nombre, categoria, precio, activo) VALUES (?, ?, ?, TRUE)";
        return jdbcTemplate.update(sql, p.getNombre(), p.getCategoria(), p.getPrecio());
    }
}