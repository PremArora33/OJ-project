const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
console.log("ENV CHECK (from index.js):", process.env.GEMINI_API_KEY);

const app = require('./app');



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log("❌ MongoDB connection failed:", err));
