package pe.edu.utp.cafeteria.dao;

import pe.edu.utp.cafeteria.model.Usuario;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class UsuarioDAO {

    private final JdbcTemplate jdbcTemplate;

    // Inyección por constructor (elimina la advertencia)
    public UsuarioDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Usuario autenticar(String usuario, String password) {
        String sql = "SELECT u.id_usuario, u.id_rol, r.nombre_rol, u.nombre_completo, u.usuario, u.password_hash, u.activo " +
                     "FROM usuarios u INNER JOIN roles r ON u.id_rol = r.id_rol " +
                     "WHERE u.usuario = ? AND u.password_hash = ? AND u.activo = TRUE";
        
        List<Usuario> lista = jdbcTemplate.query(sql, (rs, rowNum) -> new Usuario(
                rs.getInt("id_usuario"),
                rs.getInt("id_rol"),
                rs.getString("nombre_rol"),
                rs.getString("nombre_completo"),
                rs.getString("usuario"),
                rs.getString("password_hash"),
                rs.getBoolean("activo")
        ), usuario, password);

        return lista.isEmpty() ? null : lista.get(0);
    }
}