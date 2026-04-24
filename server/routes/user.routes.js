const express = require('express');
const { updateProfile, getMe, getSuggestions, followUser, unfollowuser, getFollowers, getFollowing, getUserProfile } = require('../controllers/user.controller');
const { upload } = require('../config/cloudinary.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validateObjectId.middleware');

const router = express.Router();

router.put('/update-profile',verifyToken,upload.single('profileImage'), updateProfile);
router.get('/getMe',verifyToken,getMe);
router.get('/profile/:userId', verifyToken, validateObjectId('userId'), getUserProfile);
router.get('/usersuggestions',verifyToken, getSuggestions);
router.post('/follow/:userId', verifyToken, validateObjectId('userId'), followUser);
router.post('/unfollow/:userId', verifyToken, validateObjectId('userId'), unfollowuser);
router.get('/followers', verifyToken, getFollowers);
router.get('/followers/:userId', verifyToken, validateObjectId('userId'), getFollowers);
router.get('/following', verifyToken, getFollowing);
router.get('/following/:userId', verifyToken, validateObjectId('userId'), getFollowing);

module.exports = router;
