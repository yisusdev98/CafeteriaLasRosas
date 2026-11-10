package pe.edu.utp.cafeteria.model;

public class Usuario {
    private int idUsuario;
    private int idRol;
    private String nombreRol;
    private String nombreCompleto;
    private String usuario;
    private String passwordHash;
    private boolean activo;

    public Usuario() {}

    public Usuario(int idUsuario, int idRol, String nombreRol, String nombreCompleto, String usuario, String passwordHash, boolean activo) {
        this.idUsuario = idUsuario;
        this.idRol = idRol;
        this.nombreRol = nombreRol;
        this.nombreCompleto = nombreCompleto;
        this.usuario = usuario;
        this.passwordHash = passwordHash;
        this.activo = activo;
    }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    public int getIdRol() { return idRol; }
    public void setIdRol(int idRol) { this.idRol = idRol; }
    public String getNombreRol() { return nombreRol; }
    public void setNombreRol(String nombreRol) { this.nombreRol = nombreRol; }
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public String getUsuario() { return usuario; }
    public void setUsuario(String usuario) { this.usuario = usuario; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}