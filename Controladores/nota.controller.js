const pool = require('../DB/conexion');
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create transporter similar to correoControlador
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.CORREO_APP,
    pass: process.env.PASS_APP
  },
  tls: { rejectUnauthorized: false }
});

// Helper: format currency
function fmt(n) { return `$${Number(n).toFixed(2)}`; }

exports.enviarNotaCompra = async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ success: false, message: 'usuario_id es requerido' });

  try {
    // 1) Obtener datos del usuario
    const [userRows] = await pool.query('SELECT id, nombreCompleto, correo FROM usuarios WHERE id = ?', [usuario_id]);
    const user = userRows[0];

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // 2) Obtener items del carrito para el usuario (incluye product_id para actualizar stock)
    const [items] = await pool.query(`
      SELECT c.id as carrito_id, c.producto_id, c.cantidad, c.nombre_imagen, p.titulo, p.precio, p.oferta, p.disponibilidad
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [usuario_id]);

    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'El carrito está vacío' });

    // 3) Calcular totales
    let subtotal = 0;
    items.forEach(i => {
      const precio = Number(i.precio || 0);
      const oferta = Number(i.oferta || 0);
      const unit = oferta > 0 ? precio * (1 - oferta/100) : precio;
      subtotal += unit * Number(i.cantidad || 1);
    });

    // 4) Obtener tarifas según país (fallback a México)
    const { pais } = req.body;
    const paisReq = (typeof pais === 'string' && pais.trim() !== '') ? pais.trim() : 'México';
    let impuestoRate = 0.16;
    let envioFlat = 15.00;

    try {
      const [rows] = await pool.query(
        'SELECT impuesto, envio FROM tarifas_envio_impuestos WHERE pais = ?',
        [paisReq]
      );
      if (rows && rows.length > 0) {
        impuestoRate = Number(rows[0].impuesto);
        envioFlat = Number(rows[0].envio);
      } else {
        // no encontrado: dejar fallback y/o registrar
        console.warn(`Tarifa para país "${paisReq}" no encontrada. Usando defaults.`);
      }
    } catch (err) {
      console.error('Error consultando tarifas:', err.message);
      // seguir con defaults
    }

    const impuestos = subtotal * impuestoRate;
    const gastosEnvio = subtotal > 0 ? envioFlat : 0.00;

    // 5) Aplicar cupon si viene
    const { cupon_codigo, cupon_descuento } = req.body;

    // Aplicar cupón si existe
    let cuponNombre = null;
    let cuponAplicado = 0;

    if (cupon_codigo && cupon_descuento) {
        cuponNombre = cupon_codigo;
        cuponAplicado = (subtotal * (cupon_descuento / 100));
    }

    const total = subtotal + impuestos + gastosEnvio - cuponAplicado;

    // 6) Crear PDF en memoria con pdfkit
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({ initialSize: (100 * 1024), incrementAmount: (10 * 1024) });

    doc.pipe(writableStreamBuffer);

    // Header: company info
    const companyName = 'SpaceSound';
    const logoPath = path.join(__dirname, '..', 'uploads', 'logo.png');
    const slogan = 'La ciudad donde la música nunca deja de girar';

    // Draw logo if present
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 80 });
      }
    } catch (err) {
      // ignore; continue
    }

    doc.fontSize(20).text(companyName, 140, 50);
    doc.fontSize(10).text(slogan, 140, 75);

    // Date / Time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    doc.fontSize(10).text(`Fecha: ${date}`, 400, 50);
    doc.fontSize(10).text(`Hora: ${time}`, 400, 65);

    // Cliente info
    doc.moveDown();
    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${user.nombreCompleto || ''}`);
    doc.fontSize(12).text(`Email: ${user.correo || ''}`);
    doc.fontSize(12).text(`País de Envío: ${paisReq}`);
    
    // Table header
    doc.moveDown();
    doc.fontSize(12).text('Detalles de la compra:', { underline: true });
    doc.moveDown(0.5);

    // Table columns
    const tableTop = doc.y;
    doc.fontSize(10).text('Producto', 50, tableTop);
    doc.text('Precio unidad', 300, tableTop);
    doc.text('Cantidad', 380, tableTop);
    doc.text('Subtotal', 450, tableTop);
    doc.moveDown(0.5);

    // Items rows (aligned as columns)
    const colX = { title: 50, price: 300, qty: 380, subtotal: 450 };
    const titleWidth = 240;
    const priceWidth = 70; // width for price column
    const qtyWidth = 40; // width for quantity
    const subtotalWidth = 100; // width for subtotal

    items.forEach(item => {
      const precio = Number(item.precio || 0);
      const oferta = Number(item.oferta || 0);
      const unit = oferta > 0 ? precio * (1 - oferta/100) : precio;
      const lineSubtotal = unit * Number(item.cantidad || 1);

      // Current Y for row
      const y = doc.y;

      // Title (may wrap) - calculate height so next row keeps vertical alignment
      doc.fontSize(10).text(item.titulo, colX.title, y, { width: titleWidth });

      // Price - right aligned in its column
      doc.fontSize(10).text(fmt(unit), colX.price, y, { width: priceWidth, align: 'right' });

      // Quantity - centered
      doc.fontSize(10).text(`${item.cantidad}`, colX.qty, y, { width: qtyWidth, align: 'center' });

      // Subtotal - right aligned in its column
      doc.fontSize(10).text(fmt(lineSubtotal), colX.subtotal, y, { width: subtotalWidth, align: 'right' });

      // Compute height taken by the title; use it to move to next row properly
      const titleHeight = doc.heightOfString(String(item.titulo), { width: titleWidth, align: 'left' });
      const rowHeight = Math.max(titleHeight, 12) + 6; // add a small padding
      doc.y = y + rowHeight;
    });

    // Totals block
    doc.moveDown(1);
    doc.fontSize(10).text(`Subtotal: ${fmt(subtotal)}`, { align: 'right' });
    doc.text(`Impuestos (${(impuestoRate * 100).toFixed(0)}%): ${fmt(impuestos)}`, { align: 'right' });
    doc.text(`Gastos de Envío: ${fmt(gastosEnvio)}`, { align: 'right' });
    if (cuponNombre) {
        doc.text(`Cupón: ${cuponNombre} (-${fmt(cuponAplicado)})`, { align: 'right' });
    }
    doc.moveDown(0.2);
    doc.fontSize(12).text(`Total: ${fmt(total)}`, { align: 'right', underline: true });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Gracias por tu compra. ¡Que disfrutes tu música!', { align: 'center' });

    // End the PDF document and wait for the writable buffer to finish
    doc.end();
    await new Promise((resolve, reject) => {
      writableStreamBuffer.on('finish', resolve);
      writableStreamBuffer.on('error', reject);
    });

    const pdfBuffer = writableStreamBuffer.getContents();
    if (!pdfBuffer) {
      console.error('PDF generation failed: buffer is empty');
      return res.status(500).json({ success: false, message: 'Error generando PDF' });
    }
    console.log('PDF generated, size:', pdfBuffer.length);
    // Optional: save a copy in uploads if DEBUG env flag enabled (helpful for troubleshooting)
    if (process.env.SAVE_PDF_COPY === '1') {
      try {
        const outPath = path.join(__dirname, '..', 'uploads', `nota_compra_${usuario_id}_${Date.now()}.pdf`);
        fs.writeFileSync(outPath, pdfBuffer);
        console.log('Saved PDF copy to', outPath);
      } catch (err) {
        console.warn('Could not save PDF copy:', err.message);
      }
    }

    // 7) Enviar mail con adjunto PDF
    const html = `
      <h3>Gracias por tu compra, ${user.nombreCompleto || ''}</h3>
      <p>Adjuntamos la nota de compra en PDF.</p>
      <p>Resumen: Subtotal: ${fmt(subtotal)} | Impuestos: ${fmt(impuestos)} | Envío: ${fmt(gastosEnvio)} | Total: ${fmt(total)}</p>
    `;

    const mailOptions = {
      from: `"${companyName}" <${process.env.CORREO_APP}>`,
      to: user.correo,
      subject: `Nota de compra - ${companyName}`,
      html,
      attachments: [
        {
          filename: `nota_compra_${usuario_id}_${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
          contentDisposition: 'attachment'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    // 8) Reducir stock en BD (disponibilidad) por la cantidad que se compró
    // Usamos una transacción para asegurar consistencia
    try {
      await pool.query('START TRANSACTION');

      for (const item of items) {
        const qty = Number(item.cantidad) || 1;

        const [updateResult] = await pool.query(
          `UPDATE productos
           SET disponibilidad = GREATEST(disponibilidad - ?, 0),
               ventas = ventas + ?,
               vendidos = vendidos + ?
           WHERE id = ?`,
          [qty, qty, qty, item.producto_id]
        );

        if (updateResult.affectedRows === 0) {
          console.warn(`No se actualizó stock/ventas para producto_id ${item.producto_id}`);
        }
      }

      await pool.query('COMMIT');
    } catch (txErr) {
      console.error('Error en transacción de actualización:', txErr.message);
      await pool.query('ROLLBACK');
      return res.status(500).json({ success: false, message: 'Error actualizando inventario/ventas' });
    }

    // 9)Limpiar carrito después de compra
    try {
      await pool.query("DELETE FROM carrito WHERE usuario_id = ?", [usuario_id]);
      console.log(`Carrito del usuario ${usuario_id} limpiado`);
    } catch (err) {
      console.error("Error al limpiar carrito:", err.message);
      // No detenemos la compra porque el usuario ya pagó y ya se envió el email.
    }

    return res.json({ success: true, message: 'Nota enviada correctamente' });

  } catch (err) {
    console.error('Error enviarNotaCompra:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
