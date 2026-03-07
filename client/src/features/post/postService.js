import API from "../../api/axios";


const posts = async ()=>{
    const posts = await API.get("/post/randomposts")
    console.log("api hited")
    console.log(posts.data)
    return posts.data.posts
}

const createPost = async (postData) =>{
    const response = await API.post("/post/create",postData)
    console.log("post created api hitted")
    return response.data.post
}

export default {posts,createPost};