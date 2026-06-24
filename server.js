const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const fetch = require('node-fetch');

// Permitir que tu Mini App de Netlify se comunique con este servidor sin bloqueos
fastify.register(cors, { origin: '*' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Ruta principal para generar las facturas de Stars de tus 3 servicios
fastify.post('/api/create-stars-invoice', async (request, reply) => {
  const { flowType, selectedOption, language } = request.body;

  let title = "";
  let description = "";
  let starsAmount = 10;

  if (flowType === 'personal_candle') {
    if (selectedOption === 'vela_verde') {
      title = language === 'en' ? "🕯️ Candle of Hope" : "🕯️ Veladora de la Esperanza";
      description = language === 'en' ? "Your light will shine on the altar for 24h with an emerald border." : "Tu luz brillará en el altar por 24h con borde esmeralda.";
      starsAmount = 10;
    } else if (selectedOption === 'vela_dorada') {
      title = language === 'en' ? "🕯️ Thanksgiving Candle" : "🕯️ Veladora de Agradecimiento";
      description = language === 'en' ? "Special testimonial with a premium gold frame on the wall." : "Testimonio especial con marco de oro premium en el muro.";
      starsAmount = 15;
    } else if (selectedOption === 'novena') {
      title = language === 'en' ? "🙏 Solemn 9-Day Novena" : "🙏 Solemne Novena de 9 Días";
      description = language === 'en' ? "Long-duration candle and automated daily prayers." : "Vela de larga duración y oraciones diarias automatizadas.";
      starsAmount = 50;
    }
  } else if (flowType === 'gift_candle') {
    title = language === 'en' ? "🎁 Gift a Candle Blessing" : "🎁 Regalar Veladora de Bendición";
    description = language === 'en' ? "Send faith to a loved one. You will get a link to share on WhatsApp." : "Envía fe a un ser querido. Recibirás un link para compartir en WhatsApp.";
    starsAmount = 10;
  } else if (flowType === 'holy_reminder') {
    title = language === 'en' ? "🔔 Holy Reminders (Monthly)" : "🔔 Recordatorios Sagrados (Mensual)";
    description = language === 'en' ? "Automated daily accompaniment in your private chat." : "Acompañamiento diario automatizado en tu chat privado.";
    starsAmount = 25;
  }

  // API oficial de Telegram Stars corregida milimétricamente para 2026
  try {
    const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description,
        payload: JSON.stringify({ flowType, selectedOption }),
        provider_token: "", // Obligatorio vacío para Stars
        currency: "XTR",   // Código oficial para Estrellas
        prices: [{ label: title, amount: starsAmount }]
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, invoiceLink: data.result };
    } else {
      return reply.status(400).send({ success: false, error: data.description });
    }
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message });
  }
});

// Arrancar el servidor
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
