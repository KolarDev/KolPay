const User = require("./../models/userModel");


module.exports = async (user, phone) => {
    const lastUser = await user.countDocuments();

    console.log(lastUser, "HI");

    const serialNumber = (lastUser + 1).toString().padStart(5, "0");

    const phoneNumber = phone.slice(1, 5);

    return `${serialNumber}${phoneNumber}`;
}

// const genAccN = () => {
//     const lastUser = 7

//     const serialNumber = (lastUser + 1).toString().padStart(5, "0");
//     const phone = "08112789308";
//     const phoneNumber = phone.slice(1, 5);

//     return `${serialNumber}${phoneNumber}`;
// }

// console.log(genAccN());