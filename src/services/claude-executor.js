const { spawn } = require('child_process');
const config = require('../config');

const executeClaudeCommand = (instruction) => {
  return new Promise((resolve, reject) => {
    const args = [
      '-p',
      '--dangerously-skip-permissions',
      '--output-format', 'json',
      instruction
    ];

    const process = spawn('claude', args, {
      cwd: config.claude.projectDir,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      cleanup();
      if (code === 0) {
        resolve({
          success: true,
          output: stdout,
          exitCode: code
        });
      } else {
        reject({
          success: false,
          error: stderr || stdout,
          exitCode: code
        });
      }
    });

    process.on('error', (error) => {
      cleanup();
      reject({
        success: false,
        error: error.message,
        exitCode: -1
      });
    });

    timeoutId = setTimeout(() => {
      process.kill();
      reject({
        success: false,
        error: 'Execution timeout',
        exitCode: -1
      });
    }, config.claude.timeout);
  });
};

module.exports = { executeClaudeCommand };
