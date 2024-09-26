const express = require('express');
const {geminiChat,simpleSupportChat} = require('../controllers/ChatbotController');
const router = express.Router();

router.post('/', geminiChat)
router.post('/customerSupport', simpleSupportChat)
module.exports = router;