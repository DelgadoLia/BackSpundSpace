const productoModelo = require('../Modelo/productoModelo');
const path = require('path');
const fs = require('fs');

// Función auxiliar para manejar la lógica de renombrado de archivos
async function handleImageRenaming(req, imagen) {
    // Si no hay archivo subido, no hay nada que renombrar
    if (!req.file) {
        // Si no hay archivo, pero sí un nombre de 'imagen' en el body, lo sanitizamos.
        return imagen ? path.basename(imagen).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '') : null;
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const currentPath = path.join(uploadsDir, req.file.filename);
    let imagenFilename = req.file.filename;

    // Lógica para renombrar el archivo si el usuario envió un nombre deseado ('imagen')
    if (imagen) {
        try {
            // 1. Sanitizar el nombre deseado
            let desiredName = path.basename(imagen).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
            
            // 2. Asegurar que el nombre deseado tenga la extensión del archivo subido
            const uploadedExt = path.extname(req.file.filename);
            if (!path.extname(desiredName)) {
                desiredName = desiredName + uploadedExt;
            }

            let targetPath = path.join(uploadsDir, desiredName);
            let finalName = desiredName;

            // 3. Checar si el nombre deseado ya existe (evitar sobrescribir)
            if (req.file.filename !== desiredName) {
                let copyIndex = 1;
                while (fs.existsSync(targetPath)) {
                    const base = path.basename(desiredName, path.extname(desiredName));
                    const ext = path.extname(desiredName);
                    const suffix = copyIndex === 1 ? '-copy' : `-copy${copyIndex}`;
                    finalName = `${base}${suffix}${ext}`;
                    targetPath = path.join(uploadsDir, finalName);
                    copyIndex++;
                }
                
                // 4. Renombrar el archivo
                await fs.promises.rename(currentPath, targetPath);
                imagenFilename = finalName;
            }
        } catch (err) {
            console.error('Error renombrando archivo:', err.message);
            // Si el renombrado falla, se conserva el nombre temporal de Multer.
        }
    }
    return imagenFilename;
}

// POST /inventario
exports.createProducto = async (req, res) => {
    const { titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta } = req.body;
    
    // Obtener el nombre de archivo final (gestionando la subida y el renombrado)
    let imagenFilename = await handleImageRenaming(req, imagen);
    
    // Validar que los campos obligatorios estén presentes
    if (!titulo || !artista || !descripcion || !precio || !disponibilidad || !genero || !imagenFilename) {
        return res.status(400).json({ success: false, message: 'Todos los campos obligatorios (título, artista, descripción, precio, disponibilidad, género, imagen) deben estar presentes.' });
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
        res.json({ success: true, id, message: 'Producto creado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /inventario
exports.getAllProductos = async (req, res) => {
    try {
        const productos = await productoModelo.getAllProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /totalventas
exports.getTotalVentas = async (req, res) => {
    try {
        const productos = await productoModelo.getAllProductos();
        const totalVentas = productos.reduce((acc, p) => {
            // Asegurarse de usar las claves correctas y convertir a número
            const precio = Number(p.precio || p.Precio || 0);
            const ventas = Number(p.ventas || p.Ventas || 0);
            return acc + (precio * ventas);
        }, 0);
        res.json({ success: true, total: totalVentas.toFixed(2) }); // Formato a 2 decimales
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /inventario/:id
exports.updateProducto = async (req, res) => {
    const { id } = req.params;
    const { titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta } = req.body;
    
    // Obtener el nombre de archivo final (gestionando la subida y el renombrado)
    let imagenFilename = await handleImageRenaming(req, imagen);
    
    if (!id) return res.status(400).json({ success: false, message: 'ID de producto requerido.' });
    
    try {
        // 1. Obtener producto existente para usar valores por defecto si no se envían en el body
        const existing = await productoModelo.getProductoById(Number(id));
        if (!existing) {
            // Si se subió un archivo, lo borramos ya que el producto no existe
            if (req.file) {
                const uploadsDir = path.join(__dirname, '..', 'uploads');
                fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
                    if (err) console.error('Error al borrar archivo subido para producto inexistente:', err.message);
                });
            }
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        
        // 2. Ejecutar la actualización con valores fusionados
        const updated = await productoModelo.updateProducto(
            Number(id),
            titulo ?? existing.titulo,
            artista ?? existing.artista,
            descripcion ?? existing.descripcion,
            Number(precio ?? existing.precio) || 0,
            Number(disponibilidad ?? existing.disponibilidad) || 0,
            genero ?? existing.genero,
            Number(ventas ?? existing.ventas) || 0,
            // Precedencia: 1. Nuevo archivo renombrado, 2. Nombre en el body, 3. Imagen existente
            (imagenFilename ?? imagen ?? existing.imagen), 
            Number(oferta ?? existing.oferta) || 0
        );
        
        res.json({ success: true, updated, message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /inventario/:id
exports.deleteProducto = async (req, res) => {
    const { id } = req.params;
    
    if (!id) return res.status(400).json({ success: false, message: 'ID de producto requerido.' });
    
    try {
        const affected = await productoModelo.deleteProducto(Number(id));
        
        if (affected > 0) {
            res.json({ success: true, deleted: affected, message: `Producto con ID ${id} eliminado.` });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};