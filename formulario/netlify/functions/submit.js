const https = require("https");
const fs = require("fs");
const path = require("path");

const BLOCKED_IPS_PATH = path.join(__dirname, "data", "blocked_ips.json");
const WEBHOOK_URL = "https://discord.com/api/webhooks/1380390969371004969/vV1CojqZppGytUNMjkybAMYI4lwBPV13aUUYk7r-bgIVFmvprs_fjfH1f2u-_6cJkdQ4";

function loadBlockedIPs() {
  try {
    const data = fs.readFileSync(BLOCKED_IPS_PATH);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveBlockedIPs(ips) {
  fs.writeFileSync(BLOCKED_IPS_PATH, JSON.stringify(ips, null, 2));
}

// Puedes personalizar aquí los patrones de ataque
function esAtaque(data) {
  const maxCampos = 10;
  const textoLargo = Object.values(data).some((val) => val && val.length > 2000);
  return textoLargo || Object.keys(data).length > maxCampos;
}

exports.handler = async function (event, context) {
  const clientIP =
    event.headers["x-forwarded-for"]?.split(",")[0] || event.headers["client-ip"] || "unknown";
  const blockedIPs = loadBlockedIPs();

  if (blockedIPs.includes(clientIP)) {
    return {
      statusCode: 403,
      body: "Tu IP ha sido bloqueada por seguridad.",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Método no permitido",
    };
  }

  try {
    const data = JSON.parse(event.body);

    if (esAtaque(data)) {
      blockedIPs.push(clientIP);
      saveBlockedIPs([...new Set(blockedIPs)]);
      return {
        statusCode: 403,
        body: "Actividad maliciosa detectada. Tu IP ha sido bloqueada.",
      };
    }

    const payload = {
      content: `📩 **Nueva Postulación**`,
      embeds: [
        {
          color: 0x00ffd5,
          fields: [
            { name: "Usuario Discord", value: data.usuario || "No provisto", inline: true },
            { name: "ID Discord", value: data.id || "Opcional", inline: true },
            { name: "País", value: data.pais || "No provisto", inline: true },
            { name: "Edad", value: data.edad || "No provisto", inline: true },
            { name: "¿Cuántas veces admin?", value: data.veces_admin || "No provisto", inline: true },
            { name: "Aportación", value: data.aportacion || "No provisto", inline: false },
            { name: "Hacks", value: data.hacks || "Opcional", inline: false },
            { name: "Experiencia", value: data.experiencia || "No provisto", inline: true },
            { name: "Horas disponibles", value: data.horas || "No provisto", inline: true },
            { name: "IP", value: clientIP, inline: true },
          ],
          footer: { text: "Bot educativo – Postulación" },
          timestamp: new Date(),
        },
      ],
    };

    const discordReq = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!discordReq.ok) {
      return {
        statusCode: 500,
        body: "Error al enviar la postulación. Inténtalo más tarde.",
      };
    }

    return {
      statusCode: 200,
      body: "Postulación enviada correctamente.",
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Error del servidor. Inténtalo de nuevo.",
    };
  }
};
