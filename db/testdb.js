const mongoose = require('mongoose');

//   CONNECT DATABASE
const DB_LOCAL = process.env.DATABASE_URL_TEST;

// Connect to a test database
const connectDb = mongoose
  .connect(DB_LOCAL)
  .then(() => console.log('Database Connected Succesfully !'))
  .catch((err) =>
    console.log('Database connection failed ! ', err.message || err),
  );

// Close the test  database
const closeDb = () => {
  return mongoose.connect.close();
}

module.exports = {
  connectDb,
  closeDb,
};
