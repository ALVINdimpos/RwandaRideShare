// controllers/messageController.js
const { Message, User } = require('../models');
const { validateFields } = require('../utils');
const logger = require('../../loggerConfigs');

// POST endpoint to send a message
const sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const { userId } = req;

  try {
    const requiredFields = ['receiverId', 'message'];
    const missingFields = validateFields(req, requiredFields);

    if (missingFields.length > 0) {
      return res.status(400).json({
        ok: false,
        message: 'Missing required fields',
        missingFields,
      });
    }

    const receiverUser = await User.findByPk(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        ok: false,
        message: 'Receiver user not found.',
      });
    }

    const sentMessage = await Message.create({
      receiverId,
      message,
      userId,
    });

    // Emit the message only to the intended recipient
    const recipientSocket = req.app.io.sockets.connected[receiverUser.socketId];
    if (recipientSocket) {
      recipientSocket.emit('newMessage', sentMessage);
    }

    return res.status(201).json({
      ok: true,
      message: 'Message sent successfully',
      data: sentMessage,
    });
  } catch (error) {
    logger.error(`Sending a message: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while sending the message.',
    });
  }
};

// API endpoint to retrieve messages
const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    return res.status(200).json({
      ok: true,
      data: messages,
    });
  } catch (error) {
    logger.error(`Retrieving messages: ${error.message}`);
    return res.status(500).json({
      ok: false,
      message: 'An error occurred while retrieving messages.',
    });
  }
};

module.exports = { sendMessage, getMessages };