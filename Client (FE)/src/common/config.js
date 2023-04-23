console.log("process.env.REACT_APP_PROXY_API", process.env.REACT_APP_PROXY_API);

export const Config = {
    BE_URL: process.env.REACT_APP_PROXY_API ?? "http://localhost:5555",
};

export const routerPath = {
    login: "/login",
    account: "/account",
    audio: "/audio",
};

export const BackendEndpointURL = {
    getUserAudioCollection: "audio/getUserAudioCollections",
    deleteAudioTrack: "audio/deleteAudio",
    updateUserAudioTrack: "audio/updateAudioCollections",
    initAudioUpload: "audio/upload/init",
    uploadAudioChunks: "audio/upload",
    authenticateUserLogin: "user/authenticateLogin",
    getAllUserList: "user/getAllUsers",
    addNewUser: "user/addUser",
    deleteUser: "user/deleteUser",
    updateUser: "user/updateUser",
    getCurrentUser: "user/getCurrentUsername",
};

export const constructBeEndpoint = (...params) => {
    return [Config.BE_URL, ...params].join("/");
};
