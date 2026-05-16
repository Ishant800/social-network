import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const initialState ={
    token: localStorage.getItem("token"),
    user:null,
    profilePosts:[],
    isLoading:false,
    isError:false,
    isSuccess:false,
    message:""
}


export const login = createAsyncThunk(
    "auth/login",
    async(userData,thunkAPI)=>{
        try {
            return await authService.login(userData)
        } catch (error) {
            if (
                !error.response &&
                (error.code === "ERR_NETWORK" ||
                    String(error.message || "").toLowerCase().includes("network"))
            ) {
                return thunkAPI.rejectWithValue(
                    "Cannot reach the server. Run the API on port 5000 and restart Vite (npm run dev), or set VITE_API_URL in client/.env."
                );
            }
            const data = error.response?.data;
            const msg =
                (typeof data?.error === "string" && data.error) ||
                (typeof data?.message === "string" && data.message) ||
                error.message ||
                "Login failed";
            return thunkAPI.rejectWithValue(msg);
        }
    }
)

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, thunkAPI) => {
    try {
      return await authService.signup(userData);
    } catch (error) {
      if (
        !error.response &&
        (error.code === "ERR_NETWORK" ||
          String(error.message || "").toLowerCase().includes("network"))
      ) {
        return thunkAPI.rejectWithValue(
          "Cannot reach the server. Run the API on port 5000 and restart Vite (npm run dev), or set VITE_API_URL in client/.env."
        );
      }
      const data = error.response?.data;
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        error.message ||
        "Signup failed";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);


export const getMe = createAsyncThunk(
    "user/getMe",
    async (_,thunkAPI)=>{
        try {
            return await authService.getMe();
        } catch (error) {
            const message = error.response?.data?.error ||
            error.message || "Something went wrong";

            return thunkAPI.rejectWithValue(message);
        }
    }
)


const authSlice = createSlice({
 name:"auth",
    initialState,
    reducers:{
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.profilePosts = [];
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        },
        setUser:(state, action) => {
            state.user = action.payload;
        },
        reset:(state)=>{
           state.isLoading = false
           state.isError = false;
    state.isSuccess = false;
    state.message = "";
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(login.pending,(state) =>{
            state.isLoading = true;
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            const access = action.payload.token ;
            state.token = access;
            if (access) localStorage.setItem("token", access);
            
        })
        .addCase(login.rejected,(state,action) =>{
            state.isLoading = false;
            state.isError = true
            state.message = action.payload
        })

        // for signup
        .addCase(signup.pending,(state)=>{
            state.isLoading = true;
            
        })
        .addCase(signup.fulfilled,(state,action)=>{
          state.isLoading = false;
          state.isSuccess = true;
            const access = action.payload.token;
            state.token = access;
            if (access) localStorage.setItem("token", access);
            
        })

        .addCase(signup.rejected,(state,action)=>{
             state.isLoading = false;
            state.isError = true;
            state.message = action.payload
        })

        // for user details
        .addCase(getMe.pending,(state)=>{
            state.isLoading = true;

        })
        .addCase(getMe.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.user = action.payload.getme;
            state.profilePosts = action.payload.post || [];

        })
        .addCase(getMe.rejected,(state)=>{
            state.isLoading = false;
            state.user = null;
            state.profilePosts = [];
        })
    }
})

export const { logout, reset, setUser } = authSlice.actions;
export default authSlice.reducer;
