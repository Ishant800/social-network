const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');
const { toggleBookmark, getBookmarks, getBookmarkIds } = require('../controllers/bookmark.controller');

const router = express.Router();

router.get('/',         verifyToken, getBookmarks);
router.get('/ids',      verifyToken, getBookmarkIds);
router.post('/:itemId', verifyToken, validateObjectId('itemId'), toggleBookmark);

module.exports = router;
