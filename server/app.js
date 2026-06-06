const path = require('path');
const http = require('http');
const dotenv = require('dotenv');



dotenv.config({ path: path.resolve(__dirname, '.env') });
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
const bookmarkRoute = require('./routes/bookmark.routes');
const notificationRoute = require('./routes/notification.routes');
const searchRoute = require('./routes/search.routes');
const recommendationRoute = require('./routes/recommendation.routes');
const bulkDataRoute = require('./routes/bulk-data.routes');
const uploadRoute = require('./routes/upload.routes');
const { Server } = require('socket.io');
const {
  getClientOrigins,
  getClientUrl,
  createCorsOptions,
  createSocketCorsOptions,
} = require('./config/cors.config');

const app = express();
const clientOrigins = getClientOrigins();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(createCorsOptions(clientOrigins)));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoute);
app.use('/feed', feedRoute);
app.use('/post', postRoute);
app.use('/blog', blogRoute);
app.use('/user', userRoute);
app.use('/comment', commentRoute);
app.use('/likes', likeRoute);
app.use('/bookmark', bookmarkRoute);
app.use('/notifications', notificationRoute);
app.use('/search', searchRoute);
app.use('/recommendation', recommendationRoute);
app.use('/bulk', bulkDataRoute);
app.use('/upload', uploadRoute);     

// Serve React app for client routes (fixes "Cannot GET /confessions" on reload)
const clientDist = path.resolve(__dirname, '../client/dist');
const API_PREFIXES = [
  '/auth', '/feed', '/post', '/blog', '/user', '/comment', '/likes',
  '/bookmark', '/notifications', '/search', '/recommendation', '/bulk', '/upload', '/health', '/socket.io',
];  
 
// if (fs.existsSync(clientDist)) {
//   app.use(express.static(clientDist));
//   // Express 5 does not support app.get('*') — use middleware instead
//   app.use((req, res, next) => {
//     if (req.method !== 'GET' && req.method !== 'HEAD') {
//       return next();
//     }
//     if (API_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
//       return next();
//     }
//     return res.sendFile(path.join(clientDist, 'index.html'), (err) => {
//       if (err) next(err);
//     });
//   });
// }

connectDb();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const socketHandler = require('./socket/socketcontroller');
socketHandler(io);
    
const PORT_NO = process.env.PORT || 5000;
server.listen(PORT_NO, () => {
  console.log(`server running successfully on port: ${PORT_NO}`);
  console.log(`allowed client origins: ${clientOrigins.join(', ')}`);
  console.log(`client url: ${getClientUrl()}`);
});

module.exports = { io, server };
