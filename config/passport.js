const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const User = require('../models/user-model');
// Must match a URL the browser hits (Vercel /api proxy in prod) so Set-Cookie
// lands on the frontend domain. Direct Render callbacks set cookies on onrender.com.
const googleCallbackUrl =
  process.env.GOOGLE_CALLBACK_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://nuro-care.vercel.app/api/auth/google/callback'
    : 'http://localhost:5173/api/auth/google/callback');

passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails.length) {
          return done(new Error('No email from Google'), null);
        }
        const email = profile.emails[0].value;
        let user = await User.findOne({ 'personalInfo.email': email });

        if (!user) {
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
              emailVerified: true,
              phoneVerified: false,
              emailVerification: {
                codeHash: null,
                expiresAt: null,
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
