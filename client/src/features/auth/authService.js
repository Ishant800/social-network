import axios from "axios"
import API from "../../api/axios";

const API_URL= "http://localhost:5000/auth/";

const signup = async(userData) =>{
    const response = await axios.post(API_URL + "signup",userData);
    return response.data;
}

const login = async (userData) =>{
    const response = await axios.post(API_URL + "login",userData)
    return response.data;
}

const logout = ()=>{
    localStorage.removeItem("token")
}


const getMe = async ()=>{
    const response = await API.get("/user/getMe")
    return response.data.getme
}

export default {signup,login,logout,getMe};