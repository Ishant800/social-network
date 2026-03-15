const express = require('express')
const { verifyToken } = require('../middleware/auth.middleware')
const { postLike, unLike } = require('../controllers/like.controller')
const router = express.Router()

router.post("/post/like/:postId",verifyToken,postLike)
router.post("/post/unlike/:postId",verifyToken,unLike)


module.exports = router;
 