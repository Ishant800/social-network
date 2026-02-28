## 🧱 Architecture

Frontend (React) → Backend (Express API) → MongoDB
# 🌐 ConnectHub – Social Networking Platform (MERN Stack)

ConnectHub is a full-stack social networking platform built using the MERN stack. It provides secure user authentication and is designed with scalable architecture to support future features such as posts, comments, likes, and user connections.

This project demonstrates real-world full-stack development practices including REST APIs, JWT authentication, and modern frontend architecture.

---

# 🚀 Features

## ✅ Implemented Features

### 🔐 Authentication System

* User registration
* User login
* Secure password hashing using bcrypt
* JWT-based authentication
* Protected routes (backend ready)
* Form validation and error handling

---

## 🔜 Planned Features

* User profile management
* Create, edit, delete posts
* Like and comment on posts
* User connection system
* Real-time notifications
* Image upload support

---

# 🛠️ Tech Stack

## Frontend (client)

* React.js
* Axios
* React Router
* Context API

## Backend (server)

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

## Tools

* Git & GitHub
* Postman
* MongoDB Atlas

---

# 📁 Project Structure

```
connecthub/
│
├── client/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/          # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
└── README.md
```

---

# ⚙️ Installation and Setup

## 1️⃣ Clone the repository

```
git clone https://github.com/YOUR_USERNAME/connecthub.git
cd connecthub
```

---

## 2️⃣ Setup Backend

```
cd server
npm install
```

Create `.env` file inside server folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```
npm run dev
```

Server runs on:

```
http://localhost:5000
```

---

## 3️⃣ Setup Frontend

Open new terminal:

```
cd client
npm install
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🔗 API Endpoints

## Auth Routes

### Register

```
POST /api/auth/register
```

### Login

```
POST /api/auth/login
```

---

# 🔒 Security Features

* Encrypted passwords using bcrypt
* JWT-based authentication
* Protected backend routes
* Secure user validation

---

# 🎯 Learning Objectives

This project demonstrates:

* Full-stack MERN development
* REST API design
* Authentication and authorization
* Database schema design
* Client-server architecture

---

# 🚀 Future Improvements

* Post creation system
* Follow/connect system
* Real-time chat
* Notification system
* Deployment (Render / Vercel)

---

# 👨‍💻 Author

Ishant Shrestha

---

# ⭐ Project Status

🟢 Authentication system completed
🟡 Full social networking features in progress
