// // routes/ticketRoutes.js
// const express = require('express');
// const router = express.Router();
// const ticketController = require('../controllers/TicketController');
// const authenticateJWT = require('../middleware/authMiddleware'); // Add authentication middleware if needed

// // Route to get all tickets
// router.get('/', authenticateJWT, ticketController.getAllTickets);
// // Route to create a new ticket
// router.post('/', ticketController.createTicket);

// router.put('/:ticketId', authenticateJWT, ticketController.updateTicket);

// router.delete('/:ticketId', authenticateJWT, ticketController.deleteTicket);

// router.post('/assign', authenticateJWT, ticketController.assignTechnicianToTicket);

// module.exports = router;



const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/TicketController'); // Adjust the path as necessary
const authenticateJWT = require('../middleware/authMiddleware');
router.get('/',  ticketController.getAllTickets);
router.post('/', ticketController.createTicket);
router.put('/:ticketId', ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);
router.post('/assign', ticketController.assignTechnicianToTicket);
router.put('/:ticketId/status', ticketController.updateTicketStatus);

module.exports = router;
