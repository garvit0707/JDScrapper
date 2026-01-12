require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var connectDB = require('./config/mongoDB');
const cron = require('node-cron');
const { sendDailyJobEmail } = require('./utils/emailScheduler');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var scrapeRouter = require('./routes/scrapeRoutes')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/scrape", scrapeRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

connectDB();

// Schedule daily job email at 8:00 PM
// cron.schedule('0 20 * * *', () => {
//   console.log('Running scheduled daily job email at 8:00 PM');
//   sendDailyJobEmail();
// });
cron.schedule('0 20 * * *', async () => {
  console.log('⏰ Running scheduled daily job email at 8:00 PM');

  try {
    await sendDailyJobEmail();
    console.log('📧 Daily job email sent successfully');
  } catch (err) {
    console.error('❌ Daily job email failed:', err.message);
  }
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;
