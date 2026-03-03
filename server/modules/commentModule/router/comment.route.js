const express = require('express')
const router = express.Router()

const {verifyToken} = require("../../../token/verifyToken");
const {createComment, getPostComments, deleteComment} = require("../controller/comment.controller")
router.post("/create/:postId",verifyToken,createComment);
router.get("/getComment/:postId",getPostComments)
router.delete("/delete/:postId",verifyToken,deleteComment)

module.exports = router