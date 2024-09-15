const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/TechniciansController');
const authenticateJWT = require('../middleware/authMiddleware');

router.get('/', authenticateJWT,technicianController.getAllTechnicians);
router.get('/byCondominium',authenticateJWT, technicianController.getTechniciansByCondominiumId);


module.exports = router;
