const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;

const Ticket = sequelize.define('Ticket', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_condominium:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_email: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    user_phone :{
        type: DataTypes.STRING,
        allowNull:true
    },
    technician_name:{
        type : DataTypes.STRING, 
        allowNull:true
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
