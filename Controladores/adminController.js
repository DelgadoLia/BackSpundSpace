const path = require('path');
const fs = require('fs');
const productoModelo = require('../Modelo/productoModelo');

// Ruta real hacia /uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

/* ============================================================
   CREAR PRODUCTO
============================================================ */
exports.createProducto = async (req, res) => {
    const { titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta } = req.body;

    // Nombre final de imagen
    let imagenFilename = null;

    if (req.file) {
        imagenFilename = req.file.filename;
    } else if (imagen) {
        imagenFilename = path.basename(imagen);
    }

    try {
        const id = await productoModelo.createProducto(
            titulo,
            artista,
            descripcion,
            Number(precio) || 0,
            Number(disponibilidad) || 0,
            genero,
            Number(ventas) || 0,
            imagenFilename,
            Number(oferta) || 0
        );

        res.json({ success: true, id });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ============================================================
   OBTENER TODO EL INVENTARIO
============================================================ */
exports.getInventario = async (req, res) => {
    try {
        const productos = await productoModelo.getAllProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ============================================================
   TOTAL VENTAS
============================================================ */
exports.totalVentas = async (req, res) => {
    try {
        const productos = await productoModelo.getAllProductos();

        const total = productos.reduce((acc, p) => {
            const precio = Number(p.precio || p.Precio || 0);
            const ventas = Number(p.ventas || p.Ventas || 0);
            return acc + (precio * ventas);
        }, 0);

        res.json({ success: true, total });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ============================================================
   ACTUALIZAR PRODUCTO
============================================================ */
exports.updateProducto = async (req, res) => {

    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });

    const { titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta } = req.body;

    try {
        const existing = await productoModelo.getProductoById(Number(id));
        if (!existing) return res.status(404).json({ success: false, message: 'Producto no encontrado' });

        let imagenFilename = existing.imagen;

        // Si suben una nueva imagen
        if (req.file) {
            const newName = req.file.filename;
            imagenFilename = newName;

            // eliminar imagen anterior si existe
            if (existing.imagen) {
                const oldPath = path.join(uploadsDir, existing.imagen);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        } 
        // Si envían el nombre manual desde el front
        else if (imagen) {
            imagenFilename = path.basename(imagen);
        }

        const updated = await productoModelo.updateProducto(
            Number(id),
            titulo ?? existing.titulo,
            artista ?? existing.artista,
            descripcion ?? existing.descripcion,
            Number(precio ?? existing.precio) || 0,
            Number(disponibilidad ?? existing.disponibilidad) || 0,
            genero ?? existing.genero,
            Number(ventas ?? existing.ventas) || 0,
            imagenFilename,
            Number(oferta ?? existing.oferta) || 0
        );

        res.json({ success: true, updated });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ============================================================
   ELIMINAR PRODUCTO
============================================================ */
exports.deleteProducto = async (req, res) => {

    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });

    try {
        const existing = await productoModelo.getProductoById(Number(id));

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        // borrar imagen
        if (existing.imagen) {
            const imgPath = path.join(uploadsDir, existing.imagen);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        const affected = await productoModelo.deleteProducto(Number(id));

        res.json({ success: true, deleted: affected });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
