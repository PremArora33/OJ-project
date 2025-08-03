const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const compilerRoutes = require("./routes/compilerRoutes");

dotenv.config();

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();

// ✅ CORS middleware setup
app.use(cors({
  origin: "http://localhost:3000", // your frontend origin
  credentials: true,               // enable cookies/session if needed
}));

app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Compiler Service is Alive!");
});

// ✅ Route for running code and test cases
app.use("/api", compilerRoutes);

// ✅ Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🛠️ Compiler server running on port ${PORT}`);
});
