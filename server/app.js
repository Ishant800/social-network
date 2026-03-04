const { configDotenv } = require('dotenv');
const express = require('express');
const cors = require('cors');

const connectDb = require('./config/db.config');
const authRoute = require('./routes/auth.routes');
const postRoute = require('./routes/post.routes');
const userRoute = require('./routes/user.routes');
const commentRoute = require('./routes/comment.routes');

const app = express();

configDotenv();

app.use(express.json());
app.use(cors('*'));

app.use('/auth', authRoute);
app.use('/post', postRoute);
app.use('/profile', userRoute);
app.use('/comment', commentRoute);

connectDb().then(() => {
  const PORT_NO = process.env.PORT;
  app.listen(PORT_NO, () => {
    console.log(`server running successfully on port: ${PORT_NO}`);
  });
});