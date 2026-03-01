const express = require('express')
const postRoute = express.Router()
const postController = require("../controller/post.controller")
const middleware = require("../../../token/verifyToken");
const { upload } = require('../../../storage/cloudconfig');


postRoute.post("/createpost",
    middleware.verifyToken,
    upload.array("media",5)
    ,postController.createPost);

postRoute.get("/myPost",
    middleware.verifyToken,
    postController.getMyPost)
postRoute.get("/post-details/:postId",
    middleware.verifyToken,
    postController.getPostDetails)

module.exports = postRoute