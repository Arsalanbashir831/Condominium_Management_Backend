const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;
const Condominium = require('./Condominium'); 
const Technician = require('./Technician');
const User = require('./Users');

const Ticket = sequelize.define('Ticket', {
   userId:{
    type : DataTypes.INTEGER,
    references:{
        model:User,
        key:'id',
    }, allowNull:false
   },
    TechnicianId: {
        type: DataTypes.INTEGER,
        references: {
            model: Technician, 
            key: 'id', 
        },
        allowNull: true,
    },
    isUrgent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    ProblemStatement: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

module.exports = Ticket;
