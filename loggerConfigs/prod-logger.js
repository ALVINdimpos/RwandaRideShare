const { format, createLogger, transports } = require('winston');
const { timestamp, combine, errors, json } = format;

// Constants for format options
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const buildProdLogger = () => {
  return createLogger({
    format: combine(
      timestamp({ format: TIMESTAMP_FORMAT }),
      errors({ stack: true }),
      json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/prod.log' }),
    ],
  });
};

module.exports = buildProdLogger;
