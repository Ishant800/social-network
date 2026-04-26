const express = require('express');
const { search } = require('../controllers/search.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, search);

module.exports = router;
