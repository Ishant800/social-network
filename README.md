# Social Network

A full-stack social networking platform with posts, blogs, real-time chat, live blog discussions, notifications, bookmarks, explore feed, and user profiles.

| Layer    | Stack |
|----------|-------|
| Frontend | React 19, Vite 7, Redux Toolkit, React Router 7, Tailwind CSS 4, Socket.io Client, Axios |
| Backend  | Node.js, Express 5, MongoDB (Mongoose), Socket.io, JWT, Cloudinary, Helmet |

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Variables](#environment-variables)
3. [Repository Layout](#repository-layout)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [API Routes](#api-routes)
7. [Socket.io Events](#socketio-events)
8. [Database Models](#database-models)
9. [Security](#security)

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Cloudinary account (for image uploads)

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Create `server/.env`:

```env
PORT=5000
CNS=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/socialnetwork
SECRETE_KEY=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env` (optional — defaults to `http://localhost:5000`):

```env
VITE_API_URL=http://localhost:5000
```

### 3. Run locally

```bash
# Terminal 1 — API + Socket.io (port 5000)
cd server
npm start

# Terminal 2 — Vite dev server (port 5173)
cd client
npm run dev
```

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:5173 |
| Backend   | http://localhost:5000 |
| Health    | http://localhost:5000/health |

### 4. Production build (client)

```bash
cd client
npm run build    # output → client/dist
npm run preview  # preview production build
```

---

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `PORT` | `server/.env` | API port (default `5000`) |
| `CNS` | `server/.env` | MongoDB connection string |
| `SECRETE_KEY` | `server/.env` | JWT signing secret |
| `CLOUDINARY_*` | `server/.env` | Cloudinary credentials |
| `API_RATE_WINDOW_MS` | `server/.env` | Rate limit window (optional) |
| `API_RATE_MAX` | `server/.env` | Max requests per window (optional) |
| `VITE_API_URL` | `client/.env` | Backend URL for API + sockets |

---

## Repository Layout

```
social-network/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/                # See Frontend section
│   ├── jsconfig.json       # @ path alias for IDE
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express + Socket.io backend
│   ├── app.js              # Entry point, middleware, route mounting
│   ├── config/             # DB, Cloudinary
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, sanitization, validation
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── socket/             # Socket.io handlers
│   ├── utils/              # JWT, email, sanitize helpers
│   └── package.json
│
└── README.md
```

---

## Frontend

### Architecture

```
Browser
   │
   ├── HTTP (Axios)  ──► REST API  (port 5000)
   └── WebSocket     ──► Socket.io (port 5000)
```

- **Routing** — React Router v7, routes defined in `app/routes/AppRoutes.jsx`
- **State** — Redux Toolkit slices in `features/`
- **API** — Axios instance in `api/axios.js` (attaches JWT from `localStorage`)
- **Real-time** — `PrivateChatContext` keeps one socket connection for presence + chat
- **Imports** — `@/` alias maps to `src/` (configured in `vite.config.js` + `jsconfig.json`)

### Folder structure (`client/src/`)

```
src/
├── main.jsx                      # React entry → AppProviders → App
├── App.jsx                       # Auth bootstrap, loading screen, Layout shell
├── index.css                     # Global + Tailwind styles
│
├── app/
│   ├── store.js                  # Redux store (all reducers)
│   ├── providers/
│   │   └── AppProviders.jsx      # BrowserRouter + Redux + PrivateChatProvider
│   └── routes/
│       ├── AppRoutes.jsx         # All page routes
│       └── ProtectedRoute.jsx    # JWT gate for authenticated pages
│
├── api/
│   └── axios.js                  # Axios client + interceptors
│
├── assets/                       # Static images (logo, etc.)
├── constants/                    # Shared constants (categories)
├── context/
│   └── PrivateChatContext.jsx    # Global socket + online presence
├── utils/
│   ├── userDisplay.js            # getDisplayName, getAvatarUrl
│   └── tiptapJson.js             # TipTap editor helpers
│
├── components/                   # Reusable UI (domain-grouped)
│   ├── auth/                     # AuthLayout
│   ├── blogs/                    # BlogCard, BlogEditor
│   ├── comments/                 # CommentSection
│   ├── confessions/              # Confession cards, voice, modals
│   ├── layout/                   # Layout, Navbar, Sidebar, MobileNav, RightSidebar
│   ├── notifications/            # NotificationManager, NotificationToast
│   ├── posts/                    # SimplePostCard
│   ├── settings/                 # DeleteAccountModal
│   └── ui/
│       └── skeletons/            # PostSkeleton, ProfileSkeleton, etc.
│
├── features/                     # Redux slices + API services
│   ├── auth/                     # authSlice, authService
│   ├── bookmarks/                # bookmarkSlice, bookmarkService
│   ├── comments/                 # commentSlice, commentService
│   ├── confession/               # confessionSlice, confessionService
│   ├── discussions/              # discussionSlice, discussionService
│   ├── engagement/               # engagementService (likes/reactions)
│   ├── messages/                 # messageSlice (unread count, chat list)
│   ├── notifications/            # notificationSlice, notificationService
│   ├── post/                     # postSlice, postService (posts + feed)
│   ├── profile/                  # profileSlice, profileService
│   └── users/                    # userSlice, userService, settingsService
│
└── pages/                        # Route-level views (grouped by domain)
    ├── auth/           SignIn.jsx, SignUp.jsx
    ├── feed/           Home.jsx, Explore.jsx
    ├── posts/          PostDetails.jsx, CreatePost.jsx, EditPost.jsx
    ├── blogs/          BlogDetails.jsx, CreateBlog.jsx
    ├── chat/           Chat.jsx, Discussions.jsx, DiscussionRoom.jsx
    ├── profile/        Profile.jsx, EditProfile.jsx
    ├── social/         UserSuggestions.jsx, Search.jsx, Confessions.jsx
    ├── saved/          Bookmarks.jsx
    ├── notifications/  Notifications.jsx
    └── settings/       Settings.jsx
```

### Import convention

Use the `@/` alias instead of deep relative paths:

```js
import { getMe } from '@/features/auth/authSlice';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/feed/Home';
import API from '@/api/axios';
```

### Frontend routes

Defined in `client/src/app/routes/AppRoutes.jsx`.

| Path | Page | Auth |
|------|------|------|
| `/login` | SignIn | Public |
| `/signup` | SignUp | Public |
| `/` | Home (feed) | Protected |
| `/explore` | Explore | Protected |
| `/settings` | Settings | Protected |
| `/friendsexplore` | UserSuggestions | Protected |
| `/profile` | Own profile | Protected |
| `/profile/:userId` | User profile | Protected |
| `/profile/edit` | Edit profile | Protected |
| `/post/create` | Create post | Protected |
| `/post/edit` | Edit post | Protected |
| `/post/:postId` | Post details | Protected |
| `/blog/create` | Create blog | Protected |
| `/blog/:postId` | Blog details | Protected |
| `/bookmarks` | Saved items | Protected |
| `/notifications` | Notifications | Protected |
| `/chats` | Private messages | Protected |
| `/discussions` | Live discussions list | Protected |
| `/discussionroom/:blogId` | Blog live chat room | Protected |
| `/search` | Search | Protected |
| `/confessions` | Confessions | Protected |

### Redux store

| Slice key | Feature folder | Purpose |
|-----------|----------------|---------|
| `auth` | `features/auth` | Current user, login/signup |
| `posts` | `features/post` | Feed, posts, blogs in feed |
| `users` | `features/users` | Follow, suggestions |
| `profile` | `features/profile` | Profile data |
| `bookmarks` | `features/bookmarks` | Saved posts/blogs |
| `notifications` | `features/notifications` | Notification list + unread |
| `comments` | `features/comments` | Comment state |
| `messages` | `features/messages` | Chat list, online users, unread |
| `confession` | `features/confession` | Anonymous confessions |
| `discussions` | `features/discussions` | Active blog discussions |
| `profile` | `features/profile` | Profile tabs data |

### Layout behavior

`components/layout/Layout.jsx` wraps all authenticated pages:

- Fixed **Navbar** (top)
- Fixed **Sidebar** (left, desktop)
- Optional **RightSidebar** (home, explore, profile)
- **MobileNav** (bottom, mobile)
- Full-height layout for `/chats` and `/discussionroom/*`

---

## Backend

### Folder structure (`server/`)

```
server/
├── app.js                        # Express app, HTTP server, Socket.io init
│
├── config/
│   ├── db.config.js              # MongoDB connection
│   └── cloudinary.config.js      # Multer + Cloudinary upload
│
├── middleware/
│   ├── auth.middleware.js        # verifyToken (JWT)
│   ├── mongoSanitize.middleware.js
│   └── validateObjectId.middleware.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── post.controller.js
│   ├── blog.controller.js
│   ├── comment.controller.js
│   ├── like.controller.js
│   ├── feed.controller.js
│   ├── bookmark.controller.js
│   ├── notification.controller.js
│   ├── search.controller.js
│   ├── recommendation.controller.js
│   └── bulk-data.controller.js
│
├── routes/                       # Mounted in app.js (see API Routes)
│
├── models/
│   ├── user.model.js
│   ├── post.model.js
│   ├── blogs.model.js
│   ├── comment.model.js
│   ├── post-like.model.js
│   ├── blog-like.model.js
│   ├── bookmark.model.js
│   ├── notification.model.js
│   ├── message.model.js          # Blog discussion messages
│   ├── pmschema.js               # Private messages
│   ├── anonymous-post.model.js
│   ├── anonymous-comment.model.js
│   └── userinteractions.model.js # Recommendation tracking
│
├── socket/
│   └── socketcontroller.js       # Private chat + blog discussion sockets
│
└── utils/
    ├── token.util.js
    ├── mailer.util.js
    ├── emailTemplates.util.js
    └── sanitize.util.js
```

### Request pipeline

```
Request
  → Helmet (security headers)
  → CORS
  → express.json / urlencoded
  → mongoSanitize
  → rateLimit (200 req/min default)
  → Route handler
  → Controller
  → MongoDB / Cloudinary
```

### Auth

Protected routes expect:

```
Authorization: Bearer <jwt_token>
```

Token is issued on `POST /auth/login` and `POST /auth/signup`.

---

## API Routes

Base URL: `http://localhost:5000`

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Server health check |

### Auth — `/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Register |
| POST | `/auth/login` | No | Login |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password |
| POST | `/auth/setup-interests` | Yes | Set user interests |

### Users — `/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/user/getMe` | Yes | Current user |
| GET | `/user/getusers` | No | List users |
| GET | `/user/profile/:userId` | Yes | User profile |
| PUT | `/user/update-profile` | Yes | Update profile (+ avatar) |
| PUT | `/user/update-interests` | Yes | Update interests |
| PUT | `/user/privacy` | Yes | Privacy settings |
| DELETE | `/user/account` | Yes | Delete account |
| GET | `/user/usersuggestions` | Yes | Suggested users |
| GET | `/user/weekly-stats` | Yes | Weekly stats |
| GET | `/user/followers` | Yes | Own followers |
| GET | `/user/followers/:userId` | Yes | User followers |
| GET | `/user/following` | Yes | Own following |
| GET | `/user/following/:userId` | Yes | User following |
| POST | `/user/follow/:userId` | Yes | Follow |
| POST | `/user/unfollow/:userId` | Yes | Unfollow |

### Posts — `/post`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/post/create` | Yes | Create post (multipart, up to 5 images) |
| GET | `/post/myPost` | Yes | Current user's posts |
| GET | `/post/post-details/:postId` | Yes | Post details |
| PUT | `/post/update/:postId` | Yes | Update post |
| DELETE | `/post/delete/:postId` | Yes | Delete post |
| POST | `/post/bulkposts` | No | Bulk insert (dev) |

### Blogs — `/blog`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/blog/create` | Yes | Create blog |
| GET | `/blog/explore` | Yes | Explore published blogs |
| GET | `/blog/myBlogs` | Yes | Own blogs |
| GET | `/blog/active-discussions` | Yes | Active live discussions |
| GET | `/blog/blog-details/:blogId` | Yes | Blog details |
| PUT | `/blog/update/:blogId` | Yes | Update blog |
| DELETE | `/blog/delete/:blogId` | Yes | Delete blog |

### Feed — `/feed`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/feed/posts` | Yes | Posts feed |
| GET | `/feed/blogs` | Yes | Blogs feed |
| GET | `/feed/explore` | Yes | Personalized explore (70/20/10 mix) |
| POST | `/feed/interest-scores` | Yes | Update interest scores |

### Recommendations — `/recommendation`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/recommendation/feed` | Yes | Personalized feed |
| GET | `/recommendation/explore` | Yes | Explore recommendations |
| POST | `/recommendation/track/view` | Yes | Track content view |
| POST | `/recommendation/track/reaction` | Yes | Track reaction |
| POST | `/recommendation/track/comment` | Yes | Track comment |
| POST | `/recommendation/track/bookmark` | Yes | Track bookmark |
| POST | `/recommendation/track/share` | Yes | Track share |
| POST | `/recommendation/track/blog-read` | Yes | Track blog read |

### Likes — `/likes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/likes/post/:postId/react` | Yes | React to post |
| DELETE | `/likes/post/:postId/react` | Yes | Remove reaction |
| POST | `/likes/post/:postId/like` | Yes | Like post |
| DELETE | `/likes/post/:postId/unlike` | Yes | Unlike post |
| POST | `/likes/blog/:blogId/like` | Yes | Like blog |
| DELETE | `/likes/blog/:blogId/unlike` | Yes | Unlike blog |

### Comments — `/comment`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/comment/create/:postId` | Yes | Create comment |
| GET | `/comment/getComment/:postId` | No | Get post comments |
| PUT | `/comment/update/:commentId` | Yes | Update comment |
| DELETE | `/comment/delete/:commentId` | Yes | Delete comment |

### Bookmarks — `/bookmark`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/bookmark/` | Yes | List bookmarks |
| GET | `/bookmark/ids` | Yes | Bookmarked item IDs |
| POST | `/bookmark/:itemId` | Yes | Toggle bookmark (post or blog) |

### Notifications — `/notifications`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications/` | Yes | Paginated notifications |
| GET | `/notifications/stream` | Yes | SSE real-time stream |
| PUT | `/notifications/read` | Yes | Mark all read |
| PUT | `/notifications/:id/read` | Yes | Mark one read |
| POST | `/notifications/ping-author` | Yes | Ping blog author to discussion |

### Search — `/search`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/search/` | Yes | Search users, posts, blogs |

### Upload — `/upload`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload/image` | Yes | Single image upload |
| POST | `/upload/images` | Yes | Multiple images (max 5) |

### Bulk data — `/bulk` (development)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/bulk/user` | No | Bulk insert users |
| POST | `/bulk/post` | No | Bulk insert posts |
| POST | `/bulk/blog` | No | Bulk insert blogs |
| GET | `/bulk/stats` | No | Bulk data stats |
| DELETE | `/bulk/clear-all` | No | Clear bulk data |

---

## Socket.io Events

Socket server runs on the same port as the API (`5000`). Client connects via `VITE_API_URL` or `http://localhost:5000`.

### Private chat

| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `register_private_user` | Register user for presence |
| Client → Server | `get_chat_list` | Load conversation list |
| Client → Server | `get_private_chat_history` | Load messages with a user |
| Client → Server | `send_private_message` | Send message |
| Client → Server | `mark_private_messages_read` | Mark messages read |
| Client → Server | `private_typing` | Typing indicator |
| Server → Client | `chat_list_data` | Conversation list |
| Server → Client | `receive_private_message` | Incoming message |
| Server → Client | `private_message_sent` | Sender confirmation |
| Server → Client | `private_chat_history` | Message history |
| Server → Client | `user_status_changed` | Online/offline |
| Server → Client | `online_users_snapshot` | Who is online on connect |
| Server → Client | `user_typing` | Typing status |
| Server → Client | `messages_read` | Read receipt |
| Server → Client | `message_delivered` | Delivery receipt |

### Blog live discussion

| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `join_room` | Join blog discussion room |
| Client → Server | `send_message` | Send room message |
| Client → Server | `like_message` | Like a room message |
| Server → Client | `load_messages` | Room message history |
| Server → Client | `receive_message` | New room message |
| Server → Client | `update_active_users` | Users in room |
| Server → Client | `message_liked` | Like update |

---

## Database Models

| Model | File | Purpose |
|-------|------|---------|
| User | `user.model.js` | Auth, profile, followers, chatList, preferences |
| Post | `post.model.js` | Text/media posts |
| Blog | `blogs.model.js` | Long-form articles + discussion metadata |
| Comment | `comment.model.js` | Post/blog comments |
| PostLike | `post-like.model.js` | Post likes/reactions |
| BlogLike | `blog-like.model.js` | Blog likes |
| Bookmark | `bookmark.model.js` | Saved posts/blogs |
| Notification | `notification.model.js` | Like, comment, follow, system alerts |
| Message | `message.model.js` | Blog discussion room messages |
| PrivateMessage | `pmschema.js` | 1:1 private chat messages |
| UserInteraction | `userinteractions.model.js` | Recommendation engine signals |
| AnonymousPost | `anonymous-post.model.js` | Confessions posts |
| AnonymousComment | `anonymous-comment.model.js` | Confession comments |

### User schema (key fields)

```js
{
  username, email, password,
  profile: { fullName, bio, avatar, coverImage, location },
  stats: { posts, blogs, followers, following },
  preferences: { interests, isPrivate, discoverable },
  followers: [ObjectId],
  following: [ObjectId],
  chatList: [ObjectId],
  lastSeen: Date
}
```

---

## Security

| Layer | Implementation |
|-------|----------------|
| Authentication | JWT (`auth.middleware.js`) |
| Passwords | bcrypt hashing |
| Headers | Helmet |
| CORS | Whitelist (`http://localhost:5173` in dev) |
| Injection | `express-mongo-sanitize` |
| Rate limiting | `express-rate-limit` (200/min default) |
| Content | `sanitize-html` for user-generated content |
| ObjectIds | `validateObjectId` middleware on param routes |

---

## NPM Scripts

### Client (`client/`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Development server |
| `build` | `vite build` | Production build → `dist/` |
| `preview` | `vite preview` | Preview production build |
| `lint` | `eslint .` | Lint source |

### Server (`server/`)

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `nodemon app.js` | Run API with auto-reload |
| `dev` | `nodemon app.js` | Same as start |

---

## Feature overview

| Feature | Frontend | Backend |
|---------|----------|---------|
| Auth | `pages/auth/` | `/auth` |
| Feed | `pages/feed/Home` | `/feed/posts`, `/feed/blogs` |
| Explore | `pages/feed/Explore` | `/feed/explore`, `/recommendation/explore` |
| Posts | `pages/posts/` | `/post`, `/likes`, `/comment` |
| Blogs | `pages/blogs/` | `/blog` |
| Profile | `pages/profile/` | `/user` |
| Follow | `pages/social/UserSuggestions` | `/user/follow` |
| Bookmarks | `pages/saved/Bookmarks` | `/bookmark` |
| Notifications | `pages/notifications/` | `/notifications` + SSE |
| Private chat | `pages/chat/Chat` + `PrivateChatContext` | Socket.io private events |
| Live discussions | `pages/chat/Discussions`, `DiscussionRoom` | `/blog/active-discussions` + Socket.io room |
| Confessions | `pages/social/Confessions` | Anonymous models + services |
| Search | `pages/social/Search` | `/search` |
| Settings | `pages/settings/Settings` | `/user/privacy`, `/user/update-interests` |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 404 on new routes | Restart the server after route changes |
| Socket not connecting | Check `VITE_API_URL` and CORS origin in `server/app.js` |
| MongoDB connection failed | Verify `CNS` in `server/.env` and network access |
| Explore/feed empty | Ensure MongoDB is connected and seed data exists |
| `@/` import errors | Restart Vite dev server after `vite.config.js` changes |

---

## License

Educational / personal project.
