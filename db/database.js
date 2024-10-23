const mongoose = require('mongoose');

//   CONNECT DATABASE
const DB_LOCAL = process.env.DATABASE_URL;

const connectDb = mongoose
  .connect(DB_LOCAL)
  .then(() => console.log('Database Connected Succesfully !'))
  .catch((err) =>
    console.log('Database connection failed ! ', err.message || err),
  );

module.exports = connectDb;
