const productoModelo = require('../Modelo/productoModelo.js');

//GET /api/productos
const getProductos = async (req, res) => {
    try{
        const productos = await productoModelo.getAllProductos();
        res.json(productos);
    }catch(error){
        console.error('Error al obtener Productos: ', error);
        res.status(500).json({mensaje: 'Error al obtener los productos'});
    }
};

//GET /api/productos/:id
const getProductosById = async (req, res) => {
    try{
        const {id} = req.params;
        const producto = await productoModelo.getProductoById(id);
        if(!producto)
            return res.status(404).json({mensaje: 'Producto no encontrado'});
        res.json(producto);
    }catch(error){
        console.error('Error al obtener el producto:', error);
        res.status(500).json({mensaje: 'Error al obtener el producto'});
    }
};

//GET /api/productos/genero/:genero
const getProductosByGenero = async (req, res) => {
    try{
        const {genero} = req.params;
        if(!genero) {
            return res.status(400).json({mensaje: 'El parámetro género es requerido'});
        }
        const productos = await productoModelo.getProductoByGenero(genero); 
        if(productos.length === 0) {
            return res.status(404).json({ 
                mensaje: `No se encontraron productos para el género: ${genero}` 
            });
        }
        res.json({
            success: true,
            count: productos.length,
            data: productos
        });
    }catch(error){
        console.error('Error al obtener productos por género:', error);
        res.status(500).json({mensaje: 'Error interno del servidor'});
    }
};

//POST /api/productos
const createProducto = async(req, res) => {
    try{
        console.log(req.body);
        const {titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta} = req.body;
        if(!titulo || !artista || !descripcion || precio === undefined || disponibilidad=== undefined || !genero || ventas=== undefined || !imagen || oferta=== undefined) //puede llegar un 0 y tomarlo como falso, por eso se coloca undefined
            return res.status(400).json({mensaje: 'Faltan datos obligatorios'});
        console.log("1");
        const id_insertado = await productoModelo.createProducto(titulo, artista, descripcion, precio, disponibilidad, genero, ventas, imagen, oferta);
        res.status(201).json({mensaje: 'Producto agregado', id_insertado});
        console.log("2");
    }catch(error){
        console.error('Error al agregar el producto: ', error);
        res.status(500).json({mensaje: 'Error al agregar el producto'});
    }
};

//PUT /api/productos/:id
const updateProducto = async(req, res) => {
    try{
        const {id} = req.params;
        const {disponibilidad, ventas} = req.body;
        const filas = await productoModelo.updateDisponibilidadYventas(id, disponibilidad, ventas);
        if(filas === 0)
            return res.status(404).json({mensaje: 'Producto no encontrado'});
        res.json({mensaje: 'Producto actualizado correctamente'});
    }catch(error){
        console.error('Error al actualizar el producto: ', error);
        res.status(500).json({mensaje: 'Error al actualizar el producto'});
    }
};

//PUT /api/productos/oferta/:id
const updateOferta = async(req, res) => {
    try{
        const {id} = req.params;
        const {oferta} = req.body;
        const filas = await productoModelo.updateOferta(id, oferta);
        if(filas === 0)
            return res.status(404).json({mensaje: 'Producto no encontrado'});
        res.json({mensaje: 'Producto actualizado correctamente'});
    }catch(error){
        console.error('Error al actualizar el producto: ', error);
        res.status(500).json({mensaje: 'Error al actualizar el producto'});
    }
};

//Delete /api/productos/:id
const deleteProducto = async (req, res) =>{
    try{
        const {id} = req.params;
        const filas = await productoModelo.deleteProducto(id);
        if(filas === 0)
            return res.status(404).json({mensaje: 'Producto no encontrado'});
        res.json({mensaje: 'Producto eliminado correctamente'});
    }catch(error){
        console.error('Error al eliminar el producto: ', error);
        res.status(500).json({mensaje: 'Error al eliminar el producto'});
    }
};

module.exports = {
    getProductos,
    getProductosById,
    getProductosByGenero,
    createProducto,
    updateProducto,
    updateOferta,
    deleteProducto
};