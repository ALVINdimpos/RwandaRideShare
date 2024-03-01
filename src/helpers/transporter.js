// transporter.js
const nodemailer = require('nodemailer');
const { config } = require('dotenv');
config();

const { EMAIL, PASSWORD } = process.env;

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

module.exports = transporter;
