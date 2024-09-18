const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/TechniciansController');
const authenticateJWT = require('../middleware/authMiddleware');
const { fetchTechnician } = require('../swager_controller/Technician_Swagger');

router.get('/', authenticateJWT,technicianController.getAllTechnicians);
router.get('/byCondominium',authenticateJWT, technicianController.getTechniciansByCondominiumId);
router.get('/swagger', fetchTechnician)


module.exports = router;
