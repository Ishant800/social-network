const { configDotenv } = require("dotenv")
const express = require("express")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors("*"))
configDotenv()

const authRoute = require("./modules/authModule/routes/auth.route")
const connectDb = require("./database/dbconfig")


app.use("/auth",authRoute)


connectDb().then(()=>{

const PORT_NO = process.env.PORT
app.listen(PORT_NO,()=>{
    console.log(`server running successfully on port: ${PORT_NO}`)
})
})
 