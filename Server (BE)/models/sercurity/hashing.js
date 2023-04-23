const bcrypt = require('bcryptjs');
require('dotenv').config();


module.exports.generateHashedPassword = (password) => {

    return new Promise((resolve, reject) => {

        const saltRounds = parseInt(process.env.HASH_SALT_COUNT);

        bcrypt.hash(password, saltRounds, (err, hash) => {

            if (err) {
                console.error(`Error while generating harsh for ${password}`)
                reject(err);
            }
            resolve(hash);
        })
    })
}

module.exports.compareHashedPWAndLoginPW = async (loginPassword, storedPassword) => {

    return bcrypt.compare(loginPassword, storedPassword);

}