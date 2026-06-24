const { sendVerificationEmail } = require('../helpers/resend');
const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

const frontendBaseUrl =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://nuro-care.vercel.app'
    : 'http://localhost:5173');

// register a user
async function registerUser(req, res) {
  try {
    const { email, password, rememberMe } = req.body;
    // check if the user exist in db
    const user = await User.findOne({ 'personalInfo.email': email });
    if (user) {
      if (user.auth.provider === 'google' && !user.auth.passwordHash) {
        return res.status(403).json({
          success: false,
          requiresPasswordSetup: true,
          message:
            'An account with this email exists via Google. Sign in and set a password, or use Google sign-in.',
        });
      }
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
    const emailResult = await sendVerificationEmail(
      email,
      code,
      'Verify your Nuro Home Care account',
    );
    if (!emailResult.success) {
      return res.status(503).json({
        success: false,
        message:
          'Could not send verification email. Please try again in a moment.',
      });
    }
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
        provider: 'emailpass',
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
        ...cookieOptions,
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
        { expiresIn: '20min' },
      );
      // send the cookie
      res.cookie('token', token, {
        ...cookieOptions,
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
    // Google accounts without a password must set one before email sign-in
    if (user.auth.provider === 'google' && !user.auth.passwordHash) {
      const setupToken = crypto.randomBytes(32).toString('hex');
      const hashedSetupToken = crypto
        .createHash('sha256')
        .update(setupToken)
        .digest('hex');

      user.auth.passwordSetup = {
        tokenHash: hashedSetupToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        codeHash: null,
        codeExpiresAt: null,
        codeVerified: false,
        codeAttempts: 0,
      };
      await user.save();

      return res.status(403).json({
        success: false,
        requiresPasswordSetup: true,
        message:
          'This account was created with Google. Set a password to sign in with email.',
        setupToken: hashedSetupToken,
        email: user.personalInfo.email,
      });
    }

    if (!user.auth.passwordHash) {
      return res.status(400).json({
        success: false,
        message:
          'No password is set for this account. Please sign in with Google or contact support.',
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
      user.auth.emailVerification.expiresAt = new Date(
        Date.now() + 60 * 60 * 1000,
      );
      await user.save();
      const emailResult = await sendVerificationEmail(
        email,
        code,
        'Verify your Nuro Home Care account',
      );
      if (!emailResult.success) {
        return res.status(503).json({
          success: false,
          message:
            'Could not send verification email. Please try again in a moment.',
        });
      }
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
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: 'Login Successfull. Welcome back.',
        data: user,
        role: user.role,
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
        ...cookieOptions,
        maxAge: 2 * 60 * 1000,
      });
      res.status(200).json({
        success: true,
        message: 'Login Successfull. Youre Welcome back.',
        data: user,
        role: user.role,
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

async function findGoogleUserBySetupToken(setupToken) {
  const user = await User.findOne({
    'auth.passwordSetup.tokenHash': setupToken,
  });
  if (!user) return { error: 'Invalid or expired setup link. Please try signing in again.', status: 404 };
  if (
    !user.auth.passwordSetup?.expiresAt ||
    user.auth.passwordSetup.expiresAt < new Date()
  ) {
    return { error: 'This setup link has expired. Please try signing in again.', status: 400 };
  }
  if (user.auth.provider !== 'google') {
    return { error: 'Password setup is only available for Google accounts.', status: 400 };
  }
  return { user };
}

async function getSetupPasswordEmail(req, res) {
  try {
    const { setupToken } = req.body;
    const result = await findGoogleUserBySetupToken(setupToken);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    res.status(200).json({
      success: true,
      email: result.user.personalInfo.email,
      codeVerified: result.user.auth.passwordSetup?.codeVerified === true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

async function sendPasswordSetupCode(req, res) {
  try {
    const { setupToken } = req.body;
    const result = await findGoogleUserBySetupToken(setupToken);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { user } = result;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    user.auth.passwordSetup.codeHash = codeHash;
    user.auth.passwordSetup.codeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    user.auth.passwordSetup.codeVerified = false;
    user.auth.passwordSetup.codeAttempts = 0;
    await user.save();

    const emailResult = await sendVerificationEmail(
      user.personalInfo.email,
      code,
      'Verify your email to set your Nuro Home Care password',
    );

    if (!emailResult.success) {
      return res.status(503).json({
        success: false,
        message: 'Could not send verification email. Please try again shortly.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

async function verifyPasswordSetupCode(req, res) {
  try {
    const { setupToken, code } = req.body;
    const result = await findGoogleUserBySetupToken(setupToken);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { user } = result;

    if (
      !user.auth.passwordSetup?.codeHash ||
      !user.auth.passwordSetup?.codeExpiresAt ||
      user.auth.passwordSetup.codeExpiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please request a new code.',
      });
    }

    if (user.auth.passwordSetup.codeAttempts > 5) {
      return res.status(400).json({
        success: false,
        message: 'Too many attempts. Please request a new code.',
      });
    }

    const submittedHash = crypto.createHash('sha256').update(code).digest('hex');
    if (submittedHash !== user.auth.passwordSetup.codeHash) {
      user.auth.passwordSetup.codeAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'The verification code you entered is incorrect.',
      });
    }

    user.auth.passwordSetup.codeVerified = true;
    user.auth.passwordSetup.codeHash = null;
    user.auth.passwordSetup.codeExpiresAt = null;
    user.auth.passwordSetup.codeAttempts = 0;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified. You can now set your password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
      error: error?.message,
    });
  }
}

async function setupPasswordForGoogleUser(req, res) {
  try {
    const { setupToken, password, rememberMe } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const result = await findGoogleUserBySetupToken(setupToken);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { user } = result;

    if (user.auth.passwordSetup?.codeVerified !== true) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email with the 6-digit code first.',
        requiresCodeVerification: true,
      });
    }

    const genSalt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    user.auth.passwordHash = hashedPassword;
    user.auth.rememberMe = rememberMe ?? false;
    user.auth.passwordSetup = {
      tokenHash: null,
      expiresAt: null,
      codeHash: null,
      codeExpiresAt: null,
      codeVerified: false,
      codeAttempts: 0,
    };
    await user.save();

    const expiresIn = rememberMe ? '7d' : '5min';
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 1000;
    const token = jwt.sign(
      { id: user._id, email: user.personalInfo.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn },
    );

    res.cookie('token', token, { ...cookieOptions, maxAge });

    res.status(200).json({
      success: true,
      message: 'Password set successfully. You can now sign in with email or Google.',
      role: user.role,
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
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (user?.role === 'admin') {
      res.redirect(`${frontendBaseUrl}/admin-dashboard`);
    } else if (user?.role === 'client') {
      res.redirect(`${frontendBaseUrl}/patient-dashboard`);
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
    res.clearCookie('token', cookieOptions);
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
  getSetupPasswordEmail,
  sendPasswordSetupCode,
  verifyPasswordSetupCode,
  setupPasswordForGoogleUser,
  loginOrCreateUserWithGoogleOAuth,
  logoutUser,
};
