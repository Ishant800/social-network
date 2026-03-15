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
    reducers:{},
    extraReducers:(builder)=>{
        //create comments
        builder.addCase(comment.pending,(state)=>{
            state.isLoading=true
        })
        builder.addCase(comment.fulfilled,(state,action)=>{
            state.isLoading=false;
            state.isSuccess=true;
            state.comments.unshift(action.payload)
        })
        builder.addCase(comment.rejected,(state,error)=>{
            state.isError = true;
            state.errormessage= error.payload
        })

        //get comments
        builder.addCase(getcomments.pending,(state)=>{
            state.isLoading = true
        })
        builder.addCase(comment.fulfilled,(state,action)=>{
            state.isLoading = false;
            state.comments = action.payload;
        })

        builder.addCase(getcomments.rejected,(state,error)=>{
            state.isError=true;
            state.errormessage= error.payload
        })
    }

})

export default  commentSlice.reducer;