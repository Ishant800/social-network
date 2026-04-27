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
    "post/getcomments",
    async(postId,thunkAPI)=>{
        try {
            return await commentService.getComents(postId)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data.error)
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
            if (state.comments) {
                state.comments.unshift(action.payload);
            } else {
                state.comments = [action.payload];
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