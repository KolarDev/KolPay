const express = require('express');
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
// Security
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
// Logging
const morgan = require('morgan');
const logger = require('./logger');
// Error Handling
const AppError = require('./utils/appError');
const globalErrHandler = require('./controllers/errorController');
// Routes
const adminRouter = require('./routes/adminRoutes');
const usersRouter = require('./routes/userRoute');
const transactionsRouter = require('./routes/transactionRoute');

const app = express();

// app.use(express.json());
// app.use(bodyparser.json());
// app.use(cookieParser);

const morganFormat = ':method :url :status :response-time ms';

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  }),
);

// // Develeopment logging
// if ((process.env.NODE_ENV = 'development')) {
//   app.use(morgan('dev'));
// }

// Set Security HTTP Headers
app.use(helmet());

// Limiting requests from same api
app.use(
  '/api',
  rateLimit({
    limit: 50,
    windowMs: 60 * 60 * 1000,
    message: 'IP requets exceed limit, Check back in an hour!',
  }),
);

// Middleware against NoSQL injection attacks
app.use(mongoSanitize());
// Middleware against cross-site (xss) attacks
app.use(xss());
// Prevent Parameter pollution
app.use(
  hpp({
    whitelist: [],
  }),
);

// Body parser for req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(bodyparser.json());
app.use(cookieParser());

// Root route for testing server
app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hey there! from the sever side', app: 'KolPay' });
});

// Route Handlers
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/transactions', transactionsRouter);

// When user enters undefined route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrHandler);

module.exports = app;
