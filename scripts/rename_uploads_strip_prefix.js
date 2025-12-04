const fs = require('fs').promises;
const path = require('path');
const pool = require('../DB/conexion');

(async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    const files = await fs.readdir(uploadsDir);
    for (const file of files) {
      // Match pattern where a numeric prefix + '-' exists, e.g. '162123123-xyz.jpg'
      if (/^\d+-/.test(file)) {
        const newName = file.replace(/^\d+-/, '');
        const oldPath = path.join(uploadsDir, file);
        const newPath = path.join(uploadsDir, newName);
        try {
          // If target filename already exists, skip to avoid collisions
          try {
            await fs.access(newPath);
            console.log(`SKIP: Target ${newName} already exists. Will not overwrite.`);
            continue;
          } catch (e) {
            // newPath does not exist, proceed to rename
          }

          await fs.rename(oldPath, newPath);
          console.log(`Renamed: ${file} -> ${newName}`);

          // Update DB references in productos
          try {
            const [prodResult] = await pool.query('UPDATE productos SET imagen = ? WHERE imagen = ?', [newName, file]);
            if (prodResult.affectedRows > 0) console.log(`Updated ${prodResult.affectedRows} rows in productos (${file} -> ${newName})`);
          } catch (err) {
            console.error(`DB productos update error for ${file}:`, err.message);
          }

          // Update DB references in carrito
          try {
            const [cartResult] = await pool.query('UPDATE carrito SET nombre_imagen = ? WHERE nombre_imagen = ?', [newName, file]);
            if (cartResult.affectedRows > 0) console.log(`Updated ${cartResult.affectedRows} rows in carrito (${file} -> ${newName})`);
          } catch (err) {
            console.error(`DB carrito update error for ${file}:`, err.message);
          }

        } catch (err) {
          console.error(`Error renaming ${file}:`, err.message);
        }
      }
    }
    console.log('Done migration.');
    process.exit(0);
  } catch (err) {
    console.error('Unable to scan uploads directory:', err.message);
    process.exit(1);
  }
})();
