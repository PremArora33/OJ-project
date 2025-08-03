// utils/generateFile.js
const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");

const outputPath = path.join(__dirname, "../codes");

async function generateFile(language, code) {
  await fs.ensureDir(outputPath);

  let filename;
  if (language === "java") {
    filename = "Main.java";
  } else {
    const ext = language === "cpp" ? "cpp" :
                language === "python" ? "py" :
                language === "c" ? "c" : "txt";
    const jobId = uuid();
    filename = `${jobId}.${ext}`;
  }

  const filePath = path.join(outputPath, filename);
  await fs.writeFile(filePath, code);
  return filePath;
}

module.exports = generateFile; // ✅ Not inside an object!
