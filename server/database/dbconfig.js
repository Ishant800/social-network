const { config, configDotenv } = require('dotenv')
const mongoose = require('mongoose')
configDotenv()

//connection string url
const csurl = process.env.CSTRING;
const db = mongoose.connect(csurl,console.log("db connected sucessfully"))

if(!db) console.log("failed to connect DB")

module.exports = db