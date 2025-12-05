const pool = require('../DB/conexion');
const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');
const path = require('path');
const fs = require('fs');
const { sendEmailWithAttachment } = require('../config/resend'); // NUEVA IMPORTACIÓN

// Helper: format currency
function fmt(n) { return `$${Number(n).toFixed(2)}`; }

exports.enviarNotaCompra = async (req, res) => {
  const { usuario_id } = req.body;
  if (!usuario_id) return res.status(400).json({ success: false, message: 'usuario_id es requerido' });

  try {
    console.log('=== INICIANDO NOTA DE COMPRA ===');
    console.log('Usuario ID:', usuario_id);
    console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'resend');

    // 1) Obtener datos del usuario
    const [userRows] = await pool.query('SELECT id, nombreCompleto, correo, pais FROM usuarios WHERE id = ?', [usuario_id]);
    const user = userRows[0];

    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // 2) Obtener items del carrito
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

    // 4) Obtener tarifas según país
    const paisUsuario = user.pais || 'México';
    let impuestoPorcentaje = 16;
    let impuestoRate = 0.16;
    let envioFlat = 15.00;

    try {
      const [rows] = await pool.query(
        'SELECT impuesto, envio FROM tarifas_envio_impuestos WHERE pais = ?',
        [paisUsuario]
      );
      if (rows && rows.length > 0) {
        const impuestoValue = Number(rows[0].impuesto);
        impuestoPorcentaje = impuestoValue > 1 ? impuestoValue : impuestoValue * 100;
        impuestoRate = impuestoPorcentaje / 100;
        envioFlat = Number(rows[0].envio);
      }
    } catch (err) {
      console.error('Error consultando tarifas:', err.message);
    }

    const impuestos = subtotal * impuestoRate;
    const gastosEnvio = subtotal > 0 ? envioFlat : 0.00;

    // 5) Aplicar cupon si viene
    const { cupon_codigo, cupon_descuento } = req.body;
    let cuponNombre = null;
    let cuponAplicado = 0;

    if (cupon_codigo && cupon_descuento) {
        cuponNombre = cupon_codigo;
        cuponAplicado = (subtotal * (cupon_descuento / 100));
    }

    const total = subtotal + impuestos + gastosEnvio - cuponAplicado;

    // 6) Crear PDF
    console.log('Generando PDF...');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({ 
      initialSize: (100 * 1024), 
      incrementAmount: (10 * 1024) 
    });

    doc.pipe(writableStreamBuffer);

    // Header
    const companyName = 'SpaceSound';
    const logoPath = path.join(__dirname, '..', 'uploads', 'logo.png');
    const slogan = 'La ciudad donde la música nunca deja de girar';

    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 80 });
      }
    } catch (err) {}

    doc.fontSize(20).text(companyName, 140, 50);
    doc.fontSize(10).text(slogan, 140, 75);

    // Fecha/Hora
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
    doc.fontSize(12).text(`País de Envío: ${paisUsuario}`);
    
    // Tabla
    doc.moveDown();
    doc.fontSize(12).text('Detalles de la compra:', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(10).text('Producto', 50, tableTop);
    doc.text('Precio unidad', 300, tableTop);
    doc.text('Cantidad', 380, tableTop);
    doc.text('Subtotal', 450, tableTop);
    doc.moveDown(0.5);

    const colX = { title: 50, price: 300, qty: 380, subtotal: 450 };
    const titleWidth = 240;

    items.forEach(item => {
      const precio = Number(item.precio || 0);
      const oferta = Number(item.oferta || 0);
      const unit = oferta > 0 ? precio * (1 - oferta/100) : precio;
      const lineSubtotal = unit * Number(item.cantidad || 1);

      const y = doc.y;
      doc.fontSize(10).text(item.titulo, colX.title, y, { width: titleWidth });
      doc.fontSize(10).text(fmt(unit), colX.price, y, { width: 70, align: 'right' });
      doc.fontSize(10).text(`${item.cantidad}`, colX.qty, y, { width: 40, align: 'center' });
      doc.fontSize(10).text(fmt(lineSubtotal), colX.subtotal, y, { width: 100, align: 'right' });

      const titleHeight = doc.heightOfString(String(item.titulo), { width: titleWidth, align: 'left' });
      const rowHeight = Math.max(titleHeight, 12) + 6;
      doc.y = y + rowHeight;
    });

    // Totales
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

    // Finalizar PDF
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
    
    console.log(`PDF generado (${pdfBuffer.length} bytes)`);

    // 7) Enviar email con Resend
    const html = `
      <h3>Gracias por tu compra, ${user.nombreCompleto || ''}</h3>
      <p>Adjuntamos la nota de compra en PDF.</p>
      <p>Resumen: Subtotal: ${fmt(subtotal)} | Impuestos: ${fmt(impuestos)} | Envío: ${fmt(gastosEnvio)} | Total: ${fmt(total)}</p>
    `;

    const fromAddress = process.env.EMAIL_FROM || 'SoundSpace <talesturntable@gmail.com>';
    
    console.log('Enviando email con attachment...');
    
    await sendEmailWithAttachment({
      from: fromAddress,
      to: user.correo,
      subject: `Nota de compra - ${companyName}`,
      html: html,
      attachments: [
        {
          filename: `nota_compra_${usuario_id}_${Date.now()}.pdf`,
          content: pdfBuffer
        }
      ]
    });

    // 8) Reducir stock en BD
    try {
      await pool.query('START TRANSACTION');

      for (const item of items) {
        const qty = Number(item.cantidad) || 1;
        await pool.query(
          `UPDATE productos
           SET disponibilidad = GREATEST(disponibilidad - ?, 0),
               ventas = ventas + ?,
               vendidos = vendidos + ?
           WHERE id = ?`,
          [qty, qty, qty, item.producto_id]
        );
      }

      await pool.query('COMMIT');
      console.log('Stock actualizado correctamente');
    } catch (txErr) {
      console.error('Error en transacción:', txErr.message);
      await pool.query('ROLLBACK');
      return res.status(500).json({ success: false, message: 'Error actualizando inventario' });
    }

    // 9) Limpiar carrito
    try {
      await pool.query("DELETE FROM carrito WHERE usuario_id = ?", [usuario_id]);
      console.log(`Carrito limpiado para usuario ${usuario_id}`);
    } catch (err) {
      console.error("Error al limpiar carrito:", err.message);
    }

    return res.json({ success: true, message: 'Nota enviada correctamente' });

  } catch (err) {
    console.error('Error en enviarNotaCompra:', err.message);
    console.error('Stack:', err.stack);
    return res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};