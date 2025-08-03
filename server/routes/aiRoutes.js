const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/explain", async (req, res) => {
  const { code, language } = req.body;

  try {
    const prompt = `
You are an expert programmer. Explain the following ${language} code in a beginner-friendly way with comments and breakdowns.

\`\`\`${language}
${code}
\`\`\`
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const explanation = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!explanation) {
      throw new Error("No explanation received from Gemini.");
    }

    res.json({ explanation });

  } catch (err) {
    console.error("Gemini error:", err?.response?.data || err.message || err);
    res.status(500).json({
      error: "Failed to generate explanation from Gemini.",
      details: err?.response?.data || err.message || err,
    });
  }
});

module.exports = router;
