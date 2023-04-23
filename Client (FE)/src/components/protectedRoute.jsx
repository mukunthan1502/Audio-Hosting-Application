import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    // const user = useSelector((state) => state.user);
    let location = useLocation();

    if (!sessionStorage.getItem("authToken")) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedRoute;
