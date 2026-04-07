const blogsModel = require("../models/blogs.model");
const postModel = require("../models/post.model");

async function feed (){
    try {
        const posts = await postModel.find().lean()
        const blogs = await blogsModel.find().lean()


        const normalizedPosts = posts.map(p=> ({
            id:p._id,
            type:"post",
            content:p.text,
            ceratedAt : p.ceratedAt
        }))
    } catch (error) {
        
    }
}