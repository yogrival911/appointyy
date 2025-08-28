// whatsappService.js
require("dotenv").config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * Send a plain text message to a user
 */
async function sendTextMessage(to, message) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    text: { body: message },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  console.log("Text message response:", data);
  return data;
}

/**
 * Send a template message
 */
async function sendTemplateMessage(to, templateName, languageCode = "en_US",components = []) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  console.log("Template message response:", data);
  return data;
}

async function sendTimeSlotOptions(to, slots) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: "Please select a time slot:",
      },
      action: {
        buttons: slots.map((slot, index) => ({
          type: "reply",
          reply: {
            id: `slot_${index + 1}`,  // your internal ID
            title: slot,              // what user sees
          },
        })),
      },
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();
  console.log("Interactive message response:", data);
  return data;
}


module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  sendTimeSlotOptions,
};
