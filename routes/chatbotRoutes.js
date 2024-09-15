const express = require('express');
const geminiChat = require('../controllers/ChatbotController');
const router = express.Router();

router.post('/', geminiChat)
module.exports = router;