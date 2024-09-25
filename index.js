const express = require('express');
const { connectDb, syncDb } = require('./utils/DBconnection'); 
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const userRoutes = require('./routes/userRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const condominiumRoutes = require('./routes/condominiumRoutes')
const cors = require('cors');
const { getTicketsAndNotifyAdmin, getTicketsAndSendEmail } = require('./controllers/TicketController');


const app = express();
app.use(express.json());
app.use(cors())
app.use('/api/admin', adminRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/user', userRoutes);
app.use('/api/aichat', chatbotRoutes);
app.use('/api/condominium', condominiumRoutes);
const initializeDatabase = async () => {
  await connectDb(); 
  await syncDb();    
};
initializeDatabase();

const checkTicketsAndNotifyAdmin = async () => {
  try {
    console.log('mail function called')
      // Simulate a request and response
      const req = {}; // Mock request object
      const res = {
          status: (code) => ({
              json: (data) => console.log(`Response: ${code}`, data),
          }),
      };

      await getTicketsAndNotifyAdmin(req, res);
  } catch (error) {
      console.error('Error calling getTicketsAndNotifyAdmin:', error);
  }
};

const followUpMailToTechnicians = async () => {
  try {
      // Simulate a request and response
      const req = {}; // Mock request object
      const res = {
          status: (code) => ({
              json: (data) => console.log(`Response: ${code}`, data),
          }),
      };

      await getTicketsAndSendEmail(req, res);
  } catch (error) {
      console.error('Error calling Follow up Email:', error);
  }
};

//setInterval(followUpMailToTechnicians, 6000);
// setInterval(checkTicketsAndNotifyAdmin, 6000);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
