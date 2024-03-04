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
      case 'ContactUs':
        returnMessage = `An email has been sent to ${data.email}.`;
        break;
      case 'TripRequest':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'tripApproved':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'driverCreated':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'driverApproved':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'passengerCreated':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'declineBooking':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'tripBooked':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'approveBooking':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'CreatedReview':
        returnMessage = `A trip request email has been sent to ${data.email}.`;
        break;
      case 'SubscriptionActivated':
        returnMessage = `subscription has been successfully activated! to ${data.email} `;
        break;
        break;
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
