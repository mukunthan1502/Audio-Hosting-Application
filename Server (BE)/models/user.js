const { generateHashedPassword, compareHashedPWAndLoginPW } = require("./sercurity/hashing");
const { encrypt, decrypt } = require("./sercurity/enDecryption");
const authenticationToken = require("./sercurity/verifyToken");
const { dbo } = require("./db");

module.exports.userModel = {
    authenticateUserLogin: ({ username: loginUsername, password: loginPassword }) => {
        return new Promise(async (resolve, reject) => {
            try {
                const loginStatus = { authenticateStatus: false, message: "Login Authentication Failed" };

                const db = await dbo.connectToServer("audio-host");
                const userObj = await db.collection("users").findOne({
                    username: loginUsername,
                });

                console.log("authenticateUserLogin::loginUsername", loginUsername);
                console.log("authenticateUserLogin::userObj", userObj);

                if (!userObj) {
                    loginStatus.message = `Username ${loginUsername} does not exist`;
                    loginStatus.authenticateStatus = false;
                    resolve(loginStatus);
                    return;
                }
                const { username, password } = userObj;
                const passwordAuthenticated = loginPassword === password;

                if (passwordAuthenticated) {
                    loginStatus.message = "Successful Login";
                    loginStatus.authenticateStatus = true;
                    resolve({ ...loginStatus, ...authenticationToken.generateAccessToken(userObj) });
                } else {
                    // unsuccessfully authentication (password)
                    loginStatus.message = `Password is not correct`;
                    loginStatus.authenticateStatus = false;
                    resolve(loginStatus);
                }
            } catch (err) {
                console.error(
                    `Error Authenticating username: ${loginUsername} & Password: ${loginPassword}  from  Database`,
                    err.stack
                );
                reject(err);
            }
        });
    },

    getAllUserList: async () => {
        try {
            const db = await dbo.connectToServer("audio-host");
            return await db
                .collection("users")
                .find({}, { projection: { _id: 0 } })
                .toArray();
        } catch (err) {
            return [];
        }
    },

    checkUserRole: async (userID) => {
        try {
            const db = await dbo.connectToServer("audio-host");
            const user = await db.collection("users").findOne({ userID }, { projection: { _id: 0 } });
            return user?.role;
        } catch (error) {}
    },

    async getNumberOfAdminUsers() {
        let numAdmins = 0;
        try {
            numAdmins = (await this.getAllUserList()).reduce((sum, cur) => (cur.role === "admin" ? sum + 1 : sum), 0);
        } catch (error) {
            console.error(error);
        } finally {
            return numAdmins;
        }
    },

    /* check database has at least one admin user after delete user operation */
    async checkRemaingAdminBeforeDeleting(userID) {
        const deletingRole = await this.checkUserRole(userID);
        if (deletingRole === "user") return true;
        const numOfAdmins = await this.getNumberOfAdminUsers();
        return numOfAdmins >= 2;
    },

    /* ==================================  MIDDLEWARE ============================================ */
    /* check if username  already exist, return error status if username already exist, move
    to next middleware if the username does not exist (not used before) */
    checkUsernameAlrExist: async (req, res, next) => {
        // empty form (not data)
        if (!req.body.newUser && req.body.updatedUserDetails) {
            res.status(412).send({ status: "fail", statusMsg: `No FormData Received` }).end();
            return;
        }

        console.log("checkUsernameAlrExist::req.body", req.body);

        const { user } = req.body;
        const username = user.username;
        let usernameAlrExist = true;
        try {
            const db = await dbo.connectToServer("audio-host");
            const user = await db.collection("users").findOne({ username }, { projection: { _id: 0 } });
            usernameAlrExist = !(user === null);
        } catch (err) {}

        console.log("checkUsernameAlrExist::usernameAlrExist", usernameAlrExist);

        usernameAlrExist
            ? res
                  .status(409)
                  .send({ status: "fail", statusMsg: `${username} username is already taken. Try another username` })
                  .end()
            : next();
    },
};
