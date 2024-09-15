// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/TicketController');
const authenticateJWT = require('../middleware/authMiddleware'); // Add authentication middleware if needed

// Route to get all tickets
router.get('/', authenticateJWT, ticketController.getAllTickets);
// Route to create a new ticket
router.post('/', authenticateJWT, ticketController.createTicket);

router.put('/:ticketId', authenticateJWT, ticketController.updateTicket);

router.delete('/:ticketId', authenticateJWT, ticketController.deleteTicket);

router.post('/assign', authenticateJWT, ticketController.assignTechnicianToTicket);

module.exports = router;
