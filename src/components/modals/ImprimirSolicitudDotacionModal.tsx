import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Mail,
  Copy,
  Check,
  FileText,
  Building2,
  User,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Laptop,
  Heart
} from 'lucide-react';
import { Residente, DotacionResidente, SedeCentro } from '../../types';

interface ImprimirSolicitudDotacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  residente: Residente;
  articulos: DotacionResidente[];
  activeSede: SedeCentro;
}

export const ImprimirSolicitudDotacionModal: React.FC<ImprimirSolicitudDotacionModalProps> = ({
  isOpen,
  onClose,
  residente,
  articulos,
  activeSede
}) => {
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [copiadoHTML, setCopiadoHTML] = useState(false);
  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const [telefonoDestino, setTelefonoDestino] = useState(
    residente.acudientes && residente.acudientes.length > 0 ? residente.acudientes[0].telefono : ''
  );
  const [correoDestino, setCorreoDestino] = useState(
    residente.acudientes && residente.acudientes.length > 0 ? residente.acudientes[0].email || '' : ''
  );

  if (!isOpen) return null;

  const hoy = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const radicado = `REQ-DOT-${residente.codigoExpediente}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
  const totalUnidades = articulos.reduce((acc, it) => acc + (it.cantidad || 1), 0);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 4000);
  };

  // Generar texto plano con viñetas para WhatsApp
  const generarTextoWhatsApp = () => {
    let msg = `🏥 *SAMANYA OS - SOLICITUD DE DOTACIÓN E INSUMOS*\n`;
    msg += `📄 *Radicado:* ${radicado}\n`;
    msg += `👤 *Residente:* ${residente.nombreCompleto}\n`;
    msg += `🆔 *Identificación:* ${residente.tipoIdentificacion} ${residente.identificacion}\n`;
    msg += `🏷️ *Expediente:* ${residente.codigoExpediente}\n`;
    msg += `📍 *Sede:* ${activeSede.nombre} - Hab. ${residente.habitacion} (Cama ${residente.cama})\n`;
    msg += `📅 *Fecha:* ${hoy}\n\n`;

    msg += `🌸 *Estimada Familia y Acudientes:*\n`;
    msg += `Reciban un cordial y afectuoso saludo de parte de todo el equipo de ${activeSede.nombre}. Esperando que se encuentren muy bien, nos comunicamos con el compromiso de siempre hacia el bienestar, la comodidad y el cuidado integral de *${residente.nombreCompleto}*.\n\n`;
    msg += `Con el fin de mantener su dotación personal al día y brindarle la mayor dignidad y confort en sus actividades diarias, nos permitimos solicitarles amablemente su valiosa colaboración con el suministro o reposición de los artículos que relacionamos a continuación:\n\n`;

    msg += `📦 *ARTÍCULOS SOLICITADOS (${articulos.length} ítems • ${totalUnidades} unidades):*\n`;

    articulos.forEach((art, idx) => {
      msg += `\n*${idx + 1}. ${art.nombreElemento}* (Cant: ${art.cantidad})\n`;
      msg += `   • Categoría: ${art.categoria}\n`;
      if (art.prioridad) msg += `   • Prioridad: ${art.prioridad}\n`;
      if (art.condicionEntrega) msg += `   • Estado: ${art.condicionEntrega}\n`;
      if (art.fechaRequerida) msg += `   • Fecha requerida: ${art.fechaRequerida}\n`;
      if (art.notas) msg += `   • Detalle: ${art.notas}\n`;
    });

    msg += `\nAgradecemos de todo corazón su confianza, cariño y apoyo constante con el cuidado de nuestro querido residente.\n\n`;
    msg += `✍️ *Atentamente,*\nAdministración y Cuidado Asistencial\n${activeSede.nombre} • Samanya OS`;
    return msg;
  };

  // Generar plantilla de Correo Electrónico HTML enriquecido con diseño idéntico al de pantalla y texto blanco garantizado
  const generarHTMLCorreo = () => {
    return `
<div style="max-width: 680px; margin: 0 auto; background-color: #ffffff; border: 2px solid #DEDBD1; border-radius: 16px; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; color: #26241F;">
  <!-- Membrete Requisición -->
  <table style="width: 100%; border-bottom: 2px solid #182F28; padding-bottom: 12px; margin-bottom: 16px; border-collapse: collapse;">
    <tr>
      <td style="vertical-align: top; text-align: left;">
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #182F28; font-family: Georgia, serif; letter-spacing: -0.3px;">
          SAMANYA OS &bull; REQUISICI&Oacute;N DE DOTACI&Oacute;N
        </h3>
        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #5C6058; text-transform: uppercase;">
          ${activeSede.nombre} &bull; Habitaci&oacute;n ${residente.habitacion} (Cama ${residente.cama})
        </p>
      </td>
      <td style="vertical-align: top; text-align: right; width: 230px;">
        <div style="display: inline-block; background-color: #F7F6F2; border: 1px solid #DEDBD1; border-radius: 6px; padding: 4px 8px; font-family: monospace; font-size: 11px; font-weight: 700; color: #182F28;">
          ${radicado}
        </div>
        <div style="font-size: 10px; color: #7A745F; margin-top: 4px;">
          Fecha: ${hoy}
        </div>
      </td>
    </tr>
  </table>

  <!-- Ficha Informativa del Residente (4 Columnas) -->
  <table style="width: 100%; background-color: #FAF9F6; border: 1px solid #DEDBD1; border-radius: 12px; margin-bottom: 16px; border-collapse: separate; padding: 12px 14px;">
    <tr>
      <td style="width: 28%; vertical-align: top; padding: 2px 4px;">
        <span style="font-size: 9.5px; font-family: monospace; font-weight: 700; color: #7A745F; text-transform: uppercase; display: block; margin-bottom: 3px;">RESIDENTE</span>
        <strong style="font-size: 12.5px; color: #182F28; display: block;">${residente.nombreCompleto}</strong>
      </td>
      <td style="width: 24%; vertical-align: top; padding: 2px 4px;">
        <span style="font-size: 9.5px; font-family: monospace; font-weight: 700; color: #7A745F; text-transform: uppercase; display: block; margin-bottom: 3px;">EXPEDIENTE</span>
        <strong style="font-size: 12.5px; color: #182F28; display: block;">${residente.codigoExpediente}</strong>
      </td>
      <td style="width: 24%; vertical-align: top; padding: 2px 4px;">
        <span style="font-size: 9.5px; font-family: monospace; font-weight: 700; color: #7A745F; text-transform: uppercase; display: block; margin-bottom: 3px;">IDENTIFICACI&Oacute;N</span>
        <strong style="font-size: 12.5px; color: #182F28; display: block;">${residente.tipoIdentificacion} ${residente.identificacion}</strong>
      </td>
      <td style="width: 24%; vertical-align: top; padding: 2px 4px;">
        <span style="font-size: 9.5px; font-family: monospace; font-weight: 700; color: #7A745F; text-transform: uppercase; display: block; margin-bottom: 3px;">MOVILIDAD</span>
        <strong style="font-size: 12.5px; color: #182F28; display: block;">${residente.nivelMovilidad || 'Dependiente Total'}</strong>
      </td>
    </tr>
  </table>

  <!-- Mensaje Amable y Cálido de Solicitud Formal -->
  <table style="width: 100%; background-color: #FAF9F6; border: 1px solid #DEDBD1; border-left: 6px solid #B3803F; border-radius: 12px; margin-bottom: 20px; border-collapse: separate;">
    <tr>
      <td style="padding: 18px 24px 18px 32px; text-align: left;">
        <p style="margin: 0 0 10px 0; font-size: 13.5px; font-weight: bold; color: #182F28; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Estimada Familia y Acudientes:
        </p>
        <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #3A3830; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Reciban un cordial y afectuoso saludo de parte del equipo asistencial de <strong>${activeSede.nombre}</strong>. Esperamos que se encuentren muy bien.
        </p>
        <p style="margin: 0 0 10px 0; font-size: 12.5px; color: #3A3830; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Con el compromiso permanente de brindar a <strong>${residente.nombreCompleto}</strong> la mayor comodidad, dignidad y bienestar en su d&iacute;a a d&iacute;a, nos permitimos solicitarles amablemente su colaboraci&oacute;n con el suministro o reposici&oacute;n de la dotaci&oacute;n personal que relacionamos a continuaci&oacute;n:
        </p>
        <p style="margin: 0; font-size: 11.5px; color: #7A745F; font-style: italic; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Agradecemos de coraz&oacute;n su constante apoyo, confianza y compromiso de siempre con su cuidado integral.
        </p>
      </td>
    </tr>
  </table>

  <!-- Tabla de Artículos Solicitados (Encabezado con Letra Blanca Indestructible) -->
  <table style="width: 100%; border-collapse: collapse; border: 1px solid #DEDBD1; border-radius: 10px; overflow: hidden; margin-bottom: 16px;">
    <thead>
      <tr bgcolor="#182F28" style="background-color: #182F28;">
        <th bgcolor="#182F28" style="background-color: #182F28; color: #FFFFFF; padding: 12px 14px; font-size: 12px; font-weight: bold; text-align: center; width: 36px; border: none;">
          <font color="#FFFFFF"><span style="color: #FFFFFF; font-weight: bold; font-size: 12px;"><b style="color: #FFFFFF;">#</b></span></font>
        </th>
        <th bgcolor="#182F28" style="background-color: #182F28; color: #FFFFFF; padding: 12px 14px; font-size: 12px; font-weight: bold; text-align: left; border: none;">
          <font color="#FFFFFF"><span style="color: #FFFFFF; font-weight: bold; font-size: 12px;"><b style="color: #FFFFFF;">Art&iacute;culo Solicitado</b></span></font>
        </th>
        <th bgcolor="#182F28" style="background-color: #182F28; color: #FFFFFF; padding: 12px 14px; font-size: 12px; font-weight: bold; text-align: center; width: 75px; border: none;">
          <font color="#FFFFFF"><span style="color: #FFFFFF; font-weight: bold; font-size: 12px;"><b style="color: #FFFFFF;">Cantidad</b></span></font>
        </th>
        <th bgcolor="#182F28" style="background-color: #182F28; color: #FFFFFF; padding: 12px 14px; font-size: 12px; font-weight: bold; text-align: left; border: none;">
          <font color="#FFFFFF"><span style="color: #FFFFFF; font-weight: bold; font-size: 12px;"><b style="color: #FFFFFF;">Detalle / Especificaciones</b></span></font>
        </th>
        <th bgcolor="#182F28" style="background-color: #182F28; color: #FFFFFF; padding: 12px 14px; font-size: 12px; font-weight: bold; text-align: center; width: 95px; border: none;">
          <font color="#FFFFFF"><span style="color: #FFFFFF; font-weight: bold; font-size: 12px;"><b style="color: #FFFFFF;">Estado</b></span></font>
        </th>
      </tr>
    </thead>
    <tbody>
      ${articulos.map((art, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#FAF9F6'}; border-bottom: 1px solid #EAE6DD;">
          <td style="padding: 11px 12px; font-size: 12px; font-weight: 700; color: #182F28; text-align: center;">${idx + 1}</td>
          <td style="padding: 11px 12px; text-align: left;">
            <strong style="font-size: 12.5px; color: #182F28; display: block;">${art.nombreElemento}</strong>
            <span style="font-size: 10px; color: #7A745F; display: block; margin-top: 2px;">${art.categoria}</span>
          </td>
          <td style="padding: 11px 12px; font-size: 13px; font-weight: 700; color: #182F28; text-align: center;">
            ${art.cantidad}
          </td>
          <td style="padding: 11px 12px; font-size: 11px; color: #5C6058; text-align: left; line-height: 1.4;">
            <div>${art.notas || art.especificaciones || 'Estándar institucional'}</div>
            ${art.fechaRequerida ? `<div style="font-size: 10px; font-weight: 700; color: #9A5B12; margin-top: 3px;">Requerido para: ${art.fechaRequerida}</div>` : ''}
          </td>
          <td style="padding: 11px 12px; text-align: center;">
            <span style="display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 10.5px; font-weight: 700; background-color: #EBF3FE; color: #1D64D8; border: 1px solid #C6DCFC;">
              ${art.estadoElemento}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- Pie institucional -->
  <div style="margin-top: 18px; padding-top: 12px; border-top: 1px solid #EAE6DD; font-size: 10px; color: #7A745F; text-align: center;">
    Documento oficial de requisici&oacute;n generado por <strong>Samanya OS</strong> &bull; Sistema de Gesti&oacute;n Residencial para el Cuidado del Adulto Mayor
  </div>
</div>
    `.trim();
  };

  // Copiar formato con diseño enriquecido (HTML) al portapapeles
  const handleCopiarHTML = async (silencioso = false) => {
    const html = generarHTMLCorreo();
    const plain = generarTextoWhatsApp().replace(/\*/g, '');
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([plain], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      setCopiadoHTML(true);
      setTimeout(() => setCopiadoHTML(false), 3000);
      if (!silencioso) {
        mostrarToast('¡Diseño gráfico con letra blanca copiado al portapapeles! Pégalo con Ctrl+V.');
      }
      return true;
    } catch {
      await navigator.clipboard.writeText(plain);
      setCopiadoHTML(true);
      setTimeout(() => setCopiadoHTML(false), 3000);
      if (!silencioso) {
        mostrarToast('¡Texto copiado al portapapeles!');
      }
      return false;
    }
  };

  // Copiar texto plano rápido
  const handleCopiarTexto = () => {
    navigator.clipboard.writeText(generarTextoWhatsApp());
    setCopiadoTexto(true);
    setTimeout(() => setCopiadoTexto(false), 2500);
    mostrarToast('¡Texto copiado al portapapeles!');
  };

  // Enviar a WhatsApp
  const handleEnviarWhatsApp = () => {
    const texto = encodeURIComponent(generarTextoWhatsApp());
    const telLimpio = telefonoDestino.replace(/\D/g, '');
    let url = '';
    if (telLimpio) {
      const codigoPais = telLimpio.length === 10 ? `57${telLimpio}` : telLimpio;
      url = `https://api.whatsapp.com/send?phone=${codigoPais}&text=${texto}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${texto}`;
    }
    window.open(url, '_blank');
  };

  // 1. Descargar / Abrir archivo .EML (Abre Outlook con el diseño gráfico completo listo para enviar)
  const handleDescargarEML = () => {
    const html = generarHTMLCorreo();
    const asunto = `Requisición de Dotación - ${residente.nombreCompleto} (${residente.codigoExpediente}) - ${activeSede.nombre}`;
    const emlContent = [
      `From: Samanya OS <notificaciones@samanya.com>`,
      `To: ${correoDestino || ''}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(asunto)))}?=`,
      `Date: ${new Date().toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 8bit`,
      ``,
      `<!DOCTYPE html>`,
      `<html>`,
      `<head>`,
      `<meta charset="utf-8">`,
      `<title>${asunto}</title>`,
      `</head>`,
      `<body style="margin: 0; padding: 20px; background-color: #F7F6F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">`,
      html,
      `</body>`,
      `</html>`
    ].join('\r\n');

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Requisicion_Dotacion_${residente.codigoExpediente}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast('¡Archivo .eml generado! Ábrelo para enviar desde Outlook con la plantilla gráfica.');
  };

  // 2. Abrir en Gmail Web
  const handleAbrirGmail = async () => {
    await handleCopiarHTML(true);
    const asunto = encodeURIComponent(
      `Requisición de Dotación - ${residente.nombreCompleto} (${residente.codigoExpediente}) - ${activeSede.nombre}`
    );
    const dest = correoDestino ? encodeURIComponent(correoDestino) : '';
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${dest}&su=${asunto}`;
    window.open(url, '_blank');
    mostrarToast('Gmail abierto. ¡Solo pulsa Ctrl+V para pegar la tabla con el diseño de pantalla!');
  };

  // 3. Abrir en Outlook Web
  const handleAbrirOutlookWeb = async () => {
    await handleCopiarHTML(true);
    const asunto = encodeURIComponent(
      `Requisición de Dotación - ${residente.nombreCompleto} (${residente.codigoExpediente}) - ${activeSede.nombre}`
    );
    const dest = correoDestino ? encodeURIComponent(correoDestino) : '';
    const url = `https://outlook.office.com/mail/deeplink/compose?to=${dest}&subject=${asunto}`;
    window.open(url, '_blank');
    mostrarToast('Outlook Web abierto. ¡Pulsa Ctrl+V para pegar la requisición con diseño!');
  };

  // 4. Abrir Cliente Predeterminado (Mailto)
  const handleMailto = async () => {
    await handleCopiarHTML(true);
    const asunto = encodeURIComponent(
      `Requisición de Dotación - ${residente.nombreCompleto} (${residente.codigoExpediente}) - ${activeSede.nombre}`
    );
    const cuerpo = encodeURIComponent(
      `[SAMANYA OS - REQUISICIÓN DE DOTACIÓN]\n` +
      `Se ha copiado al portapapeles la solicitud con el diseño gráfico completo y texto en blanco.\n` +
      `Presione Ctrl+V (Pegar) en este correo para insertar la requisición oficial con la tabla y colores.\n\n` +
      generarTextoWhatsApp().replace(/\*/g, '')
    );
    const dest = correoDestino ? encodeURIComponent(correoDestino) : '';
    window.location.href = `mailto:${dest}?subject=${asunto}&body=${cuerpo}`;
  };

  // Imprimir documento formal optimizado para PDF
  const handleImprimirPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilite las ventanas emergentes (pop-ups) para generar el PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Solicitud_Dotacion_${residente.codigoExpediente}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 18mm 15mm 20mm 15mm;
          }
          * {
            box-sizing: border-box;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #26241F;
          }
          body {
            margin: 0;
            padding: 0;
            font-size: 11pt;
            background: #FFF;
          }
          .header-table {
            width: 100%;
            border-bottom: 2px solid #182F28;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .title-area h1 {
            margin: 0;
            font-size: 16pt;
            color: #182F28;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .title-area p {
            margin: 3px 0 0 0;
            font-size: 9pt;
            color: #7A745F;
            text-transform: uppercase;
            font-weight: 600;
          }
          .radicado-badge {
            text-align: right;
            font-size: 9pt;
          }
          .radicado-badge .code {
            font-family: monospace;
            background: #F7F6F2;
            padding: 4px 8px;
            border: 1px solid #DEDBD1;
            border-radius: 4px;
            font-weight: bold;
            color: #182F28;
            display: inline-block;
          }
          .info-grid {
            width: 100%;
            border: 1px solid #DEDBD1;
            border-collapse: collapse;
            margin-bottom: 16px;
            background: #FAF9F6;
          }
          .info-grid td {
            padding: 6px 10px;
            border: 1px solid #DEDBD1;
            font-size: 9.5pt;
          }
          .info-grid td.label {
            font-weight: bold;
            color: #5C6058;
            width: 25%;
            background: #F2EFE9;
          }
          .info-grid td.value {
            font-weight: 600;
            color: #182F28;
          }
          .mensaje-calido-pdf {
            background-color: #FAF9F6;
            border: 1px solid #DEDBD1;
            border-left: 4px solid #182F28;
            padding: 10px 14px;
            margin-bottom: 16px;
            font-size: 9.5pt;
            line-height: 1.45;
            border-radius: 4px;
          }
          .mensaje-calido-pdf p {
            margin: 0 0 5px 0;
          }
          .mensaje-calido-pdf p:last-child {
            margin-bottom: 0;
          }
          h2.section-title {
            font-size: 11pt;
            color: #182F28;
            margin: 16px 0 8px 0;
            border-bottom: 1px solid #DEDBD1;
            padding-bottom: 4px;
          }
          table.items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 24px;
          }
          table.items-table th {
            background-color: #182F28 !important;
            color: #FFFFFF !important;
            text-align: left;
            padding: 8px 10px;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          table.items-table th font {
            color: #FFFFFF !important;
          }
          table.items-table td {
            padding: 9px 10px;
            border-bottom: 1px solid #EAE6DD;
            font-size: 9.5pt;
          }
          table.items-table tr:nth-child(even) {
            background-color: #FAF9F6;
          }
          .badge-prioridad {
            font-size: 8pt;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          }
          .badge-alta {
            background-color: #FEF3F2;
            color: #B42318;
            border: 1px solid #FECDCA;
          }
          .badge-normal {
            background-color: #F8F9FC;
            color: #363F72;
            border: 1px solid #D5D9EB;
          }
          .signatures-table {
            width: 100%;
            margin-top: 40px;
            border-collapse: collapse;
          }
          .signatures-table td {
            width: 33.33%;
            padding: 0 15px;
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #182F28;
            margin-top: 45px;
            padding-top: 6px;
            font-size: 8.5pt;
            color: #5C6058;
          }
          .signature-line strong {
            display: block;
            color: #182F28;
            font-size: 9pt;
          }
          .footer-note {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px dashed #DEDBD1;
            font-size: 8pt;
            color: #7A745F;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td class="title-area">
              <h1>SAMANYA OS • REQUISICIÓN DE DOTACIÓN</h1>
              <p>${activeSede.nombre} • Habitación ${residente.habitacion} (Cama ${residente.cama})</p>
            </td>
            <td class="radicado-badge">
              <span class="code">${radicado}</span>
              <div style="font-size: 8.5pt; color: #7A745F; margin-top: 4px;">Fecha: ${hoy}</div>
            </td>
          </tr>
        </table>

        <table class="info-grid">
          <tr>
            <td class="label">Residente:</td>
            <td class="value">${residente.nombreCompleto}</td>
            <td class="label">Expediente:</td>
            <td class="value">${residente.codigoExpediente}</td>
          </tr>
          <tr>
            <td class="label">Documento:</td>
            <td class="value">${residente.tipoIdentificacion} ${residente.identificacion}</td>
            <td class="label">Fecha Nacimiento / Edad:</td>
            <td class="value">${residente.fechaNacimiento || 'N/R'} (${residente.edad} años)</td>
          </tr>
          <tr>
            <td class="label">Nivel de Movilidad:</td>
            <td class="value">${residente.nivelMovilidad || 'No especificado'}</td>
            <td class="label">Dieta / Alertas:</td>
            <td class="value">${residente.tipoDieta || 'General'}</td>
          </tr>
        </table>

        <div class="mensaje-calido-pdf">
          <p><strong>Estimada Familia y Acudientes:</strong></p>
          <p>Reciban un cordial y afectuoso saludo de parte del equipo asistencial de <strong>${activeSede.nombre}</strong>. Con el compromiso permanente de brindarle a <strong>${residente.nombreCompleto}</strong> la mayor comodidad y bienestar integral en su estancia, nos permitimos solicitarles amablemente la reposición o suministro de la dotación requerida a continuación.</p>
          <p style="font-style: italic; color: #7A745F; font-size: 8.5pt;">Agradecemos de antemano su valiosa colaboración, apoyo constante y dedicación.</p>
        </div>

        <h2 class="section-title">Artículos y Elementos Solicitados (${articulos.length} ítems • ${totalUnidades} unidades)</h2>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 30px;"><font color="#FFFFFF">#</font></th>
              <th><font color="#FFFFFF">Artículo Solicitado</font></th>
              <th style="width: 65px; text-align: center;"><font color="#FFFFFF">Cantidad</font></th>
              <th style="width: 90px; text-align: center;"><font color="#FFFFFF">Prioridad</font></th>
              <th><font color="#FFFFFF">Especificaciones / Motivo</font></th>
              <th style="width: 100px; text-align: center;"><font color="#FFFFFF">Requerido Para</font></th>
              <th style="width: 80px; text-align: center;"><font color="#FFFFFF">Estado</font></th>
            </tr>
          </thead>
          <tbody>
            ${articulos
              .map(
                (art, index) => `
              <tr>
                <td style="font-weight: bold; text-align: center;">${index + 1}</td>
                <td>
                  <strong>${art.nombreElemento}</strong><br/>
                  <span style="font-size: 8pt; color: #7A745F;">${art.categoria}</span>
                </td>
                <td style="text-align: center; font-weight: bold; font-size: 10pt;">${art.cantidad}</td>
                <td style="text-align: center;">
                  <span class="badge-prioridad ${art.prioridad === 'Alta' ? 'badge-alta' : 'badge-normal'}">
                    ${art.prioridad || 'Normal'}
                  </span>
                </td>
                <td>
                  ${art.notas || art.especificaciones || 'Reposición periódica'}
                </td>
                <td style="text-align: center; font-size: 8.5pt;">
                  ${art.fechaRequerida || 'Inmediato'}
                </td>
                <td style="text-align: center; font-size: 8.5pt; font-weight: bold; color: #027A48;">
                  ${art.estadoElemento}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <table class="signatures-table">
          <tr>
            <td>
              <div class="signature-line">
                <strong>Solicitado Por</strong>
                Administración / Enfermería
              </div>
            </td>
            <td>
              <div class="signature-line">
                <strong>Despachado / Aprobado Por</strong>
                Almacén y Suministros
              </div>
            </td>
            <td>
              <div class="signature-line">
                <strong>Recibido a Conformidad</strong>
                Residente / Acudiente
              </div>
            </td>
          </tr>
        </table>

        <div class="footer-note">
          Documento oficial expedido a través de <strong>Samanya OS</strong>. Este soporte garantiza la trazabilidad del inventario y la entrega oportuna de la dotación requerida.
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-[#182F28] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCB87F]/20 border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F]">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Imprimir y Compartir Solicitud de Dotación
                </h3>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#274A3F] text-[#DCB87F] border border-[#DCB87F]/30">
                  {articulos.length} ítem(s)
                </span>
              </div>
              <p className="text-xs text-[#DCB87F]/90 mt-0.5">
                Genera el formato formal de requisición o comparte la información por WhatsApp y correo electrónico
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificación Toast Flotante */}
        {toastMensaje && (
          <div className="bg-[#182F28] text-[#DCB87F] px-4 py-2 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 border-b border-[#DCB87F]/30">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMensaje}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMensaje(null)}
              className="text-white/60 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Cuerpo del Modal */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {/* Barra de Acciones Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Imprimir / Guardar como PDF */}
            <button
              type="button"
              onClick={handleImprimirPDF}
              className="flex items-center justify-center gap-2.5 p-3.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#DCB87F]" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            {/* 2. Enviar por WhatsApp */}
            <button
              type="button"
              onClick={handleEnviarWhatsApp}
              className="flex items-center justify-center gap-2.5 p-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>

            {/* 3. Enviar por Correo con Diseño Visual */}
            <button
              type="button"
              onClick={() => setMostrarModalCorreo(true)}
              className="flex items-center justify-center gap-2.5 p-3.5 bg-[#068591] hover:bg-[#056f7a] text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer"
              title="Ver opciones para enviar por correo con el diseño de pantalla"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por Correo</span>
            </button>
          </div>

          {/* Destinatarios Rápidos (Familiar / Acudiente) */}
          <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#DEDBD1] space-y-3">
            <span className="text-xs font-bold text-[#182F28] uppercase font-mono block">
              Destinatarios de Contacto para Envío Directo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                  Número de Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7A745F]" />
                  <input
                    type="text"
                    value={telefonoDestino}
                    onChange={(e) => setTelefonoDestino(e.target.value)}
                    placeholder="Ej. 3101234567"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#7A745F]" />
                  <input
                    type="email"
                    value={correoDestino}
                    onChange={(e) => setCorreoDestino(e.target.value)}
                    placeholder="familiar@ejemplo.com"
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa del Documento Formal (Idéntico a la Requisición) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#182F28] uppercase font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B3803F]" />
                <span>Vista Previa del Documento Requisición</span>
              </span>

              <div className="flex items-center gap-3">
                {/* Botón Copiar Diseño para Correo (HTML) */}
                <button
                  type="button"
                  onClick={() => handleCopiarHTML(false)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-[#068591] hover:text-[#056f7a] cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#068591]/30 hover:border-[#068591] shadow-2xs transition-all"
                  title="Copia la tabla y estilos idénticos a la pantalla para pegarlos con Ctrl+V en Gmail u Outlook"
                >
                  {copiadoHTML ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Diseño Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#068591]" />
                      <span>Copiar Formato Correo (Diseño Pantalla)</span>
                    </>
                  )}
                </button>

                {/* Botón Copiar Texto */}
                <button
                  type="button"
                  onClick={handleCopiarTexto}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#9A5B12] hover:text-[#7d480a] cursor-pointer"
                >
                  {copiadoTexto ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">¡Texto Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar texto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Hoja membretada en miniatura (Exacta a la pantalla) */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-[#DEDBD1] shadow-xs space-y-4">
              {/* Membrete */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#182F28] gap-2">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#182F28]">
                    SAMANYA OS • REQUISICIÓN DE DOTACIÓN
                  </h4>
                  <p className="text-[11px] text-[#7A745F] font-semibold uppercase">
                    {activeSede.nombre} • Habitación {residente.habitacion} (Cama {residente.cama})
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F7F6F2] border border-[#DEDBD1] text-[#182F28]">
                    {radicado}
                  </span>
                  <div className="text-[10px] text-[#7A745F] mt-0.5">Fecha: {hoy}</div>
                </div>
              </div>

              {/* Ficha Residente */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3 bg-[#FAF9F6] rounded-xl border border-[#DEDBD1]">
                <div>
                  <span className="text-[10px] text-[#7A745F] font-mono uppercase block">Residente</span>
                  <strong className="text-[#182F28]">{residente.nombreCompleto}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A745F] font-mono uppercase block">Expediente</span>
                  <strong className="text-[#182F28]">{residente.codigoExpediente}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A745F] font-mono uppercase block">Identificación</span>
                  <strong className="text-[#182F28]">{residente.tipoIdentificacion} {residente.identificacion}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A745F] font-mono uppercase block">Movilidad</span>
                  <strong className="text-[#182F28]">{residente.nivelMovilidad || 'Dependiente Total'}</strong>
                </div>
              </div>

              {/* Mensaje Amable y Cálido de Solicitud Formal */}
              <div className="py-4.5 px-6 pl-9 bg-[#FAF9F6] border border-[#DEDBD1] border-l-6 border-l-[#B3803F] rounded-2xl text-xs space-y-2 text-[#26241F] shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#182F28]">
                  <Heart className="w-3.5 h-3.5 text-[#B3803F]" />
                  <span>Estimada Familia y Acudientes:</span>
                </div>
                <p className="text-[#4A463B] leading-relaxed">
                  Reciban un cordial y afectuoso saludo de parte del equipo asistencial de <strong>{activeSede.nombre}</strong>. Esperamos que se encuentren muy bien.
                </p>
                <p className="text-[#4A463B] leading-relaxed">
                  Con el compromiso permanente de brindar a <strong>{residente.nombreCompleto}</strong> la mayor comodidad, dignidad y bienestar en su día a día, nos permitimos solicitarles amablemente su valiosa colaboración con el suministro o reposición de la dotación personal detallada a continuación:
                </p>
                <p className="text-[11px] text-[#7A745F] italic pt-0.5">
                  Agradecemos de corazón su constante apoyo, confianza y compromiso de siempre con su cuidado integral.
                </p>
              </div>

              {/* Tabla de Artículos Solicitados con Textos Blancos Forzados */}
              <div className="border border-[#DEDBD1] rounded-xl overflow-hidden">
                <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#182F28', color: '#FFFFFF' }}>
                      <th style={{ backgroundColor: '#182F28', color: '#FFFFFF', padding: '11px 12px' }} className="text-left font-bold">
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>#</span>
                      </th>
                      <th style={{ backgroundColor: '#182F28', color: '#FFFFFF', padding: '11px 12px' }} className="text-left font-bold">
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Artículo Solicitado</span>
                      </th>
                      <th style={{ backgroundColor: '#182F28', color: '#FFFFFF', padding: '11px 12px' }} className="text-center font-bold">
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Cantidad</span>
                      </th>
                      <th style={{ backgroundColor: '#182F28', color: '#FFFFFF', padding: '11px 12px' }} className="text-left font-bold">
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Detalle / Especificaciones</span>
                      </th>
                      <th style={{ backgroundColor: '#182F28', color: '#FFFFFF', padding: '11px 12px' }} className="text-center font-bold">
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Estado</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE6DD]">
                    {articulos.map((art, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F6]'}>
                        <td className="py-2.5 px-3 font-bold text-[#182F28]">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <strong className="text-[#182F28] block">{art.nombreElemento}</strong>
                          <span className="text-[10px] text-[#7A745F]">{art.categoria}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-sm text-[#182F28]">
                          {art.cantidad}
                        </td>
                        <td className="py-2.5 px-3 text-[#5C6058]">
                          {art.notas || art.especificaciones || 'Motivo: Reposición por desgaste natural'}
                          {art.fechaRequerida && (
                            <div className="text-[10px] text-[#9A5B12] font-semibold mt-0.5">
                              Requerido para: {art.fechaRequerida}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF3FE] text-[#1D64D8] border border-[#C6DCFC]">
                            {art.estadoElemento}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[#5C6058] font-bold hover:bg-[#EAE6DD] rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleImprimirPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#DCB87F]" />
            <span>Imprimir / Descargar Requisición PDF</span>
          </button>
        </div>
      </div>

      {/* Modal / Diálogo Dedicado para Envío por Correo Electrónico con Diseño */}
      {mostrarModalCorreo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#DEDBD1] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-[#182F28] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DCB87F]/20 border border-[#DCB87F]/40 flex items-center justify-center text-[#DCB87F]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-white">
                    Envío de Requisición por Correo
                  </h4>
                  <p className="text-xs text-[#DCB87F]">
                    Formato con diseño idéntico al de pantalla (encabezado blanco nítido, tabla y colores)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalCorreo(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#CFC9B8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Notificación explicativa */}
              <div className="p-3.5 bg-[#EBF3FE] border border-[#C6DCFC] rounded-2xl flex items-start gap-2.5 text-[#1D64D8]">
                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-[12px]">
                    Diseño Institucional con Letra Blanca
                  </p>
                  <p className="text-[11px] text-[#26241F]/80 leading-relaxed">
                    Al utilizar cualquiera de las opciones siguientes, el correo se genera con el mensaje formal y amable de apertura, la ficha del residente y la tabla con títulos en blanco brillante sobre fondo verde corporativo.
                  </p>
                </div>
              </div>

              {/* Destinatario y Asunto */}
              <div className="p-3.5 bg-[#FAF9F6] border border-[#DEDBD1] rounded-2xl space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                    Correo Destinatario (Acudiente / Proveedor / Personal)
                  </label>
                  <input
                    type="email"
                    value={correoDestino}
                    onChange={(e) => setCorreoDestino(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3 py-1.5 bg-white border border-[#DEDBD1] rounded-xl text-xs text-[#182F28] font-semibold focus:outline-none focus:border-[#182F28]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6058] mb-1">
                    Asunto del Mensaje
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`Requisición de Dotación - ${residente.nombreCompleto} (${residente.codigoExpediente}) - ${activeSede.nombre}`}
                    className="w-full px-3 py-1.5 bg-[#F7F6F2] border border-[#DEDBD1] rounded-xl text-xs text-[#5C6058] font-medium"
                  />
                </div>
              </div>

              {/* Métodos de Envío */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#182F28] uppercase font-mono block">
                  Elige cómo deseas despachar el correo:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Opción 1: Abrir en Outlook con archivo .eml */}
                  <button
                    type="button"
                    onClick={handleDescargarEML}
                    className="p-3 bg-white hover:bg-[#FAF9F6] border-2 border-[#182F28] rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#182F28] text-xs">
                        <Laptop className="w-4 h-4 text-[#B3803F]" />
                        <span>Abrir en Outlook / Mail</span>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#182F28] text-[#DCB87F] rounded">
                        Recomendado
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A745F]">
                      Abre directamente tu aplicación Outlook con el texto amable y la tabla con encabezados blancos ya insertados.
                    </p>
                  </button>

                  {/* Opción 2: Copiar Diseño para Pegar (Ctrl+V) */}
                  <button
                    type="button"
                    onClick={() => handleCopiarHTML(false)}
                    className="p-3 bg-white hover:bg-[#FAF9F6] border border-[#DEDBD1] hover:border-[#DCB87F] rounded-2xl text-left transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#182F28] text-xs mb-1">
                      <Sparkles className="w-4 h-4 text-[#DCB87F]" />
                      <span>Copiar Diseño HTML (Ctrl+V)</span>
                    </div>
                    <p className="text-[11px] text-[#7A745F]">
                      Copia la tabla visual con títulos en blanco y mensaje cálido para pegarla en cualquier correo con Ctrl+V.
                    </p>
                  </button>

                  {/* Opción 3: Abrir en Gmail Web */}
                  <button
                    type="button"
                    onClick={handleAbrirGmail}
                    className="p-3 bg-white hover:bg-[#FAF9F6] border border-[#DEDBD1] hover:border-[#182F28] rounded-2xl text-left transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#182F28] text-xs mb-1">
                      <ExternalLink className="w-4 h-4 text-red-600" />
                      <span>Redactar en Gmail Web</span>
                    </div>
                    <p className="text-[11px] text-[#7A745F]">
                      Abre Gmail con destinatario y asunto, y copia el diseño para pegarlo con Ctrl+V en el mensaje.
                    </p>
                  </button>

                  {/* Opción 4: Abrir en Outlook Web */}
                  <button
                    type="button"
                    onClick={handleAbrirOutlookWeb}
                    className="p-3 bg-white hover:bg-[#FAF9F6] border border-[#DEDBD1] hover:border-[#182F28] rounded-2xl text-left transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[#182F28] text-xs mb-1">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span>Redactar en Outlook Web</span>
                    </div>
                    <p className="text-[11px] text-[#7A745F]">
                      Abre Office 365 / Outlook Web y copia el diseño gráfico para pegarlo con Ctrl+V.
                    </p>
                  </button>
                </div>
              </div>

              {/* Botón Fallback Mailto */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleMailto}
                  className="text-[11px] text-[#7A745F] hover:text-[#182F28] underline cursor-pointer"
                >
                  O abrir cliente de correo predeterminado del sistema (mailto)
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-[#DEDBD1] bg-[#F7F6F2] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalCorreo(false)}
                className="px-4 py-2 bg-[#182F28] hover:bg-[#274A3F] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Listo / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
