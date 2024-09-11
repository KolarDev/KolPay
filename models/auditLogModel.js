const mongoose = require("mongoose");
const User = require("./../models/userModel");

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;