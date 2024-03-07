const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io'); // Add this line
const { sequelize } = require('./models');
const routes = require('./routes/allRoutes');
const logger = require('../loggerConfigs');
const checkSubscriptionEndDates = require('./cron/subscriptionCron');
const { authenticateUser } = require('./middleware/authenticateUser');
const { Message } = require('./models');
config();

const app = express();
const server = http.createServer(app); // Create an HTTP server

// Add this line to create a WebSocket server
const io = new socketIO.Server(server);
// use cors and body parse
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

checkSubscriptionEndDates.start();

// all routes
app.use(
  `${process.env.PRE_URL}/uploads/images`,
  express.static('./uploads/images')
);
app.use(
  `${process.env.PRE_URL}/uploads/documents`,
  express.static('./uploads/documents')
);

app.get('/', (req, res) => {
  res.status(200).send(`
    <h1 style="text-align: center; margin-top: 20vh">Welcome to Project APIs Page</h1>
  `);
});
app.use(`${process.env.PRE_URL}`, routes);

// not found routes
app.all('*', (req, res) => {
  res.status(200).json({
    message: 'This route is not found',
  });
});

// db connection instance
const dbCon = async () => {
  try {
    await sequelize.authenticate();
    logger.info('DB connected successfully');
  } catch (error) {
    logger.error(new Error(`db: ${error.message}`));
  }
};

// Add this block to handle WebSocket connections
io.use(async (socket, next) => {
  console.log('Middleware called');
  try {
    const token = socket.handshake.headers.token;
    // Implement your user authentication logic based on the token
    const userId = await authenticateUser(token);
    if (!userId) {
      return next(new Error('Authentication failed.'));
    }
    socket.userId = userId;
    next();
  } catch (error) {
    console.log(error, 'FULL ERROR');
    next(new Error('Authentication failed.'));
  }
});

const ConnectedUsers = [];
io.on('connection', socket => {
  console.log(`User ${socket.userId} connected`);
  ConnectedUsers.push({
    userId: socket.userId,
    socketId: socket.id,
  });
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
  socket.on('newMessage', async data => {
    try {
      await Message.create({
        senderId: Number(socket.userId),
        receiverId: Number(data.id),
        message: data.message,
      });
    } catch (error) {
      console.log('Cant Save message in db');
    }
    // Support Multiple Tab connection or devices
    ConnectedUsers.map(items => {
      if (items.userId == data.id) {
        io.to(items.socketId).emit('getMessage', data.message);
      }
    });
  });
});
// port and host
const port = process.env.PORT;

// server and db
server.listen(port, () => {
  logger.info(`Server listening on port : ${port}`);
  dbCon();
});
