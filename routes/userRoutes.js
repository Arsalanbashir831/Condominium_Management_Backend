const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { fetchUsers } = require('../swager_controller/User_Swagger');

// Route to get user by email
router.get('/:query', userController.getUserByContact);
router.post('/', userController.addUser);
router.get('/', userController.fetchAllUsers);
router.get('/condo/:condominiumId', userController.getUsersByCondominiumId);
router.put('/:userId', userController.editUser); // PUT request to edit user details



module.exports = router;
