const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");

const outputPath = path.join(__dirname, "../outputs");

const executeC = async (codePath, inputPath) => {
  const jobId = uuid();
  const outputBinary = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    const compile = `gcc ${codePath} -o ${outputBinary}`;
    const run = `${outputBinary} < ${inputPath}`;

    exec(compile, (compileErr, _, compileStderr) => {
      if (compileErr) return reject({ error: compileStderr });

      exec(run, (runErr, runStdout, runStderr) => {
        if (runErr) return reject({ error: runStderr });
        return resolve({ output: runStdout });
      });
    });
  });
};

module.exports = executeC;
