const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");

const User = require("./models/userModel");
const userRoutes = require("./routes/userRoutes");
const clinicRoutes = require("./routes/clinicRoutes");
const { sendTextMessage, sendTemplateMessage, sendTimeSlotOptions } = require("./controllers/whatsappService");

dotenv.config();
 connectDB();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
const verifyToken = process.env.META_VERIFY_TOKEN;

// Meta end points for whatsapp business app
// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', async (req, res)  => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

 // Example: auto-reply if it's a text message
 const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  const contact = changes?.value?.contacts?.[0];
  const value = changes?.value;
  // Ignore delivery/read receipts
if (value?.statuses) {
  console.log("Status update, no reply needed.");
  return res.status(200).end();
}
 if (message && message.type === "text" && message.text?.body) {
  const from = message.from;
  const name = contact?.profile?.name || "there";
  // Text mss
  if(message.text?.body === "Hi"){
    await sendTextMessage(from, `Hello ${name}, Welcome to Lycra Salon. How can I help you?`);
  }else if(message.text?.body === "I want to book an appointment"){
  // template msg
  // await sendTemplateMessage(from, "hello_world"); 
  // slot msg
  const slots = ["10:00 AM", "11:30 AM", "2:00 PM"];
  sendTimeSlotOptions(from, slots);
  }else{
    await sendTextMessage(from, `Your appointment is confirmed for 11:30 AM`);

  }

  // template msg
  // await sendTemplateMessage(from, "hello_world"); 

  // slot msg
  // const slots = ["10:00 AM", "11:30 AM", "2:00 PM"];
  // sendTimeSlotOptions(from, slots);
  
  //  const reply = {
  //    messaging_product: "whatsapp",
  //    to: from,
  //    text: { body: `Hello ${contact.profile.name}! Thanks for your msg 🙌` }
  //  };

  //  const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`, {
  //    method: "POST",
  //    headers: {
  //      "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
  //      "Content-Type": "application/json"
  //    },
  //    body: JSON.stringify(reply)
  //  });

//    const data = await res.json();
// console.log("WhatsApp API response:", data);
 }


  res.status(200).end();
});


app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// 🌟 Seed Super Admin (runs once at startup)
const createSuperAdmin = async () => {
  try {
    const superAdminExists = await User.findOne({ role: "superadmin" });

    if (!superAdminExists) {
      // const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD, 10);

      await User.create({
        name: "Super Admin",
        email: process.env.SUPERADMIN_EMAIL,
        password: process.env.SUPERADMIN_PASSWORD,
        role: "superadmin",
      });

      console.log("✅ Super Admin created successfully");
    } else {
      console.log("ℹ️ Super Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating super admin:", error.message);
  }
};

// Call seeder after DB connection
createSuperAdmin();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/clinics", clinicRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
