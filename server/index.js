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

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});

// API routes
app.use("/api/products", productRoutes);
app.use("/api/cart", checkoutRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/sales", salesRoutes);

// Socket setup
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

// Make io available in routes
app.set("io", io);

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Serve frontend (React build)
const clientPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientPath));

// ✅ SPA fallback (VERY IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});