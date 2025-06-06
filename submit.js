const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método no permitido' };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.user || !data.id || !data.pais) {
      return { statusCode: 400, body: 'Faltan campos obligatorios' };
    }

    // Obtener IP real del cliente
    const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'IP desconocida';

    const embed = {
      title: 'Nueva postulación recibida',
      color: 0x00ff00,
      fields: [
        { name: 'Usuario', value: data.user, inline: true },
        { name: 'ID', value: data.id, inline: true },
        { name: 'País', value: data.pais, inline: true },
        { name: 'Edad', value: data.edad || 'No especificado', inline: true },
        { name: 'Veces admin', value: data.vecesAdmin || 'No especificado', inline: true },
        { name: 'Aportación', value: data.aportacion || 'No especificado', inline: false },
        { name: 'Hacks', value: data.hacks || 'No especificado', inline: false },
        { name: 'Experiencia', value: data.experiencia || 'No especificado', inline: true },
        { name: 'Horas disponibles', value: data.horas || 'No especificado', inline: true },
        { name: 'Zona horaria', value: data.zona || 'No especificado', inline: true },
        { name: 'IP del postulante', value: ip, inline: false }
      ],
      timestamp: new Date(),
    };

    const webhookUrl = 'https://discord.com/api/webhooks/1380390969371004969/vV1CojqZppGytUNMjkybAMYI4lwBPV13aUUYk7r-bgIVFmvprs_fjfH1f2u-_6cJkdQ4'; // Cambia esto por tu webhook real

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return { statusCode: 200, body: 'Postulación enviada con éxito' };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Error interno del servidor' };
  }
};
