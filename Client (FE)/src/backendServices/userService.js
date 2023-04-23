import { BackendEndpointURL, constructBeEndpoint } from "../common/config";

export const authenticateUserLogin = (options = {}) => {
    return new Promise((resolve, reject) => {
        const { username, password } = options;
        const reqOptions = {
            method: "POST",
            body: JSON.stringify({ username, password }),
            headers: {
                "Content-Type": "application/json",
            },
        };
        const { authenticateUserLogin } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(authenticateUserLogin);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log("authenticateUserLogin:::status", data);
                resolve(data);
            })
            .catch((e) => {
                reject(e);
            });
    });
};

export const getAllUsersList = (options = {}) => {
    return new Promise((resolve, reject) => {
        const reqOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + sessionStorage.getItem("authToken"),
            },
        };

        const { getAllUserList } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(getAllUserList);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log("authenticateUserLogin:::getAllUsersList", data);
                resolve(data);
            });
    });
};

export const addNewUser = (options = {}) => {
    return new Promise((resolve, reject) => {
        const { newUser } = options;
        const reqOptions = {
            method: "POST",
            body: JSON.stringify({ newUser }),
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + sessionStorage.getItem("authToken"),
            },
        };
        const { addNewUser } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(addNewUser);

        console.log("addNewUser:::endpoint", endpoint);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log("addNewUser:::addNewUser", data);
                resolve(data);
            });
    });
};

export const deleteUser = (options = {}) => {
    return new Promise((resolve, reject) => {
        const { userID } = options;
        const reqOptions = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + sessionStorage.getItem("authToken"),
            },
        };

        const { deleteUser } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(deleteUser, userID);

        console.log("deleteUser:::endpoint", endpoint);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((status) => {
                console.log("deleteUser:::status", status);
                resolve(status);
            });
    });
};

export const updateUsers = (options = {}) => {
    return new Promise((resolve, reject) => {
        const updatedUserDetails = options;
        const { userID } = updatedUserDetails;
        const reqOptions = {
            method: "PUT",
            body: JSON.stringify(updatedUserDetails),
            headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + sessionStorage.getItem("authToken"),
            },
        };

        const { updateUser } = BackendEndpointURL;
        const endpoint = constructBeEndpoint(updateUser, userID);

        console.log("updateUsers:::endpoint", endpoint);

        fetch(endpoint, reqOptions)
            .then((res) => res.json())
            .then((status) => {
                console.log("updateUsers:::status", status);
                resolve(status);
            });
    });
};

export const getCurrentUser = (options = {}) => {
    const reqOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + sessionStorage.getItem("authToken"),
        },
    };
    const { getCurrentUser } = BackendEndpointURL;
    const endpoint = constructBeEndpoint(getCurrentUser);
    return fetch(endpoint, reqOptions);
};
