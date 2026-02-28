const mongoose = require('mongoose')

async function connectDb() {
    try {
        await mongoose.connect(process.env.CNS)
        console.log("mongoose connected sucessfully")
    } catch (error) {
        console.error("mongoose connection failed")
        process.exit(1);
    }
}


module.exports = connectDb