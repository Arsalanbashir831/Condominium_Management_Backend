
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;

const Status = sequelize.define('Status', {
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
Status.ensureDefaults = async () => {
 
    const defaults = [
      { id: 1, name: 'pending' },
      { id: 2, name: 'accepted' },
      { id: 3, name: 'rejected' },
    ];
  
    for (const status of defaults) {
      await Status.findOrCreate({
        where: { id: status.id },
        defaults: status,
      });
    }
  };
module.exports = Status;
