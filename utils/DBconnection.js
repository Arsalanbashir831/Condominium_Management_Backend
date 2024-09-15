// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', 
  logging: false,
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); 
  }
};

const syncDb = async () => {
  try {
    require('../models/Admin');
    require('../models/Assosiation');
    require('../models/Technician');
    require('../models/Ticket');
    require('../models/Users');
    require('../models/Condominium');
    require('../models/PrefCommunication');
    await sequelize.sync({ alter: true }); 
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Failed to synchronize database:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDb,
  syncDb,
};
