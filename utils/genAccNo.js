const User = require("./../models/userModel");


exports.genAccNo = (phone) => {
    const lastUser = User.countDocuments();

    const serialNumber = (lastUser + 1).toString().padStart(5, "0");

    const phoneNumber = phone.slice(-5);

    return `${serialNumber}${phoneNumber}`;
}