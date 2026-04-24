import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import postReducer from "../features/post/postSlice"
import userReducer from "../features/users/userSlice"
import bookmarkReducer from "../features/bookmarks/bookmarkSlice"
import notificationReducer from "../features/notifications/notificationSlice"
import commentReducer from "../features/comment/commentSlice"
import messageReducer from "../features/messages/messageSlice"

export const store = configureStore({
    reducer:{
        auth: authReducer,
        posts: postReducer,
        users: userReducer,
        bookmarks: bookmarkReducer,
        notifications: notificationReducer,
        comments: commentReducer,
        messages: messageReducer
    }
})
