const express = require('express');
const router = express.Router();
const condominiumController = require('../controllers/CondominiumController');

router.post('/', condominiumController.createCondominium);
router.get('/', condominiumController.getAllCondominiums);
router.get('/:id', condominiumController.getCondominiumById);
router.put('/:id', condominiumController.updateCondominium);
router.delete('/:id', condominiumController.deleteCondominium);

module.exports = router;
