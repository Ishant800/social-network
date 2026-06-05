# Feed Recommendation System - API Reference

## Authentication

All endpoints (except signup/login) require authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST /auth/signup
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGc..."
}
```

**Status Codes:**
- 201: User created successfully
- 400: Email already in use or invalid password
- 500: Server error

---

### POST /auth/setup-interests
Initialize user interests after signup.

**Request:**
```json
{
  "interests": ["Programming", "AI", "Technology"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interests set up successfully",
  "data": {
    "interests": ["Programming", "AI", "Technology"],
    "interestScores": {
      "Programming": 50,
      "AI": 50,
      "Technology": 50
    }
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid interests
- 404: User not found
- 500: Server error

**Valid Interests:**
```
Programming, AI, Technology, Business, Startups, Finance, Science,
Education, Gaming, Sports, Movies, Music, Travel, Lifestyle, Health, Politics
```

---

## Post Endpoints

### POST /post/create
Create a new post.

**Request:**
```json
{
  "content": "This is my post content",
  "category": "Programming",
  "tags": ["Java", "SpringBoot", "Backend"],
  "mediaUrls": [
    {
      "url": "https://...",
      "public_id": "meroroom/..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "post create sucessfully",
  "post": {
    "_id": "...",
    "author": {...},
    "content": "...",
    "category": "Programming",
    "tags": ["Java", "SpringBoot", "Backend"],
    "engagementScore": 0,
    ...
  }
}
```

**Status Codes:**
- 201: Post created
- 400: Missing required fields or invalid category
- 404: User not found
- 500: Server error

**Required Fields:**
- content: String (required, max 2000 chars)
- category: String (required, must be valid category)
- tags: Array (required, at least 1 tag)

---

### GET /post/posts/:postId
Get post details.

**Response:**
```json
{
  "success": true,
  "post": {...},
  "comments": [...]
}
```

---

### PUT /post/:postId
Update a post.

**Request:**
```json
{
  "content": "Updated content",
  "category": "Technology",
  "tags": ["Tag1", "Tag2"]
}
```

**Status Codes:**
- 200: Post updated
- 403: Unauthorized
- 404: Post not found
- 500: Server error

---

### DELETE /post/:postId
Delete a post.

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Status Codes:**
- 200: Post deleted
- 403: Unauthorized
- 404: Post not found
- 500: Server error

---

## Blog Endpoints

### POST /blog/create
Create a new blog.

**Request:**
```json
{
  "title": "My Blog Post",
  "body": "<html>TipTap content...</html>",
  "summary": "Brief summary",
  "category": "Technology",
  "tags": ["TypeScript", "Node.js"],
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog created successfully",
  "blog": {
    "_id": "...",
    "title": "My Blog Post",
    "category": "Technology",
    "tags": ["TypeScript", "Node.js"],
    "engagementScore": 0,
    ...
  }
}
```

**Status Codes:**
- 201: Blog created
- 400: Missing required fields
- 500: Server error

**Required Fields:**
- title: String
- body: String
- category: String (valid category)
- tags: Array (at least 1 tag)

---

### GET /blog/:blogId
Get blog details.

**Response:**
```json
{
  "success": true,
  "blog": {...}
}
```

---

### PUT /blog/:blogId
Update a blog.

**Request:**
```json
{
  "title": "Updated Title",
  "category": "Science",
  "tags": ["Physics", "Quantum"]
}
```

---

### DELETE /blog/:blogId
Delete a blog.

---

## Recommendation/Feed Endpoints

### GET /recommendation/feed
Get personalized feed.

**Query Parameters:**
- `limit`: Number (default: 20, max: 50)
- `page`: Number (default: 1)

**Example:**
```
GET /recommendation/feed?limit=20&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "post",
      "content": "...",
      "category": "Programming",
      "tags": ["Java", "SpringBoot"],
      "engagementScore": 45,
      "author": {...},
      "score": 350.5
    },
    {
      "_id": "...",
      "type": "blog",
      "title": "...",
      "category": "Technology",
      "tags": ["Node.js"],
      "engagementScore": 120,
      "author": {...},
      "score": 420.3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
```

**Status Codes:**
- 200: Success
- 404: User not found
- 500: Server error

---

### POST /recommendation/track/view
Track content view.

**Request:**
```json
{
  "contentType": "post",
  "contentId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

**Status Codes:**
- 201: View tracked
- 400: Invalid input
- 404: Content not found
- 500: Server error

---

### POST /recommendation/track/reaction
Track reaction to content.

**Request:**
```json
{
  "contentType": "post",
  "contentId": "...",
  "reactionType": "love"
}
```

**Valid Reaction Types:**
```
like, love, haha, wow, sad, angry
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction tracked successfully"
}
```

---

### POST /recommendation/track/comment
Track comment on content.

**Request:**
```json
{
  "contentType": "post",
  "contentId": "..."
}
```

---

### POST /recommendation/track/bookmark
Track bookmark.

**Request:**
```json
{
  "contentType": "post",
  "contentId": "..."
}
```

---

### POST /recommendation/track/share
Track share.

**Request:**
```json
{
  "contentType": "post",
  "contentId": "..."
}
```

---

### POST /recommendation/track/blog-read
Track blog read progress.

**Request:**
```json
{
  "contentId": "...",
  "readPercentage": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "Blog read tracked successfully"
}
```

**Status Codes:**
- 201: Success
- 400: Invalid read percentage
- 404: Blog not found
- 500: Server error

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Status Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Not authorized to perform action |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error |

---

## Rate Limiting

API is rate limited to **200 requests per minute** per IP address.

When rate limited, response will include:
```
429 Too Many Requests
```

---

## Response Headers

All responses include standard HTTP headers:

```
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:5173
```

---

## Pagination

For paginated endpoints:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500
  }
}
```

- **page**: Current page (1-indexed)
- **limit**: Items per page (1-50)
- **total**: Total count of items

---

## Sorting

Feed results are sorted by final score (descending):

```
finalScore = interestScore + followingBonus + engagementScore + freshnessScore
```

---

## Caching Headers

Feed responses include cache headers:

```
Cache-Control: no-cache, no-store, must-revalidate
```

---

## CORS

CORS is enabled for:
- **Origin:** http://localhost:5173
- **Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers:** Content-Type, Authorization

---

## Webhook Notifications (Future)

Currently not implemented. Will support:
- Post engagement milestones
- New follower notifications
- Trending content alerts

---

## API Versioning

Current version: **v1** (implicit)

Future versions will use:
```
GET /api/v2/recommendation/feed
```

---

## Rate Limit Examples

### Successful Request
```
HTTP/1.1 200 OK
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 199
X-RateLimit-Reset: 1641234567
```

### Rate Limited
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Testing with cURL

### Get Feed
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/recommendation/feed?limit=20&page=1
```

### Track View
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType":"post","contentId":"123"}' \
  http://localhost:5000/recommendation/track/view
```

### Create Post
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content":"My post",
    "category":"Technology",
    "tags":["Node.js"]
  }' \
  http://localhost:5000/post/create
```

---

## WebSocket Events (Future)

Planned WebSocket events:
- `post:created` - New post from followed user
- `feed:updated` - Feed recalculated
- `engagement:changed` - Post engagement changed

---

## Changelog

### v1.0.0 (Current)
- Initial release
- Personalized feed generation
- Interest score tracking
- Engagement scoring
- User interaction logging

### v1.1.0 (Planned)
- Trending feed improvements
- Advanced filtering
- Feed caching
- Analytics dashboard

---

## Support

For issues or questions:
- Check API Reference above
- Review Integration Guide
- Check Feed System Documentation
- Contact development team

---

## Rate Limit Strategy

Rate limiting uses token bucket algorithm:
- **Window:** 60 seconds
- **Limit:** 200 requests
- **Refill:** 200 tokens every 60 seconds
