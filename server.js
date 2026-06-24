const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const fetch = require('node-fetch');

fastify.register(cors, { origin: '*' });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

fastify.post('/api/create-stars-invoice', async (request, reply) => {
  const { flowType, selectedOption, language } = request.body;

  let title = language === 'en' ? "🕯️ Candle of Hope" : "🕯️ Veladora de la Esperanza";
  let description = language === 'en' ? "Sacred offering." : "Ofrenda sagrada.";
  let starsAmount = 10;

  if (selectedOption === 'vela_dorada') {
    title = language === 'en' ? "🕯️ Thanksgiving Candle" : "🕯️ Veladora de Agradecimiento";
    starsAmount = 15;
  } else if (selectedOption === 'novena') {
    title = language === 'en' ? "🙏 Solemn 9-Day Novena" : "🙏 Solemne Novena de 9 Días";
    starsAmount = 50;
  } else if (flowType === 'holy_reminder') {
    title = language === 'en' ? "🔔 Holy Reminders" : "🔔 Recordatorios Sagrados";
    starsAmount = 25;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        payload: JSON.stringify({ flowType, selectedOption }),
        provider_token: "",
        currency: "XTR",
        prices: [{ label: title, amount: starsAmount }]
      })
    });

    const data = await response.json();
    if (data.ok) return { success: true, invoiceLink: data.result };
    return reply.status(400).send({ success: false, error: data.description });
  } catch (err) {
    return reply.status(500).send({ success: false, error: err.message });
  }
});

const start = async () => {
  try { await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }); }
  catch (err) { process.exit(1); }
};

start();
