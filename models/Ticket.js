const { Sequelize, DataTypes } = require('sequelize');
const User = require('./Users');
const Technician = require('./Technician');
const sequelize = require('../utils/DBconnection').sequelize;

const Ticket = sequelize.define('Ticket', {
    // username: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    // user_condominium:{
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    // user_email: {
    //     type: DataTypes.STRING, 
    //     allowNull: true,
    // },
    // user_phone :{
    //     type: DataTypes.STRING,
    //     allowNull:true
    // },
    // technician_name:{
    //     type : DataTypes.STRING, 
    //     allowNull:true
    // },
   userId:{
    type:DataTypes.INTEGER,
    references:{
        model:User,
        key:'id'
    }, allowNull:false
   },
   technicianId:{
    type:DataTypes.INTEGER,
    references:{
        model:Technician,
        key:'id'
    }, allowNull:false
   },
    priority:{
        type:DataTypes.STRING,
        allowNull:false
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
