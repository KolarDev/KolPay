const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, "Please input your name"],
        maxLength: [40, "Name can not be more than 40 characters"],
        minLength: [6, "Name can not be less than 6 characters"]
    },
    username: {
        type: String,
        required: [true, "Please input your name"],
        unique: [true, "Username is not available! try another one"],
        maxLength: [40, "Name must not be more than 40 characters"],
        minLength: [6, "Name must not be less than 6 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        unique: [true, "Email already exists!"],
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid Email"]
    },
    phone: {
        type: Number,
        required: true,
        unique: [true, "Phone number already exists!"]
    },
    accountNumber: {
        type: String,
        unique: true,
        required: true
    },
    balance: {
        type: Number,
        default: 0.00
    },
    role: {
        type: String,
        enum: ["user", "admin", "director"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide your password"],
        minLength: 8,
        select: false
    }, 
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Passwords are not the same!!"
        }
    },
    secretBase32: String,
    nationality: {
        type: String,
        enum: ["Nigeria", "Ghana", "Togo"]
    },
    dob: {
        type: Date
    },
    address: {
        type: String,
        minLength: [8, "Address can not be less than 6 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    isBlocked: {
        type: Boolean,
        default: false,
        select: false
    }
    
},
    {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
    }
);

// Reveal only active users
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// Hash password before save
userSchema.pre("save", async function (next) {
    // Skip this midddleware if password is not modified
    if (!this.isModified("password")) return next();
    // Hash password
    this.password = await bcrypt.hash(this.password, 12);
    // Clear passwordConfirm field
    this.passwordConfirm === undefined;
    // If road clear, move on....
    next();
});

// update passwordChangedAt field if password is changed
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// function to check if the user provided the actual password
userSchema.methods.checkPassword = async function (actualPassword, providedpassword) {
    return await bcrypt.compare(actualPassword, providedpassword)
}

// Generate password reset token
userSchema.methods.genPasswordResetToken = (req, res, next) => {

    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // console.log({ resetToken }, this.passwordResetToken);
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

userSchema.methods.changedPasswordafter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        // Parsing the time the user changed the password into integer
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // This will return true if the user actually changed the password after the token has been issued
        return JWTTimestamp < changedTimeStamp;
    }
}

const User = mongoose.model("User", userSchema);

module.exports = User;