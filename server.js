const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const fetch = require('node-fetch');

// Permitir que tu Mini App de Netlify se comunique con este servidor sin bloqueos
fastify.register(cors, { origin: '*' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Ruta principal para generar las facturas de Stars de tus 3 servicios
fastify.post('/api/create-stars-invoice', async (request, reply) => {
  const { flowType, selectedOption, language } = request.body;

  // 1. Configuración dinámica de precios y textos según lo seleccionado en la app
  let title = "";
  let description = "";
  let starsAmount = 10;

  if (flowType === 'personal_candle') {
    if (selectedOption === 'vela_verde') {
      title = language === 'es' ? "🕯️ Veladora de la Esperanza" : "🕯️ Candle of Hope";
      description = language === 'es' ? "Tu luz brillará en el altar por 24h con borde esmeralda." : "Your light will shine on the altar for 24h with an emerald border.";
      starsAmount = 10;
    } else if (selectedOption === 'vela_dorada') {
      title = language === 'es' ? "🕯️ Veladora de Agradecimiento" : "🕯️ Thanksgiving Candle";
      description = language === 'es' ? "Testimonio especial con marco de oro premium en el muro." : "Special testimonial with a premium gold frame on the wall.";
      starsAmount = 15;
    } else if (selectedOption === 'novena') {
      title = language === 'es' ? "🙏 Solemne Novena de 9 Días" : "🙏 Solemn 9-Day Novena";
      description = language === 'es' ? "Vela de larga duración y oraciones diarias automatizadas." : "Long-duration candle and automated daily prayers.";
      starsAmount = 50;
    }
  } else if (flowType === 'gift_candle') {
    title = language === 'es' ? "🎁 Regalar Veladora de Bendición" : "🎁 Gift a Candle Blessing";
    description = language === 'es' ? "Envía fe a un ser querido. Recibirás un link para compartir en WhatsApp." : "Send faith to a loved one. You will get a link to share on WhatsApp.";
    starsAmount = 10;
  } else if (flowType === 'holy_reminder') {
    title = language === 'es' ? "🔔 Recordatorios Sagrados (Mensual)" : "🔔 Holy Reminders (Monthly)";
    description = language === 'es' ? "Acompañamiento diario automatizado en tu chat privado." : "Automated daily accompaniment in your private chat.";
    starsAmount = 25;
  }

  // 2. Llamada directa y obligatoria a la API oficial de Telegram
  try {
    const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description,
        payload: JSON.stringify({ flowType, selectedOption }), // Metadatos internos
        provider_token: "", // Se deja vacío obligatoriamente para Telegram Stars
        currency: "XTR",   // Código mundial para cobrar en Estrellas de Telegram
        prices: [{ label: title, amount: starsAmount }]
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, invoiceLink: data.result }; // Regresa el link real de cobro
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
