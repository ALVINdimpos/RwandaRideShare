const { config } = require('dotenv');
const cryptoJs = require('crypto-js');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

config();

const encryptionKey = process.env.ENCRYPTION_KEY;

// Encryption function
const encryptData = data => {
  const dataToEncrypt = JSON.stringify(data);
  const encryptedData = cryptoJs.AES.encrypt(
    dataToEncrypt,
    encryptionKey
  ).toString();
  return encryptedData;
};

// Decryption function
const decryptData = ciphertext => {
  const bytes = cryptoJs.AES.decrypt(ciphertext, encryptionKey);
  const decryptedData = bytes.toString(cryptoJs.enc.Utf8);
  const decryptedParsedData = JSON.parse(decryptedData);
  return decryptedParsedData;
};

// One-way hash function
const hashData = data => cryptoJs.SHA256(data).toString();

// Function to hash a password
const hashPassword = password => {
  const saltRounds = process.env.SALT_ROUNDS;
  return bcrypt.hashSync(password, Number(saltRounds));
};

// Function to compare passwords
const comparePassword = (providedPassword, storedHashedPassword) => {
  return bcrypt.compareSync(providedPassword, storedHashedPassword);
};

// isEmpty function
const isEmpty = arr => {
  return arr.length === 0;
};

// isArray function
const isArray = arr => {
  return Array.isArray(arr);
};

// Validate required fields
const validateFields = (req, requiredFields) => {
  const missingFields = requiredFields.filter(field => !req.body[field]);
  return missingFields;
};

// Validate email
const validateEmail = email => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

// Validate password
const validatePassword = password => {
  // Password must be at least 8 characters long and contain at least one capital letter and one digit
  const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordPattern.test(password);
};

// convert date and time
const formatDateTime = (dateTime, options = null) => {
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  return dateTime.toLocaleString('en-US', mergedOptions);
};

// Formating my string to be used for comparison
const cleanAndFormatString = string => {
  const cleanedString = string.replace(/[^\w\s]/gi, '').toLowerCase();
  return cleanedString.replace(/\s+/g, '');
};

// Clean up upload files
const cleanUpFiles = (req, fieldName) => {
  if (req.files[fieldName]) {
    const filePath = req.files[fieldName][0].path;
    fs.unlinkSync(filePath);
  }
};

// Function to recursively create directories
const mkdirSync = dirPath => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

// Generate auto password
const generateUserPwd = () => {
  return Math.random().toString(36).substring(7);
};


// Function to generate a token
const generateToken = user => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// notifications
// Export functions within a single object
module.exports = {
  encryptData,
  decryptData,
  hashData,
  hashPassword,
  comparePassword,
  isEmpty,
  isArray,
  validateFields,
  validateEmail,
  validatePassword,
  formatDateTime,
  cleanAndFormatString,
  cleanUpFiles,
  generateUserPwd,
  generateToken,
  mkdirSync,
};
