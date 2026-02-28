const express = require('express')
const postRoute = express.Router()
const postController = require("../controller/post.controller")
const middleware = require("../../../token/verifyToken")


postRoute.post("/createpost",middleware.verifyToken,postController.createPost);

module.exports = postRoute