const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/DBconnection').sequelize;
const bcrypt = require('bcrypt');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
    },
}, {
    timestamps: false,
});

Admin.ensureDefaults = async () => {
    const defaults = [
        { email: "admin@admin.com", password: '12345678' },
    ];

    for (const admin of defaults) {
        const [adminRecord, created] = await Admin.findOrCreate({
            where: { email: admin.email },
            defaults: {
                ...admin,
                password: await bcrypt.hash(admin.password, 10)
            },
        });

        if (!created) {
            console.log(`Admin with email ${admin.email} already exists.`);
        }
    }
};

module.exports = Admin;