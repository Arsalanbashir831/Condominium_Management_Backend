const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, logoutAdmin } = require('../controllers/AdminAuthController');
const authenticateJWT = require('../middleware/authMiddleware');
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', authenticateJWT, logoutAdmin);

module.exports = router;
