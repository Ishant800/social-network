const express = require('express')
const postRoute = express.Router()
const postController = require("../controller/post.controller")

postRoute.post("/createpost",postController.createPost);

module.exports = postRoute