import { PlayCircleOutlined, UserAddOutlined, LogoutOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthLogin } from "../contexts/authLogin";
import { routerPath } from "../common/config";
const loginItem = {
    label: "Login",
    key: "login",
    icon: <LoginOutlined />,
};

const items = [
    {
        label: "Accounts Management",
        key: "account",
        icon: <UserAddOutlined />,
    },
    {
        label: "Audio Management",
        key: "audio",
        icon: <PlayCircleOutlined />,
    },
    {
        label: "Logout",
        key: "logout",
        icon: <LogoutOutlined />,
    },
];
const NavBar = () => {
    const { currentUser, isUserLoggedIn, handleUserLoggedOut } = useContext(AuthLogin);
    const location = useLocation();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(location.pathname.split("/").at(-1));
    // const isLoggedIn = !!sessionStorage.getItem("authToken");
    const loggedInUser = {
        label: currentUser ? <b>Logged in as {currentUser}</b> : "Please Log In",
        disabled: true,
        key: "",
        icon: <UserOutlined />,
    };

    useEffect(() => {
        setCurrent(location.pathname.split("/").at(-1));
    }, [location]);

    const onClick = (e) => {
        if (e.key === "logout") {
            handleUserLoggedOut();
            // sessionStorage.removeItem("authToken");
            navigate(routerPath.login);
            return;
        }
        setCurrent(e.key);
        navigate("/" + e.key);
    };
    return (
        <Menu
            disabled={!isUserLoggedIn()}
            onClick={onClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={isUserLoggedIn() ? [loggedInUser, ...items] : [loggedInUser, loginItem]}
        />
    );
};
export default NavBar;
