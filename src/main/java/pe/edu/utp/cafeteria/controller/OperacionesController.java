package pe.edu.utp.cafeteria.controller;

import pe.edu.utp.cafeteria.model.CobroRequest;
import pe.edu.utp.cafeteria.model.Pedido;
import pe.edu.utp.cafeteria.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class OperacionesController {

private final PedidoService pedidoService;
public OperacionesController(PedidoService pedidoService) {
    this.pedidoService = pedidoService;
}

    // --- ACCIONES DEL MOZO ---

    // 1. Tomar y registrar pedido: POST http://localhost:8081/api/mozo/pedido
    @PostMapping("/mozo/pedido")
    public ResponseEntity<String> registrarPedido(@RequestBody Pedido pedido) {
        int idGenerado = pedidoService.crearNuevoPedido(pedido);
        return ResponseEntity.ok("Pedido #" + idGenerado + " registrado con éxito.");
    }

    // 2. Enviar comanda a caja: PUT http://localhost:8081/api/mozo/pedido/{id}/enviar-caja
    @PutMapping("/mozo/pedido/{id}/enviar-caja")
    public ResponseEntity<String> enviarCaja(@PathVariable int id) {
        pedidoService.pasarPedidoACaja(id);
        return ResponseEntity.ok("Pedido #" + id + " enviado a caja.");
    }

    // --- ACCIONES DEL CAJERO ---

    // 3. Ver cuentas pendientes: GET http://localhost:8081/api/cajero/pendientes
    @GetMapping("/cajero/pendientes")
    public ResponseEntity<List<Pedido>> listarPendientes() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosPorCobrar());
    }

    // 4. Cobrar y generar boleta: POST http://localhost:8081/api/cajero/cobrar
    @PostMapping("/cajero/cobrar")
    public ResponseEntity<String> cobrarPedido(@RequestBody CobroRequest request) {
        pedidoService.procesarCobro(request);
        return ResponseEntity.ok("Cobro realizado y boleta emitida exitosamente.");
    }
}