# 🌐 Social Networking Platform Using MERN Stack

A modern social networking backend built using the MERN stack. This project implements secure user authentication and is designed with scalable architecture for future features like posts, comments, and connections.

---

## 🚀 Features (Currently Implemented)

### 🔐 Authentication System

* User registration
* User login
* Password hashing using bcrypt
* JWT-based authentication (secure)
* Input validation
* Error handling

---

## 🛠️ Tech Stack

**Backend:**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

**Tools:**

* Git
* GitHub
* Postman

---

## 📁 Project Structure

backend/
│
├── controllers/
│ └── auth.controller.js
│
├── models/
│ └── auth.entity.js
│
├── routes/
│ └── auth.routes.js
│
├── config/
│ └── db.js
│
└── server.js

---

## ⚙️ API Endpoints

### Register User

POST /api/auth/register

Request Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### Login User

POST /api/auth/login

Request Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

## 🔒 Security Features

* Password hashing with bcrypt
* JWT authentication
* Protected routes ready
* Secure authentication flow

---

## ▶️ How to Run Locally

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

2. Install dependencies

npm install

3. Create .env file

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key

4. Run server

npm run dev

---

## 🎯 Future Features

* User profile
* Create posts
* Like and comment system
* Connection system
* Real-time notifications

---

## 👨‍💻 Author

Ishant Karmacharya

---

## ⭐ Project Status

Authentication system completed. More features coming soon.
