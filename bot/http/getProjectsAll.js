require("dotenv").config();

const axios = require("axios");

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

module.exports = async function getProjectsAll() {
    try {
       let response = await $host.get(`projectscash`);
       //console.log(response);
       return response.data;
    } catch (error) {
        console.log("error while calling getProjectsAll api", error.message);
    }
}
