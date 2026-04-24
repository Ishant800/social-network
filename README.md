# Social Networking Platform

A full-stack social networking application built with React, Node.js, Express, and MongoDB. Features real-time messaging, notifications, posts with media uploads, blogs/articles, and comprehensive social interactions.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Installation & Setup](#installation--setup)
7. [Docker Deployment](#docker-deployment)
8. [API Documentation](#api-documentation)
9. [Database Models](#database-models)
10. [Frontend Structure](#frontend-structure)
11. [Backend Structure](#backend-structure)
12. [Real-Time Features](#real-time-features)
13. [Security Features](#security-features)
14. [Screenshots](#screenshots)

---

## 🎯 Project Overview

This is a modern social networking platform that allows users to:
- Create and share posts with images
- Write and publish blog articles
- Engage through likes, comments, and shares
- Follow/unfollow other users
- Real-time messaging with online/offline status
- Real-time notifications for interactions
- Bookmark favorite content
- Discover new users and content

**Built for:** Final Year Project  
**Purpose:** Demonstrate full-stack development skills with modern technologies

---

## ✨ Features

### User Management
- ✅ User registration and authentication (JWT)
- ✅ Profile management (avatar, bio, location)
- ✅ View own and other users' profiles
- ✅ Follow/unfollow system
- ✅ User suggestions based on network

### Content Creation
- ✅ Create posts with text and up to 5 images
- ✅ Create blog articles with rich content
- ✅ Edit and delete own posts
- ✅ Public/private post visibility
- ✅ Tag posts with categories

### Social Interactions
- ✅ Like/unlike posts and blogs
- ✅ Comment on posts and blogs
- ✅ Share content
- ✅ Bookmark/save posts for later
- ✅ View followers and following lists

### Real-Time Features
- ✅ Real-time messaging with Socket.io
- ✅ Online/offline user status
- ✅ Real-time notifications (SSE)
- ✅ Typing indicators in chat
- ✅ Message read receipts
- ✅ Unread message count badges

### Feed & Discovery
- ✅ Personalized feed with tabs (Posts, Articles, Discussions)
- ✅ Explore page for discovering content
- ✅ User suggestions
- ✅ Search functionality
- ✅ Infinite scroll pagination

### Media Management
- ✅ Image uploads to Cloudinary
- ✅ Image optimization and CDN delivery
- ✅ Multiple image support per post
- ✅ Avatar uploads

---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Media storage
- **Multer** - File upload handling

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **MongoDB Atlas** - Cloud database

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Express Mongo Sanitize** - NoSQL injection prevention
- **Sanitize HTML** - XSS protection

---

## 🏗 Architecture

### System Architecture
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│   Nginx Reverse Proxy (Port 80) │
└─────────────┬───────────────────┘
              │
       ┌──────┴──────┐
       ↓             ↓
┌─────────────┐  ┌──────────────┐
│  Frontend   │  │   Backend    │
│  (React)    │  │  (Node.js)   │
│  Port 80    │  │  Port 5000   │
└─────────────┘  └──────┬───────┘
                        │
                 ┌──────┴──────┐
                 ↓             ↓
          ┌────────────┐  ┌──────────┐
          │  MongoDB   │  │Cloudinary│
          │   Atlas    │  │   CDN    │
          └────────────┘  └──────────┘
```

### Request Flow
1. **User Request** → Nginx (Port 80)
2. **Nginx Routes**:
   - `/api/*` → Backend API
   - `/socket.io/*` → WebSocket server
   - `/*` → Frontend React app
3. **Backend** processes requests and interacts with:
   - MongoDB for data storage
   - Cloudinary for media files
   - Socket.io for real-time features

---

## 📁 Project Structure

```
SocialNetworking/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                 # API configuration
│   │   │   └── axios.js         # Axios instance with interceptors
│   │   ├── app/                 # Redux store
│   │   │   └── store.js         # Store configuration
│   │   ├── assets/              # Images, logos
│   │   ├── components/          # Reusable components
│   │   │   ├── blogs/           # Blog-related components
│   │   │   ├── chats/           # Chat components
│   │   │   ├── comments/        # Comment components
│   │   │   ├── layout/          # Layout components (Navbar, Sidebar)
│   │   │   ├── notifications/   # Notification components
│   │   │   ├── posts/           # Post components
│   │   │   └── skeletons/       # Loading skeletons
│   │   ├── features/            # Redux slices
│   │   │   ├── auth/            # Authentication slice
│   │   │   ├── bookmarks/       # Bookmarks slice
│   │   │   ├── comment/         # Comments slice
│   │   │   ├── messages/        # Messages slice
│   │   │   ├── notifications/   # Notifications slice
│   │   │   ├── post/            # Posts slice
│   │   │   └── users/           # Users slice
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx         # Main feed
│   │   │   ├── Profile.jsx      # User profile
│   │   │   ├── Messagebox.jsx   # Chat interface
│   │   │   ├── Notifications.jsx
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── ...
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── Dockerfile               # Frontend container config
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Backend Node.js application
│   ├── config/                  # Configuration files
│   │   ├── cloudinary.config.js # Cloudinary setup
│   │   └── db.config.js         # MongoDB connection
│   ├── controllers/             # Request handlers
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── post.controller.js   # Post CRUD operations
│   │   ├── blog.controller.js   # Blog operations
│   │   ├── user.controller.js   # User management
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── feed.controller.js
│   │   ├── bookmark.controller.js
│   │   └── notification.controller.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── mongoSanitize.middleware.js
│   │   └── validateObjectId.middleware.js
│   ├── models/                  # Mongoose schemas
│   │   ├── user.model.js        # User schema
│   │   ├── post.model.js        # Post schema
│   │   ├── blogs.model.js       # Blog schema
│   │   ├── comment.model.js
│   │   ├── post-like.model.js
│   │   ├── blog-like.model.js
│   │   ├── bookmark.model.js
│   │   ├── notification.model.js
│   │   ├── message.model.js
│   │   └── pmschema.js          # Private message schema
│   ├── routes/                  # API routes
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── blog.routes.js
│   │   ├── user.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── feed.routes.js
│   │   ├── bookmark.routes.js
│   │   └── notification.routes.js
│   ├── socket/                  # Socket.io handlers
│   │   └── socketcontroller.js  # Real-time logic
│   ├── utils/                   # Utility functions
│   │   ├── sanitize.util.js
│   │   └── token.util.js
│   ├── app.js                   # Express app setup
│   ├── Dockerfile               # Backend container config
│   └── package.json
│
├── docker-compose.yml           # Multi-container setup
├── nginx.conf                   # Nginx configuration
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── README.md                    # This file
└── DEPLOY_README.md             # Deployment guide
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Git

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-username/social-networking.git
cd social-networking
```

#### 2. Setup Backend
```bash
cd server
npm install

# Create .env file in root directory
cd ..
nano .env
```

Add the following to `.env`:
```env
PORT=5000
CNS=mongodb+srv://username:password@cluster.mongodb.net/socialnetwork
SECRETE_KEY=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_ORIGIN=http://localhost:5173
```

#### 3. Setup Frontend
```bash
cd client
npm install

# Create .env file
nano .env
```

Add to `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

#### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

#### 5. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🐳 Docker Deployment

### Quick Deploy (Recommended)

#### 1. Configure Environment
Edit `.env` file in root:
```env
PORT=5000
CNS=mongodb+srv://username:password@cluster.mongodb.net/socialnetwork
SECRETE_KEY=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost/api
```

#### 2. Build and Run
```bash
docker-compose up -d --build
```

#### 3. Access Application
- Application: http://localhost
- API: http://localhost/api

### Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

### Docker Architecture
- **Backend Container**: Node.js app on port 5000
- **Frontend Container**: React app built and served by Nginx
- **Nginx Container**: Reverse proxy routing requests

---

## 📡 API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `http://your-domain.com/api`

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### API Endpoints

#### Authentication
```
POST   /auth/signup          Register new user
POST   /auth/login           Login user
```

#### Users
```
GET    /user/getMe           Get current user profile
PUT    /user/update-profile  Update profile
GET    /user/profile/:userId Get user profile
GET    /user/followers       Get followers list
GET    /user/following       Get following list
POST   /user/follow/:userId  Follow user
POST   /user/unfollow/:userId Unfollow user
GET    /user/usersuggestions Get user suggestions
```

#### Posts
```
POST   /post/create          Create post (multipart)
GET    /post/myPost          Get user's posts
GET    /post/post-details/:postId Get post details
PUT    /post/:postId         Update post
DELETE /post/:postId         Delete post
```

#### Blogs
```
POST   /blog/create          Create blog (multipart)
GET    /blog/myBlogs         Get user's blogs
GET    /blog/blog-details/:blogId Get blog details
PUT    /blog/:blogId         Update blog
DELETE /blog/:blogId         Delete blog
GET    /blog/explore         Explore blogs
```

#### Feed
```
GET    /feed/posts           Get posts feed
GET    /feed/blogs           Get blogs feed
```

#### Likes
```
POST   /likes/post/:postId/like    Like post
DELETE /likes/post/:postId/unlike  Unlike post
POST   /likes/blog/:blogId/like    Like blog
DELETE /likes/blog/:blogId/unlike  Unlike blog
```

#### Comments
```
POST   /comment/create/:postId     Create comment
GET    /comment/getComment/:postId Get comments
DELETE /comment/delete/:commentId  Delete comment
```

#### Bookmarks
```
POST   /bookmark/toggle/:postId    Toggle bookmark
GET    /bookmark/my-bookmarks      Get bookmarks
```

#### Notifications
```
GET    /notifications              Get notifications
GET    /notifications/stream       SSE stream
PUT    /notifications/:id/read     Mark as read
```

---

## 🗄 Database Models

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  username: String (unique),
  profile: {
    fullName: String,
    bio: String,
    location: String,
    avatar: { url, public_id }
  },
  followers: [ObjectId],
  following: [ObjectId],
  chatList: [ObjectId],
  lastSeen: Date
}
```

### Post Model
```javascript
{
  user: ObjectId (ref: User),
  content: String,
  media: [{ url, public_id }],
  tags: [String],
  isPublic: Boolean,
  likesCount: Number,
  commentsCount: Number,
  sharesCount: Number
}
```

### Blog Model
```javascript
{
  author: ObjectId (ref: User),
  title: String,
  body: String,
  summary: String,
  coverImage: { url, public_id },
  categoryName: String,
  tags: [String],
  status: String (draft/published),
  likesCount: Number,
  commentsCount: Number
}
```

### Comment Model
```javascript
{
  post: ObjectId,
  user: ObjectId (ref: User),
  text: String
}
```

### Like Models (Post & Blog)
```javascript
{
  user: ObjectId (ref: User),
  post/blog: ObjectId,
  isLike: Boolean
}
```

### Notification Model
```javascript
{
  recipient: ObjectId (ref: User),
  sender: ObjectId (ref: User),
  type: String (like/comment/follow),
  post: ObjectId,
  read: Boolean
}
```

### Private Message Model
```javascript
{
  conversationId: String,
  from: ObjectId (ref: User),
  to: ObjectId (ref: User),
  content: String,
  read: Boolean,
  delivered: Boolean
}
```

---

## 🎨 Frontend Structure

### State Management (Redux)
- **auth**: User authentication state
- **posts**: Posts and blogs data
- **users**: User profiles and suggestions
- **bookmarks**: Saved posts
- **notifications**: Notification state
- **comments**: Comments data
- **messages**: Chat and message count

### Key Components

#### Layout Components
- **Navbar**: Top navigation with search
- **Sidebar**: Main navigation menu
- **RightSidebar**: Trending and suggestions
- **MobileNav**: Bottom navigation for mobile

#### Feature Components
- **SimplePostCard**: Post display card
- **BlogCard**: Blog article card
- **CommentSection**: Comments interface
- **NotificationToast**: Real-time notifications
- **DiscussionRoom**: Blog discussion chat

#### Pages
- **Home**: Main feed with tabs
- **Profile**: User profile view
- **Messagebox**: Chat interface
- **Notifications**: Notification center
- **Explore**: Content discovery
- **PostDetails**: Single post view
- **BlogDetails**: Single blog view

### Routing
```javascript
/                    → Home (Feed)
/profile             → Own Profile
/profile/:userId     → User Profile
/post/create         → Create Post
/post/:postId        → Post Details
/blog/create         → Create Blog
/blog/:blogId        → Blog Details
/chats               → Messages
/notifications       → Notifications
/explore             → Explore
/bookmarks           → Saved Items
/login               → Sign In
/signup              → Sign Up
```

---

## ⚙️ Backend Structure

### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin requests
3. **Express JSON**: Body parsing
4. **Mongo Sanitize**: NoSQL injection prevention
5. **Rate Limiting**: API throttling
6. **Auth Middleware**: JWT verification

### Controllers
Each controller handles specific business logic:
- **auth.controller**: Registration, login
- **post.controller**: CRUD for posts
- **blog.controller**: CRUD for blogs
- **user.controller**: Profile, follow/unfollow
- **like.controller**: Like/unlike logic
- **comment.controller**: Comment management
- **feed.controller**: Feed generation
- **notification.controller**: Notification handling

### Services
- **Cloudinary**: Image upload and storage
- **JWT**: Token generation and verification
- **bcrypt**: Password hashing
- **Socket.io**: Real-time communication

---

## ⚡ Real-Time Features

### Socket.io Implementation

#### Events
**Client → Server:**
- `register_private_user`: Register for chat
- `send_private_message`: Send message
- `get_chat_list`: Get conversations
- `get_private_chat_history`: Load messages
- `mark_private_messages_read`: Mark as read
- `private_typing`: Typing indicator

**Server → Client:**
- `chat_list_data`: Chat list update
- `receive_private_message`: New message
- `private_message_sent`: Message sent confirmation
- `private_chat_history`: Message history
- `user_typing`: Typing status
- `user_status_changed`: Online/offline status
- `messages_read`: Read receipt

### Server-Sent Events (SSE)
- Real-time notifications via `/notifications/stream`
- Automatic reconnection
- Event types: like, comment, follow

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Protected routes with middleware

### Input Validation & Sanitization
- MongoDB query sanitization
- HTML sanitization for user content
- File upload validation
- Request body validation

### Security Headers (Helmet)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### Rate Limiting
- API rate limiting (200 requests/minute)
- Prevents brute force attacks
- Configurable limits

### CORS Configuration
- Whitelist allowed origins
- Credentials support
- Preflight request handling

---

## 📸 Screenshots

### Home Feed
Main feed with posts, articles, and discussions tabs.

### User Profile
Profile page showing posts, followers, and following.

### Real-Time Chat
Messaging interface with online status and typing indicators.

### Notifications
Real-time notification center with unread badges.

### Create Post
Post creation with image upload support.

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create post with images
- [ ] Like and comment on posts
- [ ] Follow/unfollow users
- [ ] Real-time messaging
- [ ] Real-time notifications
- [ ] Profile updates
- [ ] Bookmark posts
- [ ] Create and view blogs

---

## 🚧 Future Enhancements

- [ ] Video upload support
- [ ] Story feature (24-hour posts)
- [ ] Group chats
- [ ] Voice/video calls
- [ ] Advanced search with filters
- [ ] Hashtag system
- [ ] Post analytics
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Two-factor authentication

---

## 🤝 Contributing

This is a final year project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is created for educational purposes as a final year project.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- React and Node.js communities
- MongoDB Atlas for cloud database
- Cloudinary for media storage
- All open-source libraries used in this project

---

## 📞 Support

For questions or issues:
1. Check [DEPLOY_README.md](DEPLOY_README.md) for deployment help
2. Open an issue on GitHub
3. Contact via email

---

**Built with ❤️ for Final Year Project**
