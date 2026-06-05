# Feed API Reference - Personalized Recommendation System V1

## Base URL
```
http://localhost:5000/feed
```

---

## Endpoints

### 1. Get Personalized Posts Feed

**GET** `/feed/posts`

Returns a personalized feed of posts based on user interests, following, engagement, and freshness.

#### Authentication
Required. Include JWT token in Authorization header.

#### Query Parameters
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | - | Page number for pagination |
| limit | integer | 20 | 50 | Number of posts per page |

#### Example Request
```bash
GET /feed/posts?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "items": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0",
      "content": "Just learned about Spring Boot microservices!",
      "media": [
        {
          "url": "https://res.cloudinary.com/...",
          "public_id": "posts/xyz123",
          "type": "image"
        }
      ],
      "category": "Programming",
      "tags": ["Java", "SpringBoot", "Microservices"],
      "likesCount": 42,
      "reactions": {
        "like": 30,
        "love": 8,
        "wow": 4
      },
      "commentsCount": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "isLiked": true,
      "userReaction": "like",
      "author": {
        "userId": "65a0b1c2d3e4f5g6h7i8j9",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "https://res.cloudinary.com/..."
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

#### Response Fields

**Root Level**:
- `success` (boolean): Request status
- `items` (array): Array of post objects
- `page` (number): Current page number
- `hasMore` (boolean): Whether more posts are available
- `hasInterests` (boolean): Whether user has set interests
- `meta` (object): Metadata about the feed

**Post Object**:
- `_id` (string): Post ID
- `content` (string): Post text content
- `media` (array): Array of media objects (images/videos)
- `category` (string): Post category (e.g., "Programming")
- `tags` (array): Array of tag strings
- `likesCount` (number): Total number of reactions
- `reactions` (object): Breakdown of reactions by type
- `commentsCount` (number): Number of comments
- `createdAt` (string): ISO 8601 timestamp
- `isLiked` (boolean): Whether current user has reacted
- `userReaction` (string|null): Current user's reaction type
- `author` (object): Post author information
- `_debug` (object): Debug information (scores breakdown)

**Author Object**:
- `userId` (string): Author's user ID
- `username` (string): Author's username
- `fullName` (string): Author's display name
- `avatar` (string|null): Author's avatar URL

**Debug Object** (for monitoring/tuning):
- `finalScore` (number): Total calculated score
- `interestScore` (number): Score from interest matching
- `followingBonus` (number): Bonus for following author
- `engagementBonus` (number): Bonus from post engagement
- `freshnessBonus` (number): Bonus based on post age

#### Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to load posts feed",
  "message": "Detailed error message"
}
```

---

### 2. Get Blogs Feed

**GET** `/feed/blogs`

Returns a feed of published blog articles (chronological for V1).

#### Authentication
Required. Include JWT token in Authorization header.

#### Query Parameters
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | - | Page number for pagination |
| limit | integer | 20 | 50 | Number of blogs per page |

#### Example Request
```bash
GET /feed/blogs?page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "items": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j1",
      "title": "Building Scalable Microservices with Spring Boot",
      "summary": "A comprehensive guide to microservices architecture...",
      "coverImage": {
        "url": "https://res.cloudinary.com/...",
        "public_id": "blogs/abc123"
      },
      "readTime": 8,
      "category": "Programming",
      "tags": ["Java", "SpringBoot", "Microservices", "Architecture"],
      "likesCount": 156,
      "commentsCount": 23,
      "views": 1240,
      "createdAt": "2024-01-14T08:00:00.000Z",
      "publishedAt": "2024-01-14T08:00:00.000Z",
      "isLiked": false,
      "author": {
        "userId": "65a0b1c2d3e4f5g6h7i8j9",
        "username": "tech_blogger",
        "fullName": "Jane Smith",
        "avatar": "https://res.cloudinary.com/..."
      }
    }
  ],
  "page": 1,
  "hasMore": true,
  "meta": {
    "total": 450,
    "returned": 20,
    "feedType": "blogs"
  }
}
```

#### Response Fields

**Blog Object**:
- `_id` (string): Blog ID
- `title` (string): Blog title
- `summary` (string): Short summary/excerpt
- `coverImage` (object): Cover image details
- `readTime` (number): Estimated reading time in minutes
- `category` (string): Blog category
- `tags` (array): Array of tag strings
- `likesCount` (number): Number of likes
- `commentsCount` (number): Number of comments
- `views` (number): Number of views
- `createdAt` (string): ISO 8601 timestamp
- `publishedAt` (string): ISO 8601 timestamp
- `isLiked` (boolean): Whether current user has liked
- `author` (object): Blog author information

---

### 3. Update Interest Scores

**POST** `/feed/interest-scores`

