const { sendVerificationEmail } = require('../helpers/sendgrid');
const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// register a user
async function registerUser(req, res) {
  try {
    const { email, password, rememberMe } = req.body;
    // check if the user exist in db
    const user = await User.findOne({ 'personalInfo.email': email });
    if (user) {
      return res.status(403).json({
        success: false,
        message: 'The user already exist. Please Login.',
      });
    }
    // create a new user with hashed pass
    const genSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, genSalt);
    // hashing the verification code 0.87352416263
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedVerificationCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');
    // send  the user the 6 digit code to verify their email
    sendVerificationEmail(email, code);
    const newlyCreatedUser = new User({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: email,
        phone: '',
        gender: null,
        dateOfBirth: new Date(),
      },

      // 2. Role & Account State
      role: 'client',
      // 3. Location & Geography
      location: {
        county: 'Nairobi',
        area: '',
      },
      lifecycle: {
        joinedAt: new Date(),
        convertedAt: null,
      },

      // 6. Authentication & Security
      auth: {
        passwordHash: hashedPassword,
        rememberMe: rememberMe,
        emailVerified: false,
        phoneVerified: false,
        emailVerification: {
          codeHash: hashedVerificationCode,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          attempts: 0,
        },
        provider: null,
      },

      // 7. Client Profile
      clientProfile: {
        hasBookedService: false,
        totalBookings: 0,
        lifetimeValue: 0,
        preferredContactMethod: 'phone',
      },

      // 8. Billing & Subscription
      billing: {
        hasActiveSubscription: false,
        subscriptionTier: null,
        subscriptionStart: null,
        subscriptionEnd: null,
        totalPaid: 0,
      },
    });
    await newlyCreatedUser.save();

    res.status(201).json({
      success: true,
      message:
        'Account created. We have sent a 6 digit code to your email. Verify your email with the code.',
      accessToken: hashedVerificationCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

// verify user's email
async function verifyUser(req, res) {
  try {
    const { cryptoCode, code } = req.body;
    const user = await User.findOne({
      'auth.emailVerification.codeHash': cryptoCode,
    });

    // check if the user exist
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'We could not find the email you are trying to verify. Please create an account.',
      });
    }
    // check if the code is expired
    if (user.auth.emailVerification.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request another code. ',
      });
    }
    // Protection against brute force
    if (user.auth.emailVerification.attempts > 5) {
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Request for a new code.',
      });
    }

    // Hash the submitted code
    const submittedHashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    if (submittedHashedCode !== user.auth.emailVerification.codeHash) {
      user.auth.emailVerification.attempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'The verification code you entered is incorect.',
      });
    }

    // change the verification status if the code is correct
    user.auth.emailVerified = true;
    user.auth.emailVerification.codeHash = null;
    user.auth.emailVerification.expiresAt = null;
    user.auth.emailVerification.attempts = 0;
    await user.save();

    // generate the jwt for long lived tokens
    if (user.auth.rememberMe) {
      const token = jwt.sign(
        { id: user._id, email: user.personalInfo.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );
      // send the cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Your email is now verified.',
        user: user.role,
      });
    } else {
      const token = jwt.sign(
        { id: user._id, email: user.personalInfo.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2min' },
      );
      // send the cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 2 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Your email is now verified.',
        user: user.role,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password, rememberMe } = req.body;
    // check if the user exist
    const user = await User.findOne({ 'personalInfo.email': email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'We could not find an account related to this email, Please create a new account.',
      });
    }
    // for users who signed in with google
    if (user.auth.provider === 'google') {
      return res.status(400).json({
        success: false,
        message:
          'This account was created using Google. Please sign in with Google and set your password in account settings.',
      });
    }
    // check if the password matches
    const comparePass = await bcrypt.compare(password, user.auth.passwordHash);
    if (comparePass === false) {
      return res.status(400).json({
        sucess: false,
        message: 'Incorrect password. Please try again or reset.',
      });
    }

    // check if the user is verified
    if (user.auth.emailVerified !== true) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedVerificationCode = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

      user.auth.emailVerification.codeHash = hashedVerificationCode;
      ((user.auth.emailVerification.expiresAt = new Date(
        Date.now() + 60 * 60 * 1000,
      )),
        await user.save());
      sendVerificationEmail(email, code);
      return res.status(400).json({
        success: false,
        message:
          'Your account is not verified. We have sent the 6-digit code to your email to verify it.',
        hashedCode: hashedVerificationCode,
        user: user.role,
      });
    }

    // if everything matches
    // generate the jwt for long lived tokens
    if (rememberMe) {
      const token = jwt.sign(
        { id: user._id, email: user.personalInfo.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );

      // send the cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: 'Login Successfull. Welcome back.',
        data: user,
      });
    } else {
      // generating short lived  token when remember is not true
      const token = jwt.sign(
        { id: user._id, email: user.personalInfo.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '5min' },
      );

      // send the cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 2 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: 'Login Successfull. Youre Welcome back.',
        data: user,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

// get user email
async function getUserEmail(req, res) {
  try {
    const { crypto } = req.body;
    const user = await User.findOne({
      'auth.emailVerification.codeHash': crypto,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          'We could not find an account related to this email, Please create a new account.',
      });
    }
    res.status(200).json({
      sucess: true,
      message: 'Email found',
      email: user.personalInfo.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

async function loginOrCreateUserWithGoogleOAuth(req, res) {
  try {
    const user = req?.user;
    const token = jwt.sign(
      { id: user._id, email: user.personalInfo.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    // send the cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    if (user?.role === 'admin') {
      if (process.env.NODE_ENV === 'development') {
        res.redirect('http://localhost:5173/admin-dashboard');
      } else {
        res.redirect('https://nuro-care.vercel.app/admin-dashboard');
      }
    } else if (user?.role === 'client') {
      if (process.env.NODE_ENV === 'development') {
        res.redirect('http://localhost:5173/patient-dashboard');
      } else {
        res.redirect('https://nuro-care.vercel.app/patient-dashboard');
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

function logoutUser(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  getUserEmail,
  loginOrCreateUserWithGoogleOAuth,
  logoutUser,
};
