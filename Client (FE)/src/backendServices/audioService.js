import { ChunkUploader } from "./chunkUploader";
import { BackendEndpointURL, constructBeEndpoint } from "../common/config";

export const getUserAudioCollections = (options = {}) => {
    return new Promise((resolve, reject) => {
        const reqOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + sessionStorage.getItem("authToken"),
            },
        };
        const { getUserAudioCollection } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(getUserAudioCollection);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log("getUserAudioCollections:::data", data);
                resolve(data);
            });
    });
};

export const deleteAudioTrack = (options = {}) => {
    const { key } = options;
    const reqOptions = {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + sessionStorage.getItem("authToken"),
        },
    };
    const { deleteAudioTrack } = BackendEndpointURL;
    const endpoint = constructBeEndpoint(deleteAudioTrack, key);

    fetch(endpoint, reqOptions)
        .then((res) => res.json())
        .then((status) => {
            console.log("deleteAudioTrack:::status", status);
        });
};

// not in use
export const updateUserAudioCollections = (options) => {
    const { collection } = options;
    const reqOptions = {
        method: "POST",
        body: JSON.stringify({ collection }),
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + sessionStorage.getItem("authToken"),
        },
    };

    const { updateUserAudioTrack } = BackendEndpointURL;
    const endpoint = constructBeEndpoint(updateUserAudioTrack);

    fetch(endpoint, reqOptions)
        .then((res) => res.json())
        .then((data) => {
            console.log("updateUserAudioCollections:::data", data);
        });
};

export const handleFileUpload = (fileInput, info) => {
    // debugger;
    // ChunkUploader.prototype.uploader = uploadChunksOfBlob;
    const audioUploader = new ChunkUploader();
    audioUploader
        .options({
            chunkSize: 2 * 1024 * 1024,
            threadsQuantity: 2,
            info,
        })
        .send(fileInput.originFileObj)
        .end((error, data) => {
            if (error) {
                console.log("Error", error);
                return;
            }
        });
};
