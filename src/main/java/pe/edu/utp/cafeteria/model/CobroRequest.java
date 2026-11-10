package pe.edu.utp.cafeteria.model;

public class CobroRequest {
    private int idPedido;
    private int idCajero;
    private double descuento;
    private double propina;

    // Constructor vacío
    public CobroRequest() {
    }

    // Constructor completo
    public CobroRequest(int idPedido, int idCajero, double descuento, double propina) {
        this.idPedido = idPedido;
        this.idCajero = idCajero;
        this.descuento = descuento;
        this.propina = propina;
    }

    // Getters y Setters
    public int getIdPedido() { return idPedido; }
    public void setIdPedido(int idPedido) { this.idPedido = idPedido; }

    public int getIdCajero() { return idCajero; }
    public void setIdCajero(int idCajero) { this.idCajero = idCajero; }

    public double getDescuento() { return descuento; }
    public void setDescuento(double descuento) { this.descuento = descuento; }

    public double getPropina() { return propina; }
    public void setPropina(double propina) { this.propina = propina; }
}