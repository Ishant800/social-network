const express = require('express');
const router = express.Router();
const {
  bulkInsertUser,
  bulkInsertPost,
  bulkInsertBlog,
  getBulkDataStats,
  clearAllData
} = require('../controllers/bulk-data.controller');


router.post('/user', bulkInsertUser);

router.post('/post', bulkInsertPost);


router.post('/blog', bulkInsertBlog);


router.get('/stats', getBulkDataStats);


router.delete('/clear-all', clearAllData);

module.exports = router;
