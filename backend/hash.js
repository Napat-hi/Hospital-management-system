// hash.js
const crypto = require("crypto");

const hashed = crypto.createHash("sha256").update("Staff1").digest("hex");
console.log("SHA-256 hash for Staff1:", hashed);
