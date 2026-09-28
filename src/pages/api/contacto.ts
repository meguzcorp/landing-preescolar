import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    // Mapeo de campos del formulario
    const nombre = data.get('nombre')?.toString().trim();
    const correo = data.get('correo')?.toString().trim();
    const telefono = data.get('telefono')?.toString().trim();
    const escuela = data.get('escuela_procedencia')?.toString().trim() || null;
    const nivel = data.get('nivel_interes')?.toString().trim() || null;

    // Campos opcionales de atribución (por si capturas UTMs en inputs ocultos)
    const utm_source = data.get('utm_source')?.toString().trim() || null;
    const utm_medium = data.get('utm_medium')?.toString().trim() || null;
    const utm_campaign = data.get('utm_campaign')?.toString().trim() || null;

    // Validación básica previa
    if (!nombre || !correo || !telefono) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nombre, correo y teléfono son campos obligatorios.'         { status: 400, headers: { 'Content-Type': 'application/json' } }

        }), 
      );
    }

    // 1. REGISTRO EN EL CRM MEGUZDOCS
    const apiUrl = import.meta.env.MEGUZDOCS_API_URL;
    const apiKey = import.meta.env.MEGUZDOCS_API_KEY;

    const payloadCrm = {
      id_campus: 1, // 1: Playa, 2: Tulum
      origen: 'landing_preescolar',
      nombre_completo: nombre,
      correo: correo,
      telefono: telefono,
      escuela_procedencia: escuela,
      nivel_interes: nivel,
      utm_source: utm_source,
      utm_medium: utm_medium,
      utm_campaign: utm_campaign
    };

    const crmResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify(payloadCrm)
    });

    const crmResult = await crmResponse.json().catch(() => null);

    if (!crmResponse.ok || !crmResult?.success) {
      console.error('Error al registrar en Meguzdocs:', crmResult);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error al registrar la información en el sistema central.' 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. ENVÍO DE CORREO DE NOTIFICACIÓN (Nodemailer)
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: import.meta.env.SMTP_USER,
          pass: import.meta.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const emailHtml = `
        <h1>Detalles del Interesado (Landing Preescolar)</h1>
        <p><strong>ID Lead CRM:</strong> ${crmResult.lead_id || 'N/A'}</p>
        <p><strong>Nombre Completo:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Escuela de Procedencia:</strong> ${escuela || 'No especificada'}</p>
        <p><strong>Nivel de Interés:</strong> ${nivel || 'No especificado'}</p>
      `;

      await transporter.sendMail({
        from: '"Colegio Inglés Playa Contacto" <webmaster@educacionmeguz.com>',
        to: 'antonio_caamal@colegioinglesplaya.com',
        cc: ['programadorweb@colegioinglesplaya.com'],
        subject: 'Nuevo Lead Landing Preescolar - Colegio Inglés Playa',
        html: emailHtml
      });
    } catch (mailError) {
      // Si el correo falla, no rompemos la respuesta al usuario, pues el lead ya está a salvo en la BD
      console.error('Error secundario de Nodemailer:', mailError);
    }

    // 3. RESPUESTA EXITOSA AL FRONTEND
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '¡Registro exitoso! En breve nos pondremos en contacto contigo.' 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error general en endpoint contacto.ts:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Ocurrió un error inesperado al procesar la solicitud.' 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};