const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/TechniciansController');
const authenticateJWT = require('../middleware/authMiddleware');
const { fetchTechnician } = require('../swager_controller/Technician_Swagger');

router.get('/',technicianController.getAllTechnicians);
router.get('/byCondominium', technicianController.getTechniciansByCondominiumId);
router.put('/:technicianId', technicianController.updateTechnician);
router.get('/swagger', fetchTechnician)


module.exports = router;
