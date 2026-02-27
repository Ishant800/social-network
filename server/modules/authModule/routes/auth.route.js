const express = require('express')
const authRoute = express.Router()
const {createUser,login} = require("../controller/auth.controller")


authRoute.post("/signup",createUser)
authRoute.post("/login",login)


module.exports = authRoute