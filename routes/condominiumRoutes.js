const express = require('express');
const router = express.Router();

const { fetchCondominium } = require('../swager_controller/Condominium_Swagger');
router.get('/',fetchCondominium)

module.exports = router;
