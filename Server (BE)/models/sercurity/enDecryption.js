const crypto = require("crypto");
require('dotenv').config();

const algorithm = process.env.ENCRYPT_ALGORITHM;
const secretKey = process.env.ENCRYPT_SECRETKEY;
const iv = crypto.randomBytes(16);

module.exports.encrypt = (dataToBeEncrypted) => {

    const ciper = crypto.createCipheriv(algorithm, secretKey, iv);
    let encryptedData = ciper.update(dataToBeEncrypted, "utf-8", "hex");
    encryptedData += ciper.final("hex");

    return {
        iv: iv.toString('hex'),
        data: encryptedData
    };
}


module.exports.decrypt = (encryptedDataObj) => {

    const deciper = crypto.createCipheriv(algorithm, secretKey, Buffer.from(encryptedDataObj.iv, 'hex'));
    let decryptedData = deciper.update(encryptedDataObj.data, "hex", "utf-8");
    decryptedData += deciper.final("utf-8");

    return decryptedData;
}
