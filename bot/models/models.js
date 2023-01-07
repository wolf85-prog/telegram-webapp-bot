const {db} = require('../connections/db')
const {DataTypes} = require('sequelize')

module.exports = db.define('user', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: true,
        allowNull: false,    
    },
    login: {
        type: DataTypes.STRING, 
        allowNull: false, 
    },
    username: {
        type: DataTypes.STRING, 
        allowNull: false, 
    },
    email: {
        type: DataTypes.STRING, 
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING, 
        defaultValue: "USER"
    },
}, {
    timestamps: true,
    updatedAt: false,
})