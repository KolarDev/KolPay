const express = require("express");
const bodyparser = require("body-parser");
const rateLimit = require("express-rate-limit");


const usersRouter = require("./routes/userRoute");
const transactionsRouter = require("./routes/transactionRoute");
const adminRouter = require("./routes/adminRoutes");

const app = express();

app.use(express.json());
app.use(bodyparser.json());

// Limiting requests from same api
app.use("/api", rateLimit({
    limit: 50,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, Try again in an hour!"
}));

// Root route for testing server
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hey there! from the sever side", app: "KolPay" });
});

// Route Handlers
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/admin", adminRouter);

// When user enters undefined route
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

module.exports = app;