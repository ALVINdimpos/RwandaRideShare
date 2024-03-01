// sendEmail.js
const transporter = require('./transporter');
const { config } = require('dotenv');
const logger = require('../../loggerConfigs');

const generateEmail = require('./emailTemplate');
config();

const { EMAIL } = process.env;
const sendEmail = async (type, subject, data) => {
  try {
    const mailOptions = {
      from: EMAIL,
      to: data.email,
      subject,
      html: generateEmail(type, data),
    };

    await transporter.sendMail(mailOptions);

    let returnMessage;
    switch (type) {
      case 'SignUp':
        returnMessage = `A verification email has been sent to ${data.email}.`;
        break;
      case 'ResetPassword':
        returnMessage = `A password reset email has been sent to ${data.email}.`;
        break;
      case 'Subscription':
        returnMessage = `A subscription email has been sent to ${data.email}.`;
      default:
        returnMessage = `An email has been sent to ${data.email}.`;
    }
    logger.info(`Sent email to ${data.email} successfully.`);
    logger.info(`Message sent: ${returnMessage}`);
    return returnMessage;
  } catch (error) {
    logger.error(`Error sending email to ${data.email}.`);
    logger.error(`Error sending email : ${error.message}`);
    return error.message;
  }
};

module.exports = sendEmail;
