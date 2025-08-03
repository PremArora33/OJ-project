const fs = require("fs-extra");
const path = require("path");
const { v4: uuid } = require("uuid");

const inputPath = path.join(__dirname, "../inputs");

const generateInputFile = async (inputData = "") => {
  const jobId = uuid();
  const filename = `${jobId}.txt`;
  const fullPath = path.join(inputPath, filename);

  await fs.ensureDir(inputPath);
  await fs.writeFile(fullPath, inputData);
  return fullPath;
};

module.exports = generateInputFile; // ✅ Exported as default
