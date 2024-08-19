const express = require("express");
const bodyparser = require("body-parser");

const usersRouter = require("./routes/userRoutes");


const app = express();

app.use(express.json());
app.use(bodyparser.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hey there! from the sever side", app: "KolPay" });
});

app.use("/api/v1/users", usersRouter);

module.exports = app;