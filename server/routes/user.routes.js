const express = require('express');
const { updateProfile, getMe,  getSuggestions, followUser, unfollowuser } = require('../controllers/user.controller');
const { upload } = require('../config/cloudinary.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');

const router = express.Router();

router.put('/update-profile',verifyToken,upload.single('profileImage'), updateProfile);
router.get('/getMe',verifyToken,getMe);
router.get('/usersuggestions',verifyToken, getSuggestions);
router.post('/follow/:userId', verifyToken, validateObjectId('userId'), followUser);
router.post('/unfollow/:userId', verifyToken, validateObjectId('userId'), unfollowuser);

module.exports = router;
