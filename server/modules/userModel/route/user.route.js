const express = require("express")
const userRoute = express.Router()
const userController = require("../controller/user.controller");
const { upload } = require("../../../storage/cloudconfig");
const { verifyToken } = require("../../../token/verifyToken");

userRoute.put("/update-profile/:id",verifyToken,upload.single("profileImage"),userController.updateProfile);


module.exports = userRoute;