const { format, createLogger, transports } = require('winston');
const { timestamp, combine, printf, errors, colorize } = format;

// Constants for format options
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const buildDevLogger = () => {
  const logFormat = printf(({ level, message, stack, timestamp }) => {
    return `${timestamp} ${level}: ${stack || message}`;
  });

  return createLogger({
    format: combine(
      timestamp({ format: TIMESTAMP_FORMAT }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/dev.log' }),
    ],
  });
};

module.exports = buildDevLogger;
