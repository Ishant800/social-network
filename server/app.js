const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const connectDb = require('./config/db.config');
const authRoute = require('./routes/auth.routes');
const postRoute = require('./routes/post.routes');
const blogRoute = require('./routes/blog.routes');
const userRoute = require('./routes/user.routes');
const commentRoute = require('./routes/comment.routes');
const likeRoute = require("./routes/like.routes");
const { Server } = require('socket.io');
     
const app = express();
app.use(express.json());
app.use(cors('*')); 

app.use('/auth', authRoute);
app.use('/post', postRoute);
app.use('/blog', blogRoute);
app.use('/user', userRoute);
app.use('/comment', commentRoute);
app.use("/likes",likeRoute)

  
    connectDb()


    const server = http.createServer(app)
    const io = new Server(server,{
     cors:{
          origin:"*",
          methods:["GET","POST"]
     } 
    
    })

   const socketHandler =  require("./socket/socketcontroller")
   socketHandler(io)
  const PORT_NO = process.env.PORT;
   server.listen(PORT_NO, () => {
    console.log(`server running successfully on port: ${PORT_NO}`);
  });

module.exports = {io,server}