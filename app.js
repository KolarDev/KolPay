const express = require("express");
const bodyparser = require("body-parser");




const usersRouter = require("./routes/userRoute");
const transactionsRouter = require("./routes/transactionRoute");
const adminRouter = require("./routes/adminRoutes");

const app = express();

app.use(express.json());
app.use(bodyparser.json());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hey there! from the sever side", app: "KolPay" });
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/admin", adminRouter);


module.exports = app;