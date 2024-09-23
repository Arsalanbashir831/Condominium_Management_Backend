
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;
const Condominium = require('./Condominium'); // Import the Condominium model
const PrefCommunication = require('./PrefCommunication')
const Technician = sequelize.define('Technician', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },  
    CompanyName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    SectorName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ContactNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    PrefferedCommunication:{
        type : DataTypes.INTEGER,
        references:{
            model: PrefCommunication,
            key:'id'
        }, allowNull: false
    }
    ,
    CondominiumId: { 
        type: DataTypes.INTEGER,
        references: {
            model: Condominium,
            key: 'id',
        },
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

module.exports = Technician;
