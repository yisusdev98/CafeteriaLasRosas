package pe.edu.utp.cafeteria.controller;

import pe.edu.utp.cafeteria.model.Producto;
import pe.edu.utp.cafeteria.model.Usuario;
import pe.edu.utp.cafeteria.service.ProductoService;
import pe.edu.utp.cafeteria.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiController {

    private final UsuarioService usuarioService;
    private final ProductoService productoService;

    public ApiController(UsuarioService usuarioService, ProductoService productoService) {
        this.usuarioService = usuarioService;
        this.productoService = productoService;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String user = credenciales.get("usuario");
        String pass = credenciales.get("password");
        Usuario usuario = usuarioService.iniciarSesion(user, pass);
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales incorrectas"));
    }

    @GetMapping("/admin/productos")
    public Producto[] listarCatalogo() {
        return productoService.obtenerCatalogoOrdenadoPorPrecio();
    }

    @PostMapping("/admin/productos")
    public ResponseEntity<?> crearProducto(@RequestBody Producto producto) {
        boolean ok = productoService.guardarProducto(producto);
        return ok ? ResponseEntity.ok(Map.of("mensaje", "Producto registrado correctamente")) : ResponseEntity.badRequest().build();
    }

    @GetMapping("/mozo/carta")
    public Producto[] verCartaMozo() {
        return productoService.obtenerCatalogoOrdenadoPorPrecio();
    }
}