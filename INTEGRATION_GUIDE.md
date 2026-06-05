# Feed Recommendation System - Integration Guide

## Overview

This guide explains how to integrate the feed recommendation system into your existing application workflow.

---

## Phase 1: User Signup & Interest Setup

### Signup Flow

**1. Register User (Existing Endpoint)**
```
POST /auth/signup
Body: {
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
}

Response:
{
  success: true,
  token: "jwt_token_here",
  message: "Account created successfully"
}
```

**2. Setup User Interests (NEW ENDPOINT)**
```
POST /auth/setup-interests
Authorization: Bearer <token>
Body: {
  interests: ["Programming", "AI", "Technology"]
}

Response:
{
  success: true,
  message: "Interests set up successfully",
  data: {
    interests: ["Programming", "AI", "Technology"],
    interestScores: {
      Programming: 50,
      AI: 50,
      Technology: 50
    }
  }
}
```

### Initial State After Signup
```javascript
// User Model State
{
  _id: "user123",
  username: "john_doe_1234",
  email: "user@example.com",
  
  // Newly set
  preferences: {
    interests: ["Programming", "AI", "Technology"]
  },
  
  interestScores: {
    Programming: 50,
    AI: 50,
    Technology: 50
  },
  
  contentPreferences: {
    posts: 50,
    blogs: 50
  }
}
```

---

## Phase 2: Content Creation

### Create a Post

**Updated Endpoint - Now Requires Category & Tags**
```
POST /post/create
Authorization: Bearer <token>
Body: {
  content: "My first post about Spring Boot...",
  category: "Programming",    // REQUIRED - must be one of INTEREST_CATEGORIES
  tags: ["SpringBoot", "Java", "Backend"],  // REQUIRED - at least one tag
  mediaUrls: [
    {
      url: "https://cloudinary.com/...",
      public_id: "meroroom/..."
    }
  ]
}

Response:
{
  success: true,
  message: "post create sucessfully",
  post: {
    _id: "post123",
    author: {...},
    content: "My first post about Spring Boot...",
    category: "Programming",
    tags: ["SpringBoot", "Java", "Backend"],
    engagementScore: 0,
    reactions: {...},
    stats: {...},
    createdAt: "2024-01-15T10:30:00Z"
  }
}
```

### Create a Blog

**Updated Endpoint - Now Requires Category & Tags**
```
POST /blog/create
Authorization: Bearer <token>
Body: {
  title: "Getting Started with Spring Boot",
  body: "<html>TipTap JSON content...</html>",
  summary: "A beginner's guide...",
  category: "Programming",      // REQUIRED
  tags: ["SpringBoot", "Java", "Microservices"],  // REQUIRED
  status: "published"
}

Response:
{
  success: true,
  message: "Blog created successfully",
  blog: {
    _id: "blog123",
    author: {...},
    title: "Getting Started with Spring Boot",
    category: "Programming",
    tags: ["SpringBoot", "Java", "Microservices"],
    engagementScore: 0,
    stats: {...},
    status: "published",
    publishedAt: "2024-01-15T10:30:00Z"
  }
}
```

---

## Phase 3: User Interactions & Tracking

### Track View

When user views a post or blog:
```
POST /recommendation/track/view
Authorization: Bearer <token>
Body: {
  contentType: "post",    // or "blog"
  contentId: "post123"
}

Response:
{
  success: true,
  message: "View tracked successfully"
}
```

**System Updates:**
- Creates UserInteraction record
- Increments category score by 1
- Increments each tag score by 1

### Track Reaction

When user reacts with emoji:
```
POST /recommendation/track/reaction
Authorization: Bearer <token>
Body: {
  contentType: "post",
  contentId: "post123",
  reactionType: "love"    // one of: like, love, haha, wow, sad, angry
}

Response:
{
  success: true,
  message: "Reaction tracked successfully"
}
```

**System Updates:**
- Creates UserInteraction record
- Increments category score by 8 (for love)
- Increments each tag score by 8
- Updates post engagementScore

### Track Comment

