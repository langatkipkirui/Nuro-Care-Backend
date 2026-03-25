const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const User = require('../models/user-model');
const crypto = require('crypto');
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email from Google'), null);
        }
        const email = profile.emails[0].value;
        let user = await User.findOne({ 'personalInfo.email': email });

        if (!user) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const hashedVerificationCode = crypto
            .createHash('sha256')
            .update(code)
            .digest('hex');
          const user = new User({
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
              passwordHash: null,
              rememberMe: true,
              emailVerified: false,
              phoneVerified: false,
              emailVerification: {
                codeHash: hashedVerificationCode,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
                attempts: 0,
              },
              provider: 'google',
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
          await user.save();
          return done(null, user);
        }
        done(null, user);
      } catch (err) {
        console.log(err, 'err in config');
        done(err, null);
      }
    },
  ),
);
