package pe.edu.utp.cafeteria.service;

import pe.edu.utp.cafeteria.dao.UsuarioDAO;
import pe.edu.utp.cafeteria.model.Usuario;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    public Usuario iniciarSesion(String usuario, String password) {
        return usuarioDAO.autenticar(usuario, password);
    }
}