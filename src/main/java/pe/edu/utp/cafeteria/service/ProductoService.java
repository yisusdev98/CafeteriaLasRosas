package pe.edu.utp.cafeteria.service;

import pe.edu.utp.cafeteria.dao.ProductoDAO;
import pe.edu.utp.cafeteria.model.Producto;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Service
public class ProductoService {

    private final ProductoDAO productoDAO;

    public ProductoService(ProductoDAO productoDAO) {
        this.productoDAO = productoDAO;
    }

    public Producto[] obtenerCatalogoOrdenadoPorPrecio() {
        List<Producto> lista = productoDAO.listarActivos();
        Producto[] arreglo = lista.toArray(new Producto[0]);
        Arrays.sort(arreglo, Comparator.comparingDouble(Producto::getPrecio));
        return arreglo;
    }

    public boolean guardarProducto(Producto p) {
        return productoDAO.registrar(p) > 0;
    }
}