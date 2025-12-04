const multer = require("multer");
const path = require("path");

// Configurar dónde se guardarán las imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads"));  // Carpeta donde se suben las imágenes
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext)
                      .replace(/\s+/g, "-")
                      .replace(/[^a-zA-Z0-9._-]/g, ""); // Sanitiza nombres raros

        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

// Filtro opcional por tipo de archivo
const fileFilter = (req, file, cb) => {
    const allowed = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Formato no permitido"), false);
    }
    cb(null, true);
};

// Crear middleware final
const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
