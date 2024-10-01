// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', 
  dialectOptions:{
   
      ssl: {
          require: true, // This will ensure SSL is used
          rejectUnauthorized: false, // You can set this to true if you have a proper certificate
      },
    },
  logging: false,
  
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); s
  }
};

const syncDb = async () => {
  try {
    const Admin = require('../models/Admin');
    const Assosiation = require('../models/Assosiation');
    const Technician = require('../models/Technician');
    const Ticket = require('../models/Ticket');
    const Users = require('../models/Users');
    const Condominium = require('../models/Condominium');
    const PrefCommunication = require('../models/PrefCommunication');
    const Status = require('../models/Status');

    await sequelize.sync({ alter: true }); 
    await Status.ensureDefaults();
    await PrefCommunication.ensureDefaults();
    await Condominium.ensureDefaults()
     await Admin.ensureDefaults()
     await Technician.ensureDefaults()
     await Users.ensureDefaults()
    console.log('Database synchronized and default statuses ensured.');
  } catch (error) {
    console.error('Failed to synchronize database or ensure defaults:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDb,
  syncDb,
};