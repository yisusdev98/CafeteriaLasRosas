package pe.edu.utp.cafeteria.model;

import java.sql.Timestamp;
import java.util.List;

public class Pedido {
    private int idPedido;
    private Integer idCliente;
    private int idMozo;
    private int numeroMesa;
    private String estado;
    private Timestamp fechaCreacion;
    private double total;
    private List<DetallePedido> detalles;

    // Constructor vacío
    public Pedido() {
    }

    // Constructor completo
    public Pedido(int idPedido, Integer idCliente, int idMozo, int numeroMesa, String estado, Timestamp fechaCreacion, double total, List<DetallePedido> detalles) {
        this.idPedido = idPedido;
        this.idCliente = idCliente;
        this.idMozo = idMozo;
        this.numeroMesa = numeroMesa;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.total = total;
        this.detalles = detalles;
    }

    // Getters y Setters
    public int getIdPedido() { return idPedido; }
    public void setIdPedido(int idPedido) { this.idPedido = idPedido; }

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    public int getIdMozo() { return idMozo; }
    public void setIdMozo(int idMozo) { this.idMozo = idMozo; }

    public int getNumeroMesa() { return numeroMesa; }
    public void setNumeroMesa(int numeroMesa) { this.numeroMesa = numeroMesa; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Timestamp getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Timestamp fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public List<DetallePedido> getDetalles() { return detalles; }
    public void setDetalles(List<DetallePedido> detalles) { this.detalles = detalles; }
}
