const express = require("express");
const app = express();
var cors = require("cors");
const { loadingByChunks, initUploading } = require("../models/audio/uploadFile");
const { dbo } = require("../models/db");
var bodyParser = require("body-parser");
const { userModel } = require("../models/user");
const authenticationToken = require("../models/sercurity/verifyToken");
const urlEndpints = require("../enpointURL.json");
const {
    getUserAudioCollection,
    deleteAudioTrack,
    updateUserAudioTrack,
    initAudioUpload,
    uploadAudioChunks,
    authenticateUserLogin,
    getAllUserList,
    addNewUser,
    deleteUser,
    updateUser,
    getCurrentUser,
    signUpNewUser,
} = urlEndpints;
// handle JWT token creation
const { verifyToken, validateAdminUserRole } = authenticationToken;

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// +++++++++++++ AUDIO RELATED SERVICES +++++++++++++++++++++
// retrieve user playlist
app.post(`/${getUserAudioCollection}`, verifyToken, (req, res) => {
    const username = res.locals.username;
    const userID = res.locals.userID;
    console.log(getUserAudioCollection, { username, userID });
    (async () => {
        let collection = [];
        try {
            const db = await dbo.connectToServer("audio-host");
            collection = await db
                .collection("audiofiles")
                .find({ userID }, { projection: { _id: 0 } })
                .toArray();
            res.send({ collection }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ collection }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

// delete audio from storage
app.delete(`/${deleteAudioTrack}/:audioKey`, verifyToken, (req, res) => {
    const { audioKey } = req.params;
    const username = res.locals.username;
    const userID = res.locals.userID;
    console.log(deleteAudioTrack, { username, userID, audioKey });
    (async () => {
        try {
            const db = await dbo.connectToServer("audio-host");
            await db.collection("audiofiles").deleteOne({
                userID,
                key: audioKey,
            });
            res.send({ status: "success" }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ status: "fail" }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

// initalise uploading of audio chunts
app.post(`/${initAudioUpload}`, initUploading);

// uoloading of chucks/slices of files
app.post(`/${uploadAudioChunks}`, verifyToken, (req, res) => {
    const username = res.locals.username;
    const userID = res.locals.userID;
    console.log(uploadAudioChunks, { username, userID });
    loadingByChunks(req, res, { username, userID });
});

// ++++++++++++++++++++++++END OF AUDIO RELATED SERVICES +++++++++++++++++++++++++++++++

// +++++++++++++ USER & ACCOUNT RELATED SERVICES  +++++++++++++++++++++

/* input - username and password,
action - if username and pasword matches a record in database, generate JWT token with userid,username and access-rights as payload,
 return obj with login status, login message and JWT token */
app.post(`/${authenticateUserLogin}`, (req, res) => {
    const credential = req.body;
    console.log(authenticateUserLogin, { credential });
    (async () => {
        try {
            const loginAuthenticationStatusObj = await userModel.authenticateUserLogin(credential);
            console.log(authenticateUserLogin, loginAuthenticationStatusObj);
            res.status(200).send(loginAuthenticationStatusObj).end();
        } catch (err) {
            console.error(`Error Authentication ${credential.username} Login,`, err);
            res.status(500)
                .send(`Retrieving ${credential.username} Account Password Information from SQL Database`)
                .end();
            throw err;
        } finally {
            dbo.closeConnection();
        }
    })();
});

app.get(`/${getAllUserList}`, verifyToken, (req, res) => {
    console.log(getAllUserList);
    (async () => {
        let usersList = [];
        try {
            usersList = await userModel.getAllUserList();
            res.send({ usersList }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ usersList }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

app.post(`/${addNewUser}`, verifyToken, validateAdminUserRole, userModel.checkUsernameAlrExist, (req, res) => {
    const { user } = req.body;
    console.log(addNewUser, { user });
    (async () => {
        try {
            const db = await dbo.connectToServer("audio-host");
            await db.collection("users").insertOne(user);
            res.send({ status: "success" }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ status: "fail" }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

app.post(`/${signUpNewUser}`, userModel.checkUsernameAlrExist, (req, res) => {
    const { user } = req.body;
    console.log(signUpNewUser, { user });
    (async () => {
        try {
            const db = await dbo.connectToServer("audio-host");
            await db.collection("users").insertOne(user);
            res.send({ status: "success" }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ status: "fail" }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

app.delete(`/${deleteUser}/:userID`, verifyToken, validateAdminUserRole, (req, res) => {
    const { userID } = req.params;
    console.log(deleteUser, { userID });
    (async () => {
        const proceedWithDeletion = await userModel.checkRemaingAdminBeforeDeleting(userID);
        if (!proceedWithDeletion) {
            res.send({
                status: "fail",
                statusMsg: "At Least One Admin User is needed. Unable to delete",
            }).status(200);
            return;
        }

        try {
            const db = await dbo.connectToServer("audio-host");
            await db.collection("users").deleteOne({
                userID,
            });
            res.send({ status: "success", statusMsg: `Deleted UserId: ${userID}` }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ status: "fail", statusMsg: `Error Deleting UserID:${userID}` }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

app.put(`/${updateUser}/:userID`, verifyToken, validateAdminUserRole, (req, res) => {
    const { userID } = req.params;
    const { user } = req.body;
    console.log(updateUser, { userID, user });
    (async () => {
        try {
            const db = await dbo.connectToServer("audio-host");
            await db.collection("users").findOneAndUpdate({ userID }, { $set: user }, { upsert: true });
            res.send({ status: "success" }).status(200);
        } catch (error) {
            console.error(error);
            res.send({ status: "fail" }).status(500);
        } finally {
            dbo.closeConnection();
        }
    })();
});

/* input - header JWT token
action - using the jwt token stored in client local storage, 
return the username the token belongs to to client to be stored in context state username */
app.get(`/${getCurrentUser}`, verifyToken, (req, res) => {
    const username = res.locals.username;
    console.log(updateUser, { username });

    res.status(200).send({ username }).end();
});

module.exports = app;
