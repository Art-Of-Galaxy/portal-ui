import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const token = localStorage.getItem("accessToken");
    return token
        ? React.createElement(Outlet)
        : React.createElement(Navigate, { to: "/login", replace: true });
};

export default ProtectedRoute;
