const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { fetchUsers } = require('../swager_controller/User_Swagger');

// Route to get user by email
// router.get('/:email', userController.getUserByEmail);
router.post('/', userController.addUser);
router.get('/swagger', fetchUsers);


module.exports = router;
