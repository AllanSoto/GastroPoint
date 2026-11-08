/**
 * Imprime un comprobante / factura limpia y completa usando un iframe dedicado,
 * evitando problemas de recorte de modales o páginas en blanco.
 */
export function printInvoiceTicket({
  businessType = 'restaurante',
  invoiceId = `FAC-${Date.now().toString().slice(-5)}`,
  tableName = 'Mesa 1',
  zone = 'Salón Principal',
  modeLabel = 'Factura Unificada de Mesa',
  items = [],
  subtotal = 0,
  tax = 0,
  tip = 0,
  tipPercentage = 10,
  total = 0,
  paymentMethod = 'tarjeta',
  cashGiven = 0,
  changeDue = 0,
  paidStatus = 'POR COBRAR',
}) {
  const isCafe = businessType === 'cafeteria';
  const businessTitle = isCafe
    ? 'GASTROPOINT CAFÉ & BRUNCH'
    : 'GASTROPOINT RESTAURANTE';

  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Agrupar items por posición para que en el ticket impreso se vea súper claro
  const groupedBySeat = {};
  items.forEach((item) => {
    const seat = Number(item.seatPosition) || 1;
    if (!groupedBySeat[seat]) {
      groupedBySeat[seat] = {
        seat,
        customerName: item.customerName || `Posición #${seat}`,
        list: [],
        seatSubtotal: 0,
      };
    }
    groupedBySeat[seat].list.push(item);
    groupedBySeat[seat].seatSubtotal += Number(item.price) || 0;
  });

  const seatsHtml = Object.values(groupedBySeat)
    .map(
      (g) => `
      <div class="seat-group">
        <div class="seat-header">
          <span>${tableName} • POSICIÓN #${g.seat} (${g.customerName})</span>
          <span>$${g.seatSubtotal.toFixed(2)}</span>
        </div>
        ${g.list
          .map(
            (ord) => `
          <div class="item-row">
            <div class="item-name">
              1x ${ord.name}
              ${ord.notes ? `<div class="item-note">Nota: "${ord.notes}"</div>` : ''}
            </div>
            <div class="item-price">$${Number(ord.price).toFixed(2)}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Factura ${invoiceId} - ${tableName}</title>
      <style>
        @page {
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          color: #111111;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.45;
        }
        .ticket {
          max-width: 360px;
          margin: 0 auto;
          padding: 12px;
          border: 1px solid #d6d3d1;
          border-radius: 8px;
        }
        .center {
          text-align: center;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 4px 0;
          letter-spacing: 0.5px;
        }
        .subtitle {
          font-size: 11px;
          color: #444;
          margin: 2px 0;
        }
        .divider {
          border-top: 1px dashed #666;
          margin: 10px 0;
        }
        .divider-solid {
          border-top: 2px solid #111;
          margin: 10px 0;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin: 3px 0;
        }
        .badge-mode {
          background: #f5f5f4;
          border: 1px solid #d6d3d1;
          padding: 4px 8px;
          font-weight: bold;
          font-size: 11px;
          margin: 6px 0;
          text-align: center;
        }
        .seat-group {
          margin-bottom: 10px;
        }
        .seat-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 11px;
          background: #f5f5f4;
          padding: 3px 6px;
          border-top: 1px solid #e7e5e4;
          border-bottom: 1px solid #e7e5e4;
          margin-bottom: 4px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2px 4px;
          font-size: 12px;
        }
        .item-name {
          flex: 1;
          padding-right: 8px;
        }
        .item-note {
          font-size: 10px;
          color: #555;
          font-style: italic;
        }
        .item-price {
          font-weight: bold;
          white-space: nowrap;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin: 3px 0;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          font-size: 16px;
          font-weight: bold;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 2px solid #111;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #444;
          margin-top: 14px;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="center">
          <div class="title">${businessTitle}</div>
          <div class="subtitle">RFC: GPO-240815-XYZ • TEL: 55-1234-5678</div>
          <div class="subtitle">Sistema Inteligente de Mesas y Posiciones</div>
        </div>

        <div class="divider"></div>

        <div class="meta-row">
          <span>FOLIO: <strong>${invoiceId}</strong></span>
          <span>ESTADO: <strong>${paidStatus}</strong></span>
        </div>
        <div class="meta-row">
          <span>FECHA: ${dateStr}</span>
          <span>HORA: ${timeStr}</span>
        </div>
        <div class="meta-row">
          <span>UBICACIÓN: <strong>${tableName} (${zone})</strong></span>
        </div>

        <div class="badge-mode">
          ${modeLabel.toUpperCase()}
        </div>

        <div class="divider"></div>

        ${seatsHtml || '<div class="center">Sin platillos registrados</div>'}

        <div class="divider"></div>

        <div class="totals-row">
          <span>SUBTOTAL CONSUMO:</span>
          <span>$${Number(subtotal).toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>IVA (16%):</span>
          <span>$${Number(tax).toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span>PROPINA / SERVICIO (${tipPercentage}%):</span>
          <span>$${Number(tip).toFixed(2)}</span>
        </div>

        <div class="grand-total">
          <span>TOTAL MXN:</span>
          <span>$${Number(total).toFixed(2)}</span>
        </div>

        <div class="divider"></div>

        <div class="meta-row">
          <span>MÉTODO DE PAGO:</span>
          <strong>${paymentMethod.toUpperCase()}</strong>
        </div>
        ${
          paymentMethod === 'efectivo' && Number(cashGiven) > 0
            ? `
          <div class="meta-row">
            <span>EFECTIVO RECIBIDO:</span>
            <span>$${Number(cashGiven).toFixed(2)}</span>
          </div>
          <div class="meta-row">
            <span>CAMBIO ENTREGADO:</span>
            <strong>$${Number(changeDue).toFixed(2)}</strong>
          </div>
        `
            : ''
        }

        <div class="footer">
          <strong>¡GRACIAS POR SU VISITA!</strong><br/>
          Comprobante detallado por Mesa y Posición
        </div>
      </div>
    </body>
    </html>
  `;

  // Crear iframe oculto para imprimir sin salir ni alterar la ventana actual
  const existingIframe = document.getElementById('gastro-print-iframe');
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'gastro-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 250);
}

