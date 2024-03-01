const express = require('express');
const cors = require('cors');
const { config } = require('dotenv');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');
const routes = require('./routes/allRoutes');
const logger = require('../loggerConfigs');

config();

const app = express();

// use cors and body parse
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// port and host
const port = process.env.PORT;

// server and db
app.listen(port, () => {
  logger.info(`Server listening on port : ${port}`);
  dbCon();
});
