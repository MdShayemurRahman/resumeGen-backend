// config/email.config.js
import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey', // This is literally 'apikey' for SendGrid
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Gmail configuration for development
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, // This should be your Gmail app password
      },
    });
  }
};

export const emailConfig = {
  from:
    process.env.NODE_ENV === 'production'
      ? 'your-verified-sender@yourdomain.com' // SendGrid verified sender
      : process.env.EMAIL_USERNAME, // Your Gmail address
};

export const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log(`Email service configured for ${process.env.NODE_ENV}`);
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

export const transporter = createTransporter();
