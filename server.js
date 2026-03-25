require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/users-routes');
const appointmentRoutes = require('./routes/appointments-routes');
const adminRoutes = require('./routes/admin-routes');
const publicRoutes = require('./routes/public-routes');
require('./config/passport');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const corsOptions = {
  origin: 'http://localhost:5000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Version'],
  exposedHeaders: ['X-Total-Count', 'Content-Range'],
  credentials: true,
  maxAge: 600,
};
app.use(cors(corsOptions));

// connect to db
connectToDb();

app.use('/auth', userRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on PORT ${process.env.PORT}`),
);
