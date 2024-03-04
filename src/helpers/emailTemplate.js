// emailTemplate.js
const Mailgen = require('mailgen');

const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    name: 'RwandaRideShare',
    link: 'https://www.RwandaRideShare.com/',
    logo: 'https://www.RwandaRideShare.com/static/media/Darklogo.aae7f3d7c12b50a5eea9.png',
    // Style the header with blue background and padding
    copyright: 'Copyright © 2024 Rwanda Share Ride LTD.',
  },
});

const generateEmail = (type, data) => {
  let emailContent;

  switch (type) {
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
    case 'tripBooked':
      emailContent = {
        body: {
          name: data.driver,
          intro: `Great news! Your trip has been successfully booked by a passenger. 🎉 Thank you for offering your ride and contributing to our community of travelers.

Here are the details of the booked trip:
- Passenger: ${data.passenger}
- Pickup Point: ${data.origin}
- Destination: ${data.destination}
- Travel Date: ${data.travelDate}

Please ensure you and the passenger coordinate any additional details for a smooth trip experience. Safe travels!`,
          action: {
            instructions: 'To approve, please click here::',
            button: {
              color: '#007bff',
              text: 'Approve',
              link: 'https://www.RwandaRideShare.com/',
            },
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      };
      break;
    case 'approveBooking':
      emailContent = {
        body: {
          name: data.passenger,
          intro: `Good news! Your booking request has been successfully approved by the driver. 🚗✨ Thank you for choosing Rwanda Share Ride LTD for your ride.

Here are the details of the approved trip:
- Driver: ${data.driver}
- Pickup Point: ${data.origin}
- Destination: ${data.destination}
- Travel Date: ${data.travelDate}

Please ensure you and the driver coordinate any additional details for a smooth trip experience. Have a great journey!`,
          outro: `Your driver will pick you up at ${data.travelDate}}. Please be ready for a smooth journey. Safe travels!`,
          action: {
            instructions:
              'To get started with RwandaRideShare, please click here:',
            button: {
              color: '#007bff',
              text: '',
              link: 'https://www.RwandaRideShare.com/',
            },
          },
        },
      };
      break;
    case 'declineBooking':
      emailContent = {
        body: {
          name: data.fname,
          intro: `Your booking request for the trip with ${data.driverName} has been declined.`,
          outro: `We are sorry for the inconvenience. Please check other available trips.`,
        },
      };
    case 'tripRequest':
      emailContent = {
        body: {
          name: data.fname,
          intro: `You a new ride request from ${data.fname} :
      - Origin: ${data.origin}
      - Destination: ${data.destination}
      - Travel Date: ${data.travelDate}
      - Seats Required: ${data.seatsRequired}
      - Description: ${data.description}`,
          action: {
            instructions: 'To approve, please click here::',
            button: {
              color: '#007bff',
              text: 'Approve',
              link: 'https://www.RwandaRideShare.com/',
            },
          },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      };
      break;
    case 'tripApproved':
      emailContent = {
        body: {
          name: data.fname,
          intro: `Great news! Your requested ride on RwandaRideShare has been approved. 🚗✨ You can now proceed with the journey and enjoy a comfortable ride.

Here are the details:
- Departure: ${data.origin}
- Destination: ${data.destination}
- Date and Time: ${data.travelDate}

We hope you have a fantastic experience with RwandaRideShare. If you have any questions or need further assistance, feel free to reach out.`,
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
      break;
    case 'driverCreated':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            'Hello there! Thank you for creating a driver account with RwandaRideShare. Your account will be reviewed, and you will be notified once it is approved. Safe travels!',
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
      break;
    case 'passengerCreated':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            'Welcome to RwandaRideShare! You have successfully created a passenger account. Enjoy your journey with us!',
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
      break;
    case 'driverApproved':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            'Your driver account has been successfully approved! 🚗✨ You can now enjoy full access to our platform and start offering rides or find trips to join. Safe travels!',
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
      break;
    case 'CreatedReview':
      emailContent = {
        body: {
          name: data.name,
          intro: `You have a new review from ${data.reviewer}:
      - Rating: ${data.rating}
      - Comments: ${data.comment || 'No comments provided'}`,
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
      break;
    case 'SubscriptionActivated':
      emailContent = {
        body: {
          name: data.fname,
          intro:
            'Your subscription has been successfully activated! 🚗✨ You can now enjoy full access to our platform and start offering rides or find trips to join. Safe travels!',
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
      break;
    default:
      // Default template
      emailContent = {
        body: {
          name: fname,
          intro:
            'Welcome to RwandaRideShare! We’re very excited to have you on board.',
          action: {
            instructions: 'To approve, please click here:',
            button: {
              color: '#007bff',
              text: 'Approve',
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
