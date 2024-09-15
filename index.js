const express = require('express');
const { connectDb, syncDb } = require('./utils/DBconnection'); 
require('dotenv').config();
const adminRoutes = require('./routes/adminRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const userRoutes = require('./routes/userRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors())
app.use('/api/admin', adminRoutes);
app.use('/api/ticket', ticketRoutes);
app.use('/api/technician', technicianRoutes);
app.use('/api/user', userRoutes);
app.use('/api/aichat', chatbotRoutes);
const initializeDatabase = async () => {
  await connectDb(); 
  await syncDb();    
};
initializeDatabase();




const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
