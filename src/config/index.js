require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY,
  claude: {
    timeout: parseInt(process.env.CLAUDE_TIMEOUT) || 60000,
    projectDir: process.env.PROJECT_DIR || '.'
  }
};
