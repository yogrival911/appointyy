const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");

const User = require("./models/userModel");
const userRoutes = require("./routes/userRoutes");
const clinicRoutes = require("./routes/clinicRoutes");

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
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
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
