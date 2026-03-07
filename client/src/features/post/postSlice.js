import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import postService from "./postService"

const initialState ={
    posts:[],
    isLoading:false,
    isError:false,
    isSuccess:false,
    message:""
}


export const createpost = createAsyncThunk(
    "post/create",
    async(userData,thunkAPI)=>{
        try {
            return await postService.createPost(userData)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.error)
        }
    }
)

export const getPosts = createAsyncThunk(
    "post/randomposts",
    async(_,thunkAPI)=>{
        try {
            return await postService.posts();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.error)
        }
    }
)

const postSlice = createSlice({
    name:"posts",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getPosts.pending,(state)=>{
        state.isLoading = true;
        })
        .addCase(getPosts.fulfilled,(state,action)=>{
         state.isLoading = false;
         state.isSuccess= true;
         state.posts = action.payload;
        })
        .addCase(getPosts.rejected,(state,action)=>{
            state.isLoading = false
          state.isError= true;
          state.message = action.payload;
        })

        //create posts
        .addCase(createpost.pending,(state)=>{
            state.isLoading = true;

        })
        .addCase(createpost.fulfilled,(state,action)=>{
            state.isLoading = false
            state.isSuccess = true
            state.posts.unshift(action.payload)
        })
        .addCase(createpost.rejected,(state,action)=>{
          state.isError= true;
          state.message = action.payload;
        })
    }


})

export default postSlice.reducer;