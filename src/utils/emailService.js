const nodemailer = require('nodemailer');
const env = require('../configs/env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email error: ${error.message}`);
    throw new Error('Failed to send email');
  }
};

const sendVerificationEmail = async (user, token) => {
  const url = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `<p>Click <a href="${url}">here</a> to verify your email.</p>`;
  return sendEmail({ to: user.email, subject: 'Verify your email', html });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `<p>Click <a href="${url}">here</a> to reset your password.</p>`;
  return sendEmail({ to: user.email, subject: 'Reset your password', html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};