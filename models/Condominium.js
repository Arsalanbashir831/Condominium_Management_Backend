const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;

const Condominium = sequelize.define('Condominium', {
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

Condominium.ensureDefaults = async () => {
    const defaults = [
        { id: 1, name: 'Condominium ALFA' },
        { id: 2, name: 'Condominium BETA' },
        { id: 3, name: 'Condominium GAMMA' },
    ];

    for (const condo of defaults) {
        await Condominium.findOrCreate({
            where: { id: condo.id },
            defaults: condo,
        });
    }
};

module.exports = Condominium;