```
POST /recommendation/track/comment
Authorization: Bearer <token>
Body: {
  contentType: "post",
  contentId: "post123"
}

Response:
{
  success: true,
  message: "Comment tracked successfully"
}
```

**System Updates:**
- Category score +10
- Each tag score +10
- Updates engagementScore

### Track Bookmark

```
POST /recommendation/track/bookmark
Authorization: Bearer <token>
Body: {
  contentType: "post",
  contentId: "post123"
}

Response:
{
  success: true,
  message: "Bookmark tracked successfully"
}
```

**System Updates:**
- Category score +15
- Each tag score +15
- Updates engagementScore

### Track Share

```
POST /recommendation/track/share
Authorization: Bearer <token>
Body: {
  contentType: "post",
  contentId: "post123"
}

Response:
{
  success: true,
  message: "Share tracked successfully"
}
```

**System Updates:**
- Category score +20
- Each tag score +20
- Updates engagementScore

### Track Blog Read Progress

```
POST /recommendation/track/blog-read
Authorization: Bearer <token>
Body: {
  contentId: "blog123",
  readPercentage: 75      // 0-100
}

Response:
{
  success: true,
  message: "Blog read tracked successfully"
}
```

**System Updates:**
- If readPercentage >= 75: Category score +15, each tag +15
- If readPercentage >= 50: Category score +10, each tag +10
- If readPercentage >= 25: Category score +5, each tag +5
- If readPercentage < 25: Category score +1, each tag +1

---

## Phase 4: Get Personalized Feed

### Get Feed

```
GET /recommendation/feed?limit=20&page=1
Authorization: Bearer <token>

Response:
{
  success: true,
  data: [
    {
      _id: "post123",
      type: "post",
      content: "My first post...",
      category: "Programming",
      tags: ["Java", "SpringBoot"],
      engagementScore: 45,
      reactions: {...},
      stats: {...},
      createdAt: "2024-01-15T10:30:00Z",
      author: {
        _id: "user456",
        username: "john_doe_1234",
        fullName: "John Doe",
        avatar: "..."
      },
      score: 350.5    // Final ranking score
    },
    {
      _id: "blog456",
      type: "blog",
      title: "Spring Boot Guide",
      category: "Programming",
      tags: ["SpringBoot", "Java"],
      engagementScore: 120,
      stats: {...},
      createdAt: "2024-01-14T15:22:00Z",
      author: {...},
      score: 420.3
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 500
  }
}
```

---

## Client Implementation Example

### Frontend Flow - React

```javascript
// 1. Signup Flow
const handleSignup = async (email, password, name) => {
  // Register user
  const registerRes = await api.post('/auth/signup', {
    email, password, name
  });
  const token = registerRes.data.token;
  
  // Save token to localStorage
  localStorage.setItem('token', token);
  
  // Redirect to interest selection
  navigate('/select-interests');
};

// 2. Interest Selection
const handleSelectInterests = async (selectedInterests) => {
  const response = await api.post(
    '/auth/setup-interests',
    { interests: selectedInterests },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // Redirect to home/feed
  navigate('/feed');
};

// 3. Create Post
const handleCreatePost = async (postData) => {
  const response = await api.post(
    '/post/create',
    {
      content: postData.content,
      category: postData.category,  // REQUIRED
      tags: postData.tags,          // REQUIRED
      mediaUrls: postData.media
    }
  );
  
  console.log('Post created:', response.data.post);
};

// 4. Track Interactions
const handleReaction = async (contentType, contentId, reactionType) => {
  await api.post('/recommendation/track/reaction', {
    contentType,
    contentId,
    reactionType
  });
  
  // Update UI (reaction count already updated on server)
};

const handleBlogScroll = async (contentId, percentage) => {
  await api.post('/recommendation/track/blog-read', {
    contentId,
    readPercentage: percentage
  });
};

// 5. Load Feed
const handleLoadFeed = async (page = 1) => {
  const response = await api.get(
    `/recommendation/feed?limit=20&page=${page}`
  );
  
  setFeedItems(response.data.data);
};
```

---

## Database Changes Required

### New Collections

