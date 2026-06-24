const express = require('express');
const passport = require('passport');
const {
  registerUser,
  verifyUser,
  loginUser,
  getUserEmail,
  getSetupPasswordEmail,
  setupPasswordForGoogleUser,
  loginOrCreateUserWithGoogleOAuth,
  logoutUser,
} = require('../controllers/auth-controller');
const { userAuth } = require('../controllers/user-auth');
const userRoutes = express.Router();

userRoutes.post('/register-user', registerUser);
userRoutes.post('/verify-user', verifyUser);
userRoutes.post('/login-user', loginUser);
userRoutes.post('/get-user-email', getUserEmail);
userRoutes.post('/get-setup-password-email', getSetupPasswordEmail);
userRoutes.post('/setup-password', setupPasswordForGoogleUser);
userRoutes.post('/authenticate-user', userAuth);
userRoutes.post('/logout-user', logoutUser);

// login with google
userRoutes.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

// Callback
userRoutes.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  loginOrCreateUserWithGoogleOAuth,
);

module.exports = userRoutes; 


