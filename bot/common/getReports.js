require("dotenv").config();
const sequelize = require('./../connections/db')
const {Project} = require('./../models/models')
const getBlocks = require('./../common/getBlocks')
const getDatabaseId = require('./../common/getDatabaseId')

module.exports = async function getReports(project_id) {
    
}