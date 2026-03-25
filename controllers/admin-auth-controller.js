const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
async function adminAuth(req, res, next) {

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const findUSer = await User.findOne({
      'personalInfo.email': decoded.email,
    });
    if (!findUSer) {
      return res.status(404).json({
        success: false,
        message: 'Unauthorized: No User found',
      });
    }
    if (findUSer.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not admin',
      });
    }
    req.userInfo = decoded;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Some error occurred:',
      error: error?.message,
    });
  }
}

module.exports = { adminAuth };
