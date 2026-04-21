const express = require('express');
const { getHomeFeed } = require('../controllers/feed.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/home', verifyToken, getHomeFeed);
  
module.exports = router;
