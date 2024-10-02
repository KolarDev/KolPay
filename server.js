const mongoose = require("mongoose");
const dotenv = require("dotenv");



dotenv.config({ path: "./config.env" });
const app = require("./app");

//   CONNECT DATABASE
const DB_LOCAL = process.env.DATABASE_URL;
mongoose.connect(DB_LOCAL)
    .then(() => console.log("Database Connected Successfully!"));

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});



// eslint-config-airbnb eslint-config-prettier eslint-plugin-import 