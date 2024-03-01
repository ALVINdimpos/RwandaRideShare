const jwt = require('jsonwebtoken');

const isResetTokenValid = (req, res, next) => {
  const { resetToken } = req.params;
  // verify token
  jwt.verify(resetToken, process.env.JWT_SECRET, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        systemError: err.message,
        message: 'You reset Link is invalid or has expired',
      });
    }
    // Attach the email and token to res.locals object
    res.locals.email = decodedToken.email;

    next();
  });
};

module.exports = isResetTokenValid;
