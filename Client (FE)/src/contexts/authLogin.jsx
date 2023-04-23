import React, { createContext, useState } from "react";
import { authenticateUserLogin } from "../backendServices/userService";
import { useEffect } from "react";
import { message } from "antd";
import { getCurrentUser } from "../backendServices/userService";

// @ts-ignore
export const AuthLogin = createContext();

const AuthLoginProvider = (props) => {
    const [currentUser, setCurrentUser] = useState(null);

    // on component mount, get currentUser from saved jwt token in localstorage
    useEffect(() => {
        getCurrentSessionUser();
    }, []);

    /* using jwt token stored in localstorage, send the token to backend server which extracts the username, userID from the 
  token payload and sends the username back to client. This function runs upon initial component mount to get username if previous login was
  still logged in and stored in local storage*/
    const getCurrentSessionUser = async () => {
        const response = await getCurrentUser();
        const { status } = response;

        if (status === 403) {
            // alert("Please Login again");
            localStorage.clear();
            setCurrentUser(null);
        } else {
            const currentUser = await response.json();
            setCurrentUser(currentUser.username);
        }
    };

    /* upon successful login, save the generated jwt token attached to this username,userID to sessionStorage auth key and set currentUser state 
    clear sessionStorage auth key and current user state upon failed login*/
    const authenicateUserLogin = async (username, password) => {
        // check database with login credential

        try {
            const loginStatus = await authenticateUserLogin({ username, password });

            if (!loginStatus.authenticateStatus) {
                message.error(loginStatus.message);
                setCurrentUser(null);
                return null;
            }
            message.success(loginStatus.message);
            sessionStorage.setItem("authToken", loginStatus.jwt);
            setCurrentUser(username);

            return loginStatus.authenticateStatus;
        } catch (e) {
            message.error("Error Connecting to Server. Unable to authenticate login.");
            return null;
        }
    };

    /* clear sessionStorage auth key which stores jwt token and set currentuser state to null upon logout, if action parameter is 
  logout = 'logout' --> logout trigger by clicking logout button. if action =''403'--> trigger by status 403 (session timeout) */
    const handleUserLoggedOut = (action) => {
        // no user already logged in, skip rest of function
        if (!sessionStorage.getItem("authToken")) return;

        // parameter action - action = 'logout' when logout button is clicked
        if (action === "403") {
            alert("Session timeout... Please Login Again");
        }
        sessionStorage.clear();
        setCurrentUser(null);
    };

    /* check in any user is logged in, if auth token is present in sessionStorage, user is logged in */
    const isUserLoggedIn = () => !!sessionStorage.getItem("authToken");

    return (
        <AuthLogin.Provider
            value={{
                currentUser,
                handleUserLoggedOut,
                authenicateUserLogin,
                isUserLoggedIn,
            }}
        >
            {props.children}
        </AuthLogin.Provider>
    );
};

export default AuthLoginProvider;
