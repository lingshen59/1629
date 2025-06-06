
const fetch = require("node-fetch");

let blockedIPs = new Set();
const log = [];

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const ip = event.headers["x-forwarded-for"] || "desconocido";

  if (blockedIPs.has(ip)) {
    return { statusCode: 403, body: "IP bloqueada" };
  }

  try {
    const data = JSON.parse(event.body);
    const payload = {
      content: `**Nueva postulación recibida:**
` +
        `Usuario: ${data.usuario}
ID: ${data.id || "N/A"}
País: ${data.pais}
Edad: ${data.edad}
` +
        `Veces admin: ${data.veces_admin}
Aportaría: ${data.aportaria}
` +
        `Hacks: ${data.hacks || "Ninguno"}
Experiencia: ${data.experiencia}
` +
        `Horas disponibles: ${data.horas}
Zona horaria: ${data.zona || "N/A"}
` +
        `IP: ${ip}`
    };

    await fetch("https://discord.com/api/webhooks/1380390969371004969/vV1CojqZppGytUNMjkybAMYI4lwBPV13aUUYk7r-bgIVFmvprs_fjfH1f2u-_6cJkdQ4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    log.push({ ip, timestamp: Date.now() });
    return { statusCode: 200, body: JSON.stringify({ message: "Formulario enviado correctamente" }) };
  } catch (err) {
    return { statusCode: 500, body: "Error al procesar la solicitud" };
  }
};
