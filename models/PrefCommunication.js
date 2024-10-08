const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;

const PrefCommunication = sequelize.define('PrefCommunication', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
}, {
    timestamps: false,
});

PrefCommunication.ensureDefaults = async () => {
    const defaults = [
        { id: 1, name: 'Email' },
        { id: 2, name: 'Telephone' },
    ];

    for (const pref of defaults) {
        await PrefCommunication.findOrCreate({
            where: { id: pref.id },
            defaults: pref,
        });
    }
};

module.exports = PrefCommunication;