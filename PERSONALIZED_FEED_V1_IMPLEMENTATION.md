# Sanjal Posts Feed Recommendation System V1 - Implementation Complete

## Overview
Successfully implemented a personalized posts feed recommendation system based on:
- **User Interests & Interest Scores**
- **User Interaction History**
- **Followed Users**
- **Post Engagement**
- **Post Freshness**

This version handles **Posts only**. Blogs will be added in V2.

---

## Backend Implementation

### 1. Feed Controller (`server/controllers/feed.controller.js`)

#### **Main Algorithm**

**Step 1: Fetch Candidate Posts**
- Query latest 500 posts
- Conditions: `visibility = 'public'`, `status = 'active'`
- Sort by `createdAt DESC`

**Step 2: Calculate Post Scores**
Each post receives a score based on 4 components:

```javascript
finalScore = interestScore + followingBonus + engagementBonus + freshnessBonus
```

**Interest Score** (Most Important):
- Category match: `user.interestScores.get(post.category)` 
- Tag matches: Sum of `user.interestScores.get(tag)` for each tag
- Based on user's accumulated interest scores from past interactions

**Following Bonus**:
- +100 if current user follows the post author
- 0 otherwise

**Engagement Bonus**:
- `post.engagementScore * 0.3`
- Scaled down (30%) to prevent viral content from dominating interest-based content

**Freshness Bonus**:
| Age | Bonus |
|-----|-------|
| 0-1 hour | +50 |
| 1-6 hours | +40 |
| 6-24 hours | +30 |
| 1-3 days | +20 |
| 3-7 days | +10 |
| Older | 0 |

**Step 3: Sort by Final Score**
```javascript
posts.sort((a, b) => b.finalScore - a.finalScore)
```

**Step 4: Diversity Layer**
- Prevents category repetition
- Maximum 3 consecutive posts from same category
- If exceeded, insert next highest ranked post from different category

#### **Key Functions**

```javascript
calculateFreshnessBonus(createdAt) // Returns bonus based on post age
calculatePostScore(post, user, userId) // Returns all score components
applyDiversityLayer(posts) // Prevents category repetition
getPostsFeed(req, res) // Main endpoint handler
```

### 2. Interest Score Updates

**Endpoint**: `POST /feed/interest-scores`

**Score Increments by Action**:
| Action | Category Score | Tag Score |
|--------|---------------|-----------|
| View | +1 | +1 |
| Like | +5 | +5 |
| Love | +8 | +8 |
| Haha | +4 | +4 |
| Wow | +6 | +6 |
| Sad | +3 | +3 |
| Angry | +3 | +3 |
| Comment | +10 | +10 |
| Bookmark | +15 | +15 |
| Share | +20 | +20 |

**Implementation**:
```javascript
updateInterestScores(req, res) {
  // Get action, category, tags, reactionType from request
  // Update user.interestScores Map
  // Increment category score
  // Increment each tag score
}
```

### 3. Routes (`server/routes/feed.routes.js`)

```javascript
GET  /feed/posts              // Personalized posts feed
GET  /feed/blogs              // Blogs feed (simple chronological for now)
POST /feed/interest-scores    // Update user interest scores
```

All routes require authentication (`verifyToken` middleware).

---

## Frontend Implementation

### 1. Post Service (`client/src/features/post/postService.js`)

**Updated `fetchFeed` Function**:
```javascript
const fetchFeed = async ({ feedType = 'posts', page = 1, limit = 15 }) => {
  // Calls /feed/posts or /feed/blogs
  // Returns: items, hasMore, page, total, hasInterests
}
```

**New `updateInterestScores` Function**:
```javascript
const updateInterestScores = async ({ action, category, tags, reactionType }) => {
  // Calls POST /feed/interest-scores
  // Tracks user interactions for personalization
}
```

### 2. SimplePostCard Component

**Interest Score Tracking**:
- Tracks reactions (like, love, haha, wow, sad, angry)
- Tracks bookmarks
- Automatically updates backend interest scores on user interaction

**Implementation**:
```javascript
// On reaction
handleReact() {
  // ... dispatch reactToPost
  await postService.updateInterestScores({
    action: 'react',
    category: post.category,
    tags: post.tags || [],
    reactionType: type
  });
}

// On bookmark
handleBookmark() {
  // ... dispatch toggleBookmark
  await postService.updateInterestScores({
    action: 'bookmark',
    category: post.category,
    tags: post.tags || []
  });
}
```

### 3. Home Page (`client/src/pages/Home.jsx`)

**No changes required** - Already compatible with new API format:
- Uses `getFeed` thunk from postSlice
- Displays personalized feed automatically
- Shows interest banner if user has no interests set

---

## Data Models

### User Model (`server/models/user.model.js`)

**Interest-Related Fields**:
```javascript
{
  preferences: {
    interests: [String]  // Static interests: ["Programming", "AI", "Technology"]
  },
  
  interestScores: {
    type: Map,
    of: Number,
    default: {}
  }
  // Dynamic scores: { "Programming": 180, "AI": 90, "Java": 120, "SpringBoot": 80 }
}
```

