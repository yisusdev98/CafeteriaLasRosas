package pe.edu.utp.cafeteria.service;

import pe.edu.utp.cafeteria.dao.PedidoDAO;
import pe.edu.utp.cafeteria.model.CobroRequest;
import pe.edu.utp.cafeteria.model.DetallePedido;
import pe.edu.utp.cafeteria.model.Pedido;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PedidoService {

private final PedidoDAO pedidoDAO;

public PedidoService(PedidoDAO pedidoDAO) {
    this.pedidoDAO = pedidoDAO;
}

    // Mozo registra la comanda completa
    @Transactional
    public int crearNuevoPedido(Pedido pedido) {
        int idPedido = pedidoDAO.registrarCabeceraPedido(
            pedido.getIdMozo(),
            pedido.getNumeroMesa(),
            pedido.getIdCliente()
        );

        if (pedido.getDetalles() != null) {
            for (DetallePedido item : pedido.getDetalles()) {
                pedidoDAO.registrarDetalle(
                    idPedido,
                    item.getIdProducto(),
                    item.getCantidad(),
                    item.getPrecioUnitario()
                );
            }
        }
        return idPedido;
    }

    // Mozo finaliza la mesa y la pasa a caja
    public void pasarPedidoACaja(int idPedido) {
        pedidoDAO.enviarACaja(idPedido);
    }

    // Cajero obtiene la lista de cuentas por cobrar
    public List<Pedido> obtenerPedidosPorCobrar() {
        return pedidoDAO.listarPedidosPendientesCobro();
    }

    // Cajero cobra y emite comprobante
    public void procesarCobro(CobroRequest req) {
        pedidoDAO.ejecutarCobro(
            req.getIdPedido(),
            req.getIdCajero(),
            req.getDescuento(),
            req.getPropina()
        );
    }
}
