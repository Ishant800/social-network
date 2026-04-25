import { Navigate } from "react-router-dom";

const protectedRoute =({children}) =>{
    const token = localStorage.getItem("token")
    if(!token){
        return <Navigate to="/login" replace />;

    }
    return children;
}