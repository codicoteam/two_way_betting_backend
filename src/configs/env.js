const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  PAYNOW_INTEGRATION_ID: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  PAYNOW_INTEGRATION_KEY: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required() }),
  PAYNOW_RETURN_URL: Joi.string().uri().default('http://localhost:5000/payment/success'),
  PAYNOW_RESULT_URL: Joi.string().uri().default('http://localhost:5000/webhooks/paynow'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  SMTP_HOST: Joi.string(),
  SMTP_PORT: Joi.number(),
  SMTP_USER: Joi.string(),
  SMTP_PASS: Joi.string(),
  EMAIL_FROM: Joi.string().email().default('noreply@duelbet.com'),
}).unknown().required();

const { error, value: env } = envSchema.validate(process.env);
if (error) {
  console.error('❌ Invalid environment variables:', error.message);
  process.exit(1);
}

module.exports = env;