Updates user's interest scores based on their interaction with content.

#### Authentication
Required. Include JWT token in Authorization header.

#### Request Body
```json
{
  "action": "react",
  "category": "Programming",
  "tags": ["Java", "SpringBoot"],
  "reactionType": "love"
}
```

#### Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | string | Yes | Type of interaction (view, like, love, haha, wow, sad, angry, comment, bookmark, share, react) |
| category | string | Yes | Post/blog category |
| tags | array | No | Array of tag strings |
| reactionType | string | No | Specific reaction type (for 'react' action) |

#### Action Score Map
| Action | Category Increment | Per Tag Increment |
|--------|-------------------|-------------------|
| view | +1 | +1 |
| like | +5 | +5 |
| love | +8 | +8 |
| haha | +4 | +4 |
| wow | +6 | +6 |
| sad | +3 | +3 |
| angry | +3 | +3 |
| comment | +10 | +10 |
| bookmark | +15 | +15 |
| share | +20 | +20 |

#### Example Request
```bash
POST /feed/interest-scores
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "action": "bookmark",
  "category": "Programming",
  "tags": ["Java", "SpringBoot", "Microservices"]
}
```

#### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Interest scores updated",
  "interestScores": {
    "Programming": 235,
    "AI": 90,
    "Java": 150,
    "SpringBoot": 120,
    "Microservices": 45,
    "Technology": 180
  }
}
```

#### Response Fields
- `success` (boolean): Request status
- `message` (string): Success message
- `interestScores` (object): Updated interest scores (key-value pairs)

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": "Action and category are required"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "User not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to update interest scores",
  "message": "Detailed error message"
}
```

---

## Example Usage Flows

### Flow 1: Load Personalized Feed
```javascript
// 1. User opens home page
const response = await fetch('/feed/posts?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { items, hasMore, hasInterests } = await response.json();

// 2. Display posts in feed
items.forEach(post => renderPost(post));

// 3. Show interest banner if user has no interests
if (!hasInterests) {
  showInterestBanner();
}
```

### Flow 2: User Reacts to Post
```javascript
// 1. User clicks like button
const postId = '65a1b2c3d4e5f6g7h8i9j0';
const reactionType = 'love';

// 2. Update post reaction
await fetch(`/likes/post/${postId}/react`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ reactionType })
});

// 3. Update interest scores (happens in background)
await fetch('/feed/interest-scores', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'react',
    category: post.category,
    tags: post.tags,
    reactionType: reactionType
  })
});

// 4. Future feeds will be more personalized
```

### Flow 3: Load More Posts (Pagination)
```javascript
let currentPage = 1;

// Load more when user scrolls to bottom
async function loadMorePosts() {
  currentPage++;
  
  const response = await fetch(`/feed/posts?page=${currentPage}&limit=20`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { items, hasMore } = await response.json();
  
  // Append to existing feed
  items.forEach(post => appendPost(post));
  
  // Hide "load more" if no more posts
  if (!hasMore) {
    hideLoadMoreButton();
  }
}
```

---

## Rate Limiting

**Recommendations**:
- Posts feed: 60 requests/minute per user
- Interest scores: 120 requests/minute per user
- Blogs feed: 30 requests/minute per user

*(Not currently implemented - add in production)*

---

## Caching Strategy

**Client-Side**:
- Cache feed data for 5 minutes
- Invalidate on user action (post, like, comment)
- Use `hasInterests` flag to decide cache strategy

**Server-Side** (Future):
- Redis cache for frequently accessed posts
- Cache user interest scores (expire on update)
- Cache following relationships

---

## Monitoring & Analytics

**Metrics to Track**:
- Average response time per endpoint
- Feed personalization effectiveness (click-through rate)
- Interest score distribution per user
- Most popular categories/tags
- Feed diversity (category distribution in results)

**Debug Information**:
- Use `_debug` object in posts for score analysis
- Track score component contributions
- Monitor diversity layer effectiveness
- Analyze freshness bonus impact

---

## Troubleshooting

### Issue: Feed not personalized
**Check**:
1. User has interests set (`hasInterests` = true)
2. User has interestScores accumulated
3. Posts have category and tags
4. Verify interest scores are updating (check API response)

### Issue: Same posts appearing
**Check**:
1. Candidate pool size (should be 500 posts)
2. Diversity layer is working
3. Freshness bonus is being applied
4. Clear client cache and refresh

### Issue: No posts returned
**Check**:
1. Posts exist with `visibility: "public"` and `status: "active"`
2. User is authenticated
3. Database connection is active
4. Check server logs for errors

---

## Version History

- **V1.0** (Current): Personalized posts feed with interest-based ranking
- **V2.0** (Planned): Add personalized blog feed, explore feed ratio, advanced tracking
