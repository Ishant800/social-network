const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

// Support .env next to app (server/.env) and repo root (social-network/.env)
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { mongoSanitizeSafe } = require('./middleware/mongoSanitize.middleware');

const connectDb = require('./config/db.config');
const authRoute = require('./routes/auth.routes');
const postRoute = require('./routes/post.routes');
const blogRoute = require('./routes/blog.routes');
const userRoute = require('./routes/user.routes');
const commentRoute = require('./routes/comment.routes');
const likeRoute = require('./routes/like.routes');
const feedRoute = require('./routes/feed.routes');
const { Server } = require('socket.io');

const app = express();

const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitizeSafe);

const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.API_RATE_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

app.use('/auth', authRoute);
app.use('/feed', feedRoute);
app.use('/post', postRoute);
app.use('/blog', blogRoute);
app.use('/user', userRoute);
app.use('/comment', commentRoute);
app.use('/likes', likeRoute);

connectDb();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const socketHandler = require('./socket/socketcontroller');
socketHandler(io);

const PORT_NO = process.env.PORT || 5000;
server.listen(PORT_NO, () => {
  // eslint-disable-next-line no-console
  console.log(`server running successfully on port: ${PORT_NO}`);
});

module.exports = { io, server };
