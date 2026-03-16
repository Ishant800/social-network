# SocialNetworking

Full‑stack social networking app with a React + Vite frontend and a Node/Express + MongoDB backend. It supports user auth, posts with media, likes, comments, and follow/unfollow flows.

**Table Of Contents**
1. Project Overview
2. Features
3. Tech Stack
4. Architecture
5. Repository Structure
6. Environment Variables
7. Getting Started
8. API Overview
9. Data Models
10. Workflow Notes
11. Docker

**Project Overview**
SocialNetworking is a small but complete social app. The client handles auth, feeds, post details, and profile views. The server exposes a REST API, stores data in MongoDB, and uploads media to Cloudinary.

**Features**
- Email/password sign‑up and login with JWT
- Create posts with text + up to 5 media files
- Public feed + post details with comments
- Like/unlike posts
- Profile edit with avatar upload
- Follow/unfollow users + basic suggestions

**Tech Stack**
- Client: React 19, Vite, Redux Toolkit, React Router, TailwindCSS, Axios
- Server: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- Media: Cloudinary + multer‑storage‑cloudinary
- Tooling: ESLint, Docker (server image)

**Architecture**
- Client (Vite + React) calls REST endpoints on the server.
- Server (Express) handles auth, posts, comments, likes, and users.
- MongoDB stores users, posts, comments, and likes.
- Cloudinary stores uploaded media files.

High‑level flow:
1. User authenticates and receives a JWT.
2. Client sends `Authorization: Bearer <token>` for protected routes.
3. Server reads/writes MongoDB data and uploads media to Cloudinary.

**Repository Structure**
- `client/` Vite + React frontend
- `server/` Express API server
- `.env` shared environment config (server reads from repo root)
- `docker-compose.yml` (server service)

**Environment Variables**
Create a `.env` in the repo root. Do not commit real secrets.

Notes:
- The server reads `PORT`, `CNS` (MongoDB URI), and `SECRETE_KEY`.
- The Cloudinary config reads the `CLOUDINARY_*` variables.
- The client reads `VITE_API_BASE_URL`.

If you prefer `MONGODB_URI`, update `server/config/db.config.js` to use `process.env.MONGODB_URI`.

**Getting Started**
Prerequisites:
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account for media uploads

1. Install dependencies:
```bash
cd server
npm install

cd ../client
npm install
```

2. Create `.env` in the repo root (see above).

3. Run the server (default `PORT=5000`):
```bash
cd server
npm start
```

4. Run the client:
```bash
cd client
npm run dev
```

Open the Vite dev server URL shown in the terminal.

**API Overview**
Base URL: `http://localhost:5000`

Auth:
- `POST /auth/signup`
- `POST /auth/login`

Posts:
- `POST /post/create` (auth, multipart, up to 5 files in `media`)
- `GET /post/randomposts`
- `GET /post/myPost` (auth)
- `GET /post/post-details/:postId` (auth)
- `PUT /post/update/:postId` (auth, multipart)

Comments:
- `POST /comment/create/:postId` (auth)
- `GET /comment/getComment/:postId`
- `DELETE /comment/delete/:commentId` (auth)

Likes:
- `POST /likes/post/like/:postId` (auth)
- `POST /likes/post/unlike/:postId` (auth)

Users:
- `PUT /user/update-profile/:id` (auth, multipart)
- `GET /user/getMe` (auth)
- `GET /user/usersuggestions` (auth)
- `POST /user/follow/:userId` (auth)
- `POST /user/unfollow/:userId` (auth)

**Data Models**
- User: email, name, password hash, bio, address, profileImage, followers/following
- Post: user, content, media[], tags[], isPublic, commentsCount, likesCount
- Comment: post, user, text
- Like: user, post, isLike (unique per user+post)

**Workflow Notes**
- Auth middleware checks `Authorization: Bearer <token>`.
- Media uploads go to Cloudinary via `multer-storage-cloudinary`.
- Comments and likes update counters on the Post document.

**Docker**
There is a `server/Dockerfile` and a root `docker-compose.yml` for the backend. Build and run with:
```bash
docker compose up --build
```

If you change environment variables or ports, update `.env` and the compose file accordingly.