### Post Model (`server/models/post.model.js`)

**Relevant Fields**:
```javascript
{
  category: String,           // e.g., "Programming"
  tags: [String],            // e.g., ["Java", "SpringBoot"]
  engagementScore: Number,   // Pre-calculated engagement metric
  visibility: String,        // "public", "followers", "private"
  status: String,           // "active", "hidden", "deleted"
  createdAt: Date,
  author: ObjectId          // Reference to User
}
```

---

## API Response Format

### GET /feed/posts

**Response**:
```json
{
  "success": true,
  "items": [
    {
      "_id": "postId",
      "content": "Post content",
      "media": [],
      "category": "Programming",
      "tags": ["Java", "SpringBoot"],
      "likesCount": 42,
      "reactions": { "like": 30, "love": 12 },
      "commentsCount": 5,
      "createdAt": "2024-01-15T10:30:00Z",
      "isLiked": true,
      "userReaction": "like",
      "author": {
        "userId": "authorId",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "https://..."
      },
      "_debug": {
        "finalScore": 285,
        "interestScore": 200,
        "followingBonus": 0,
        "engagementBonus": 35,
        "freshnessBonus": 50
      }
    }
  ],
  "page": 1,
  "hasMore": true,
  "hasInterests": true,
  "meta": {
    "totalCandidates": 500,
    "returned": 20,
    "feedType": "personalized"
  }
}
```

### POST /feed/interest-scores

**Request**:
```json
{
  "action": "react",
  "category": "Programming",
  "tags": ["Java", "SpringBoot"],
  "reactionType": "love"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interest scores updated",
  "interestScores": {
    "Programming": 208,
    "Java": 128,
    "SpringBoot": 88,
    "AI": 90
  }
}
```

---

## Cold Start Handling

**For New Users** (no interaction history):
- System falls back to `preferences.interests` only
- Formula: `interestScore = category match + tag matches`
- No personalization history needed initially
- Scores build up as user interacts with content

---

## Pagination

**Cursor-Based Pagination**:
```
GET /feed/posts?page=1&limit=20
```

**Defaults**:
- `limit`: 20 posts per request
- `page`: 1 (first page)
- Maximum `limit`: 50

**Never fetch all posts at once** - improves performance and user experience.

---

## Testing the System

### 1. Backend Testing

```bash
# Start the server
cd server
npm start

# Test the personalized feed endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/feed/posts?page=1&limit=20

# Test interest score update
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"like","category":"Programming","tags":["Java"]}' \
  http://localhost:5000/feed/interest-scores
```

### 2. Frontend Testing

1. **Login** to the application
2. **Navigate** to Home page
3. **Interact** with posts (like, react, bookmark)
4. **Refresh** feed - should see personalized content based on interactions
5. **Check** browser console for debug scores (in `_debug` field)

### 3. Verify Personalization

1. **Set interests** in user settings
2. **Create posts** with matching categories/tags
3. **Follow users** - their posts should rank higher
4. **React differently** - notice score changes
5. **Test freshness** - new posts should rank higher

---

## Next Steps (V2)

- [ ] Add personalized **Blog feed**
- [ ] Implement **Explore Feed Ratio** (50% Interest, 30% Following, 20% Trending)
- [ ] Add **view tracking** for interest scores
- [ ] Implement **comment tracking** for interest scores
- [ ] Add **share tracking** for interest scores
- [ ] Create **admin dashboard** to view user interest scores
- [ ] Add **A/B testing** for algorithm tuning
- [ ] Implement **collaborative filtering** (users with similar interests)
- [ ] Add **content decay** (older interest scores decay over time)
- [ ] Implement **negative signals** (hide, report = decrease interest)

---

## Files Modified

### Backend
- ✅ `server/controllers/feed.controller.js` - Complete rewrite with new algorithm
- ✅ `server/routes/feed.routes.js` - Added interest-scores route
- ✅ `server/models/user.model.js` - Already had interestScores field

### Frontend
- ✅ `client/src/features/post/postService.js` - Updated API calls
- ✅ `client/src/components/posts/SimplePostCard.jsx` - Added interest tracking
- ℹ️ `client/src/pages/Home.jsx` - No changes needed (already compatible)

---

## Summary

The **Sanjal Posts Feed Recommendation System V1** is now **fully implemented and operational**. The system:

✅ Generates personalized feeds based on user interests and interactions  
✅ Tracks user interactions to build interest profiles  
✅ Balances interest-based ranking with freshness and engagement  
✅ Prevents category monotony with diversity layer  
✅ Supports cold start for new users  
✅ Uses efficient cursor-based pagination  
✅ Includes debug information for monitoring  

The feed will get smarter over time as users interact with content, building a comprehensive interest profile that powers highly personalized content discovery.
