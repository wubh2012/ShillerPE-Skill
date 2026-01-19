const express = require('express');
const { executeClaudeCommand } = require('../services/claude-executor');
const authenticate = require('../middleware/auth');
const validateInstruction = require('../middleware/validation');

const router = express.Router();

router.post('/api/v1/execute', authenticate, validateInstruction, async (req, res) => {
  const { instruction } = req.body;
  const startTime = Date.now();

  try {
    const result = await executeClaudeCommand(instruction);
    const executionTime = Date.now() - startTime;

    res.json({
      success: true,
      output: result.output,
      execution_time: executionTime,
      exit_code: result.exitCode
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;

    res.status(500).json({
      success: false,
      error: 'Execution failed',
      message: error.error || error.message,
      execution_time: executionTime,
      exit_code: error.exitCode || -1
    });
  }
});

module.exports = router;
