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
            return thunkAPI.rejectWithValue(error.response.data.error)
        }
    }
)

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, thunkAPI) => {
    try {
      return await authService.signup(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
        logout:(state) =>{
            state.token = null
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
            state.token = action.payload.token;
            localStorage.setItem("token",action.payload.token)
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
            state.token = action.payload.token;
            localStorage.setItem("token", action.payload.token);
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

// export const {logout} = authSlice.actions
export default authSlice.reducer;
