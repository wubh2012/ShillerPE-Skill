const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

router.post('/api/shiller-pe', async (req, res) => {
  try {
    const data = req.body;

    if (!data.pe || !data.crawl_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pe and crawl_date'
      });
    }

    const filePath = path.join(process.cwd(), 'shillerpe.json');
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: 'Data received and saved',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save data',
      error: error.message
    });
  }
});

module.exports = router;
