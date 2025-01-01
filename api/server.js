const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('../src/app');

require('../db/database');

const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// eslint-config-airbnb eslint-config-prettier eslint-plugin-import
