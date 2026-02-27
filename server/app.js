const { configDotenv } = require("dotenv")
const express = require("express")
const cors = require("cors")
const db = require("./database/dbconfig")
const app = express()

app.use(express.json())
app.use(cors("*"))
configDotenv()

//database connect
db
const PORT_NO = process.env.PORT


const authRoute = require("./modules/authModule/routes/auth.route")


app.use("/auth",authRoute)
app.listen(PORT_NO,()=>{
    console.log(`server running successfully on port: ${PORT_NO}`)
})