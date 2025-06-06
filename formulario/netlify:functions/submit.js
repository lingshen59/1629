 const fetch = require('node-fetch');

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1380390969371004969/vV1CojqZppGytUNMjkybAMYI4lwBPV13aUUYk7r-bgIVFmvprs_fjfH1f2u-_6cJkdQ4';

// Aquí puedes tener una lista en memoria o cargar de algún lugar las IPs bloqueadas
let blockedIPs = new Set();

// Función para detectar ataques simples (puedes mejorar esta lógica)
function isAttack(data) {
  // Ejemplo básico: campos vacíos obligatorios
  if (!data.usuarioDiscord || !data.pais || !data.edad) return true;
  // Puedes añadir más reglas para ataques
  return false;
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Allow': 'POST' },
      body: 'Método no permitido',
    };
  }

  const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'desconocida';

  if (blockedIPs.has(ip)) {
    return {
      statusCode: 403,
      body: 'Acceso bloqueado',
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: 'JSON inválido',
    };
  }

  // Detectar ataques
  if (isAttack(data)) {
    blockedIPs.add(ip);
    return {
      statusCode: 403,
      body: 'Acceso bloqueado por actividad sospechosa',
    };
  }

  // Preparar mensaje para webhook Discord
  const content = `
**Nueva postulación**
Usuario Discord: ${data.usuarioDiscord}
ID Discord: ${data.idDiscord || 'No proporcionado'}
País: ${data.pais}
Edad: ${data.edad}
Veces admin: ${data.vecesAdmin}
Qué aporta: ${data.aporta}
Qué hacks tiene: ${data.hacks || 'No proporcionado'}
Experiencia: ${data.experiencia}
Horas disponibles: ${data.horas}
IP: ${ip}
`;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    return {
      statusCode: 200,
      body: 'Formulario enviado correctamente',
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Error enviando webhook',
    };
  }
};