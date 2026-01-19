const MAX_INSTRUCTION_LENGTH = 5000;

const DANGEROUS_PATTERNS = [
  /&&\s*rm/i,
  /;\s*rm/i,
  /\|\s*rm/i,
  /`.*`/,
  /\$\(/
];

const validateInstruction = (req, res, next) => {
  const { instruction } = req.body;

  if (!instruction) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Instruction is required'
    });
  }

  if (typeof instruction !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Instruction must be a string'
    });
  }

  if (instruction.length > MAX_INSTRUCTION_LENGTH) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Instruction exceeds maximum length of ${MAX_INSTRUCTION_LENGTH} characters`
    });
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(instruction)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Instruction contains potentially dangerous patterns'
      });
    }
  }

  next();
};

module.exports = validateInstruction;
