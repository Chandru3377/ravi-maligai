require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const path = require("path");

// Import routes
const productRoutes = require("./routes/products");
const checkoutRoutes = require("./routes/checkout");
const invoicesRoutes = require("./routes/invoices");
const dashboardRoutes = require("./routes/dashboard");
const reportsRoutes = require("./routes/reports");
const salesRoutes = require("./routes/sales");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.status(200).send("🚀 API is running successfully");
});

// ================= API ROUTES =================
app.use("/api/products", productRoutes);
app.use("/api/cart", checkoutRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/sales", salesRoutes);

// ================= SOCKET.IO =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

app.set("io", io);

// ================= MONGODB =================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ================= FRONTEND (OPTIONAL) =================
// Only if you have React build
const clientPath = path.join(__dirname, "../client/dist");

if (require("fs").existsSync(clientPath)) {
  app.use(express.static(clientPath));

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ================= SERVER START =================
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});