const User = require('../models/user-model');
const { uploadToCloudinary } = require('../controllers/upload-controller');
const cloudinary = require('../config/cloudinary');
async function handleProfileImageUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded',
      });
    }
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');
    const { secure_url, public_id } = result;
    const { email } = req.userInfo;
    const user = await User.findOne({ 'personalInfo.email': email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'Sorry, Something went wrong while saving your profile image. Please try again later.',
      });
    }
    // delete the image from cloudinary before replacing it in db
    if (user.personalInfo.avatarPublicId) {
      await cloudinary.uploader.destroy(user.personalInfo.avatarPublicId);
    }
    // save the avatar to admin's personalInfo
    user.personalInfo.avatar = secure_url;
    user.personalInfo.avatarPublicId = public_id;
    await user.save();
    res.status(201).json({
      success: true,
      message: 'Profile image set successfully',
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: 'There was a problem in uploading your image',
      error: error?.message,
    });
  }
}

module.exports = { handleProfileImageUpload };
