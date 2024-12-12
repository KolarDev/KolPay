const mongoose = require('mongoose');

//   CONNECT DATABASE
const DB_LOCAL = process.env.DATABASE_LOCAL;
const DB_URL = process.env.MONGO_URI;
// const DB_URL = process.env.MONGO_URI.replace(
//   "<db_password>",
//   process.env.MONGO_URI_PASSWORD
// );
const DB = process.env.NODE_ENV === 'development' ? DB_LOCAL : DB_URL;
const connectDb = mongoose
  .connect(DB)
  .then(() => console.log('Database Connected Succesfully !'))
  .catch((err) =>
    console.log('Database connection failed ! ', err.message || err),
  );

module.exports = connectDb;
