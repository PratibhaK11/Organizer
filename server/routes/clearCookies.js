// routes/clearCookies.js
const express = require('express');
const router = express.Router();

router.post('/clear-cookies', (req, res) => {
  res.clearCookie('connect.sid'); 
  res.status(200).json({ message: 'Cookies cleared' });
});

module.exports = router;