1. **UserInteraction**
   ```javascript
   {
     user: ObjectId,
     contentType: "post" | "blog",
     contentId: ObjectId,
     action: String,
     reactionType: String,
     category: String,
     tags: [String],
     readPercentage: Number,
     createdAt: Date
   }
   ```

### Schema Updates

**User Model - Add/Ensure:**
```javascript
{
  preferences: {
    interests: [String]
  },
  interestScores: Map<String, Number>,
  contentPreferences: {
    posts: Number,
    blogs: Number
  }
}
```

**Post Model - Add/Ensure:**
```javascript
{
  author: ObjectId,        // Changed from 'user'
  category: String,        // REQUIRED
  tags: [String],          // REQUIRED
  engagementScore: Number,
  reactions: {...}
}
```

**Blog Model - Add/Ensure:**
```javascript
{
  author: ObjectId,
  category: String,        // REQUIRED (was categoryName object)
  tags: [String],          // REQUIRED
  engagementScore: Number
}
```

---

## Migration Steps

If migrating from existing system:

### 1. Update Existing Posts
```javascript
// Add category and tags to old posts
db.posts.updateMany(
  { category: { $exists: false } },
  { 
    $set: { 
      category: "Technology",  // Default category
      tags: []                  // Empty tags
    }
  }
);
```

### 2. Rename 'user' to 'author' in Posts
```javascript
db.posts.updateMany(
  {},
  [{ $rename: { "user": "author" } }]
);
```

### 3. Update Blog Category Structure
```javascript
// Convert from { name: "...", slug: "..." } to simple string
db.blogs.updateMany(
  { "category.name": { $exists: true } },
  [
    {
      $set: {
        category: "$category.name"
      }
    }
  ]
);
```

### 4. Initialize Interest Scores for Existing Users
```javascript
db.users.updateMany(
  { interestScores: { $exists: false } },
  {
    $set: {
      interestScores: {},
      contentPreferences: {
        posts: 50,
        blogs: 50
      }
    }
  }
);
```

---

## Testing Checklist

- [ ] User signup and interest selection works
- [ ] Post creation requires category and tags
- [ ] Blog creation requires category and tags
- [ ] View tracking increments scores correctly
- [ ] Reaction tracking updates engagementScore
- [ ] Feed returns personalized results
- [ ] Feed respects content preferences (post/blog ratio)
- [ ] Following users appear first in feed
- [ ] Fresh content gets higher scores
- [ ] Interest matching works correctly
- [ ] Engagement score calculation is accurate
- [ ] Multiple page requests work with pagination
- [ ] Score updates reflect in next feed request

---

## Performance Optimization

### Indexes to Create

```javascript
// Post
db.posts.createIndex({ author: 1, createdAt: -1 })
db.posts.createIndex({ category: 1, createdAt: -1 })
db.posts.createIndex({ engagementScore: -1 })

// Blog
db.blogs.createIndex({ author: 1, createdAt: -1 })
db.blogs.createIndex({ category: 1, createdAt: -1 })
db.blogs.createIndex({ engagementScore: -1 })

// UserInteraction
db.userinteractions.createIndex({ user: 1, createdAt: -1 })
db.userinteractions.createIndex({ contentId: 1 })
```

### Caching Recommendations

Consider caching feed for 1-5 minutes per user to reduce database hits:

```javascript
// After generating feed, cache it
const cacheKey = `feed:${userId}:${page}`;
await redis.setex(cacheKey, 300, JSON.stringify(feedData));
```

---

## Troubleshooting

### Problem: Feed not returning results
- Check user has selected interests
- Verify posts/blogs exist with matching categories
- Check user.following array is populated
- Verify engagementScore is calculated

### Problem: Interest scores not updating
- Verify interaction tracking endpoint is being called
- Check UserInteraction records are being created
- Verify user document is updated with new scores
- Check category/tags are valid

### Problem: Posts not visible in feed
- Verify post.visibility = "public"
- Check post.status = "active"
- Verify post has category and tags
- Check engagementScore calculation

---

## Next Steps (Phase 2+)

1. Add content moderation
2. Implement trending feeds
3. Add collaborative filtering
4. Implement Redis caching
5. Add analytics/insights
6. Implement recommendation A/B testing
