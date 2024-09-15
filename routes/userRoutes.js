const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Route to get user by email
router.get('/:email', userController.getUserByEmail);
router.post('/', userController.addUser);


module.exports = router;
