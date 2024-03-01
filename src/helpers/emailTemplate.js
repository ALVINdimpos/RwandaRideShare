// emailTemplate.js
const Mailgen = require('mailgen');

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'RwandaRideShare',
    link: 'https://www.RwandaRideShare.com/',
    logo: 'https://www.RwandaRideShare.com/static/media/Darklogo.aae7f3d7c12b50a5eea9.png',
    // Style the header with blue background and padding
    copyright: 'Copyright © 2023 M&E consulting Group LTD.',
  },
});

const generateEmail = (type, data) => {
  let emailContent;

  switch (type) {
    case 'SignUp':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            '<p style="font-size: 18px; color: #333; margin-bottom: 20px;">Thank you for signing up. Click the link below to set up your RwandaRideShare profile password.</p>',
          action: {
            button: {
              style:
                'display: inline-block; padding: 10px 20px; font-size: 16px; color: #ffffff; text-decoration: none; background-color: #00cc00; border: 2px solid #00cc00; border-radius: 5px;',
              text: 'Setup a Password',
              link: `https://www.RwandaRideShare.com/auth/verify/${data.token}`,
            },
          },
          outro:
            '<p style="font-size: 16px; color: #777; margin-top: 20px;">This link will expire in 24 hours from the time you received this email. If you did not set your password in time, please contact <a href="mailto:support@RwandaRideShare.com" style="color: #007bff; text-decoration: none;">support@RwandaRideShare.com</a> for support.</p>',
        },
      };

      break;
    //case Reset password
    case 'ResetPassword':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            'You are receiving this email because you requested a password reset for your RwandaRideShare account.',
          action: {
            instructions: 'Click the button below to reset your password:',
            button: {
              color: '#007bff',
              text: 'Reset your password',
              link: `https://www.RwandaRideShare.com/auth/reset-password/${data.token}`,
            },
          },
          outro:
            'This password reset link will expire in 24 hours. If you did not request a password reset, no further action is required.<br><br>RwandaRideShare<br>Team.',
        },
      };
      break;
    //case ⁠ ⁠Subscription to news letters
    case 'Subscription':
      emailContent = {
        body: {
          name: data.fname,
          intro: 'Thank you for subscribing to our news letters.',
          outro:
            'You will be receiving different updates from us. For more information on RwandaRideShare please visit our <a href="https://www.RwandaRideShare.com/">website</a>',
        },
      };
      break;
    //case ⁠ ⁠Contact us
    case 'ContactUs':
      emailContent = {
        body: {
          name: data.fname,
          intro: 'Thanks for reaching out to us',
          outro: `In case you don't hear from us soon, please contact us on <strong>
                ${data.phone}</strong>. For more information on RwandaRideShare please visit our <a href="https://www.RwandaRideShare.com/">website</a>`,
        },
      };
    default:
      // Default template
      emailContent = {
        body: {
          name: data.name,
          intro:
            'Welcome to RwandaRideShare! We’re very excited to have you on board.',
          action: {
            instructions:
              'To get started with RwandaRideShare, please click here:',
            button: {
              color: '#007bff',
              text: 'Confirm your account',
              link: 'https://www.RwandaRideShare.com/',
            },
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      };
  }
  return mailGenerator.generate(emailContent);
};

module.exports = generateEmail;
