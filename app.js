require('dotenv').config();

const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const connectDB = require('./config/mongoDB');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const scrapeRouter = require('./routes/scrapeRoutes');

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/scrape', scrapeRouter);

/* -------------------- VERCEL CRON ENDPOINT -------------------- */
/**
 * This endpoint will be called by Vercel Cron
 * Example: once every day at 6 PM
 */
app.get('/api/send-daily-email', async (req, res) => {
  try {
    const { sendDailyJobEmail } = require('./utils/emailScheduler');
    await sendDailyJobEmail();

    res.status(200).json({
      success: true,
      message: 'Daily job email sent successfully'
    });
  } catch (error) {
    console.error('Cron email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending daily job email'
    });
  }
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res, next) => {
  next(createError(404, 'Route not found'));
});

/* -------------------- DB CONNECTION -------------------- */
connectDB();

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
