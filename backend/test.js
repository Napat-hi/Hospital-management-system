const crypto = require("crypto");
console.log(crypto.createHash("sha256").update("Staff1").digest("hex"));
