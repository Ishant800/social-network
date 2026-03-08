import API from "../../api/axios"

const getComents = async(postId)=>{
const response = await API.get(`/comment/getComment/${postId}`)
return response.data.comments
}


const createComments = async ({postId,text})=>{
    const response = await API.post(`/comment/create/${postId}`,text)
    return  response.data
}

export default {getComents,createComments};