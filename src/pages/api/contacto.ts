import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  
  // Mapeamos los campos de tu formulario
  const nombre = data.get('nombre');
  const correo = data.get('correo');
  const telefono = data.get('telefono');
  const escuela = data.get('escuela_procedencia');
  const nivel = data.get('nivel_interes');

  // TRADUCCIÓN DE TU CONFIG DE CI3 A NODEMAILER
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false porque usas puerto 587 con TLS
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // Esto ayuda a evitar problemas de certificados en algunos hosts
    }
  });

  const body = `
    <h1>Detalles del Interesado (Landing Preescolar)</h1>
    <p><strong>Nombre Completo:</strong> ${nombre}</p>
    <p><strong>Correo:</strong> ${correo}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Escuela de Procedencia:</strong> ${escuela}</p>
    <p><strong>Nivel de Interés:</strong> ${nivel}</p>
  `;

  try {
    await transporter.sendMail({
      from: '"Colegio Ingles Playa contacto" <webmaster@educacionmeguz.com>',
      to: "antonio_caamal@colegioinglesplaya.com", // A quien le llega
      cc: ["programadorweb@colegioinglesplaya.com"], // Tus CC de CI3
      subject: 'Contacto Colegio Ingles Playa - Landing Preescolar',
      html: body
    });

    return new Response(JSON.stringify({ message: "¡Correo enviado con éxito!" }), { status: 200 });
  } catch (error) {
    console.error("Error de Nodemailer:", error);
    return new Response(JSON.stringify({ message: "Error al enviar correo" }), { status: 500 });
  }
};

export const prerender = false;