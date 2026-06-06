import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import commentService from "./commentService"

const initialState ={   
    comments: null,
    isLoading:false,
    isError:false,
    isSuccess:false,
    errormessage:""
}

export const comment = createAsyncThunk(
    "post/createComments",
    async(userData,thunkAPI)=>{
        try {
            return await commentService.createComments(userData)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.error)
        }
    }
)

export const getcomments = createAsyncThunk(
    "comments/getcomments",
    async ({ postId, targetType = 'Post' }, thunkAPI) => {
        try {
            return await commentService.getComments(postId, targetType);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || error.response?.data?.message || error.message,
            );
        }
    }
)

const commentSlice = createSlice({
    
    name:"comment",
    initialState,
    reducers:{
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.errormessage = "";
        }
    },
    extraReducers:(builder)=>{
        //create comments
        builder.addCase(comment.pending,(state)=>{
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(comment.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            const newComment = action.payload?.comment || action.payload;
            if (state.comments) {
                state.comments.unshift(newComment);
            } else {
                state.comments = [newComment];
            }
        })
        .addCase(comment.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.errormessage = action.payload;
        })

        //get comments
        .addCase(getcomments.pending,(state)=>{
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(getcomments.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.isSuccess = true;
            state.comments = action.payload;
        })
        .addCase(getcomments.rejected,(state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.errormessage = action.payload;
        })
    }

})

export default  commentSlice.reducer;