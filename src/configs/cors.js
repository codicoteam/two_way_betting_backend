const env = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from frontend and mobile apps
    const allowedOrigins = [env.FRONTEND_URL];
    if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;