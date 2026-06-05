# Manual Bulk Data Insert Guide

Insert users, posts, and blogs one at a time through Postman with manual input data.

---

## 1. Insert Single User

**Endpoint:** `POST http://localhost:5000/api/bulk/user`

**Request Body (JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "profile": {
    "fullName": "John Doe",
    "bio": "I'm a software developer passionate about building great products",
    "location": "San Francisco, CA",
    "website": "https://johndoe.com"
  },
  "preferences": {
    "interests": ["Programming", "AI", "Technology"]
  }
}
```

**Required Fields:**
- `username` (string) - Must be unique
- `email` (string) - Must be unique
- `password` (string) - Will be hashed

**Optional Fields:**
- `profile.fullName`
- `profile.bio`
- `profile.location`
- `profile.website`
- `preferences.interests` - Array of interests from 16 categories

**Success Response (201):**
```json
{
  "success": true,
  "message": "User inserted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profile": { ... },
    "interests": ["Programming", "AI", "Technology"]
  }
}
```

**Available Interest Categories:**
Programming, AI, Technology, Business, Startups, Finance, Science, Education, Gaming, Sports, Movies, Music, Travel, Lifestyle, Health, Politics

---

## 2. Insert Single Post

**Endpoint:** `POST http://localhost:5000/api/bulk/post`

**Request Body (JSON):**
```json
{
  "author": "507f1f77bcf86cd799439011",
  "content": "Just launched my new React project! Really excited to share it with everyone. Check it out and let me know what you think.",
  "category": "Programming",
  "tags": ["React", "JavaScript", "Frontend"],
  "visibility": "public",
  "media": []
}
```

**Required Fields:**
- `author` (ObjectId) - Valid user ID (from insert user response)
- `content` (string) - Post content (max 2000 characters)
- `category` (string) - One of 16 categories (must match interests list)
- `tags` (array) - At least 1 tag, array of strings

**Optional Fields:**
- `visibility` (string) - "public", "followers", or "private" (default: "public")
- `media` (array) - Array of media objects with { url, public_id, type }

**Success Response (201):**
```json
{
  "success": true,
  "message": "Post inserted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "author": "507f1f77bcf86cd799439011",
    "content": "Just launched my new React project!...",
    "category": "Programming",
    "tags": ["React", "JavaScript", "Frontend"],
    "engagementScore": 0
  }
}
```

**Category Options:**
Programming, AI, Technology, Business, Startups, Finance, Science, Education, Gaming, Sports, Movies, Music, Travel, Lifestyle, Health, Politics

---

## 3. Insert Single Blog

**Endpoint:** `POST http://localhost:5000/api/bulk/blog`

**Request Body (JSON):**
```json
{
  "author": "507f1f77bcf86cd799439011",
  "title": "Getting Started with React Hooks",
  "content": {
    "body": "<h1>React Hooks Tutorial</h1><p>React Hooks allow you to use state and other React features without writing a class...</p>"
  },
  "category": "Programming",
  "tags": ["React", "Hooks", "JavaScript"],
  "summary": "A comprehensive guide to using React Hooks in your projects",
  "readTime": 8
}
```

**Required Fields:**
- `author` (ObjectId) - Valid user ID (from insert user response)
- `title` (string) - Blog title
- `content` (Object) - Blog content (can contain HTML)
- `category` (string) - One of 16 categories
- `tags` (array) - At least 1 tag, array of strings

**Optional Fields:**
- `summary` (string) - Blog summary
- `readTime` (number) - Estimated read time in minutes (default: 5)
- `coverImage` (object) - { url, public_id }

**Success Response (201):**
```json
{
  "success": true,
  "message": "Blog inserted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "author": "507f1f77bcf86cd799439011",
    "title": "Getting Started with React Hooks",
    "category": "Programming",
    "tags": ["React", "Hooks", "JavaScript"],
    "engagementScore": 0
  }
}
```

---

## 4. Get Database Statistics

**Endpoint:** `GET http://localhost:5000/api/bulk/stats`

**No request body needed**

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": 5,
    "posts": 12,
    "blogs": 3,
    "total": 20
  }
}
```

---

## 5. Clear All Data (Destructive)

**Endpoint:** `DELETE http://localhost:5000/api/bulk/clear-all`

**Request Body (JSON):**
```json
{
  "confirm": true
}
```

**⚠️ WARNING:** This will delete ALL users, posts, and blogs. This action cannot be undone!

**Success Response (200):**
```json
{
  "success": true,
  "message": "All data cleared successfully"
}
```

---

## Postman Usage Examples

### Step 1: Create a User
1. Open Postman
2. Create new request
3. Set method to **POST**
4. URL: `http://localhost:5000/api/bulk/user`
5. Go to Body → Raw → JSON
6. Paste user data
7. Click Send
8. **Copy the returned `_id`** for next steps

### Step 2: Create a Post
1. Create new request
2. Set method to **POST**
3. URL: `http://localhost:5000/api/bulk/post`
4. Go to Body → Raw → JSON
5. Paste post data (use the user `_id` from step 1 as `author`)
6. Click Send

### Step 3: Create a Blog
1. Create new request
2. Set method to **POST**
3. URL: `http://localhost:5000/api/bulk/blog`
4. Go to Body → Raw → JSON
5. Paste blog data (use the user `_id` from step 1 as `author`)
6. Click Send

### Step 4: Check Stats
1. Create new request
2. Set method to **GET**
3. URL: `http://localhost:5000/api/bulk/stats`
4. Click Send
5. Should show users: 1, posts: 1, blogs: 1

---

## Error Responses

### Missing Required Field
```json
{
  "success": false,
  "message": "author, content, and category are required"
}
```

### Invalid User ID
```json
{
  "success": false,
  "message": "Author user ID does not exist"
}
```

### Empty Tags
```json
{
  "success": false,
  "message": "tags must be a non-empty array"
}
```

### Duplicate Username/Email
```json
{
  "success": false,
  "message": "User with this username or email already exists"
}
```

---

## Workflow Summary

1. **POST** `/api/bulk/user` → Get user ID
2. **POST** `/api/bulk/post` → Use user ID as author
3. **POST** `/api/bulk/blog` → Use user ID as author
4. **GET** `/api/bulk/stats` → Verify data inserted
5. **Repeat** steps 1-3 for more data

Each user, post, and blog is inserted individually based on your manual input.

---

## Notes

- All passwords are hashed with bcrypt before storing
- Usernames and emails must be unique across the database
- Posts and blogs require both category and tags
- User interest scores are automatically initialized at 50 for each interest
- Engagement scores start at 0 and are calculated by the recommendation system
- User stats (posts, blogs count) are updated automatically when posts/blogs are created
