const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV = process.env.IV;

const encrypt = (text) => {
    const cypher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV);
    let encrypted = cypher.update(text, "utf-8", "hex");
    encrypted += cypher.final("hex");
    return encrypted;
}

const decrypt = (textEncrypted) => {
    const decypher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV);
    let decrypted = decypher.update(textEncrypted, "utf-8", "hex");
    decrypted += decypher.final("hex");
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}