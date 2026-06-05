# Post Creation Architecture - Complete Reference

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CreatePost.jsx Component                │  │
│  │  • Form: content, category, tags, media files        │  │
│  │  • State: selectedCategory, selectedTags, media      │  │
│  │  • Handlers: uploadToCloudinary(), handleSubmit()    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          cloudinary.js Utility Functions             │  │
│  │  • uploadMultipleToCloudinary(files, options)        │  │
│  │  • Returns: [{url, public_id, format, width, ...}]  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕
                      ⚙️ (2 API CALLS)
                            ↕
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌─────────────────────────┐
│  Cloudinary API      │            │  Backend API (Express)  │
│  POST /v1_1/{cn}/    │            │  POST /post/create      │
│  image/upload        │            │                         │
│                      │            │  Expects:               │
│ Accepts:             │            │  {                      │
│ • file (binary)      │            │   content,              │
│ • upload_preset      │            │   category,             │
│ • folder             │            │   tags,                 │
│                      │            │   mediaUrls: [{         │
│ Returns:             │            │     url,                │
│ • secure_url         │            │     public_id           │
│ • public_id          │            │   }]                    │
│ • format             │            │  }                      │
│ • dimensions         │            │                         │
└──────────────────────┘            └─────────────────────────┘
        ↓                                       ↓
   URLs stored                          POST created with:
   in memory                            • author (from token)
        ↓                               • content
        └───────────────┬───────────────────┘
                        ↓
                  ┌──────────────────┐
                  │  MongoDB Atlas   │
                  │                  │
                  │  Post Collection │
                  │  {               │
                  │   _id,           │
                  │   author,        │
                  │   content,       │
                  │   category,      │
                  │   tags,          │
                  │   media: [{      │
                  │     url: "...",  │
                  │     public_id    │
                  │   }],            │
                  │   createdAt,     │
                  │   stats: {...}   │
                  │  }              │
                  └──────────────────┘
```

---

## Data Flow - Step by Step

### PHASE 1: User Form Input

**Location**: `client/src/pages/CreatePost.jsx`

**State Variables**:
```javascript
content              // textarea: post text (max 2000 chars)
selectedCategory     // string: one of 16 categories (required)
selectedTags         // array: 1-5 tags (required)
media                // array: File objects selected by user
uploadedMedia        // array: Cloudinary results
isPublic             // boolean: visibility (default: true)
```

**16 Categories**:
```
Programming, AI, Technology, Business, Startups, Finance, Science, 
Education, Gaming, Sports, Movies, Music, Travel, Lifestyle, Health, Politics
```

**Tag Suggestions** (based on selected category):
```javascript
'Programming' → ['JavaScript', 'Python', 'React', 'Node.js', ...]
'AI' → ['Machine Learning', 'Deep Learning', 'NLP', ...]
// ... 14 more categories with suggestions
```

---

### PHASE 2: Frontend Image Upload

**Trigger**: User selects files → `handleMediaChange()` called

**Function**: `uploadMultipleToCloudinary(files, options)`

**Code Path**: `client/src/utils/cloudinary.js`

**Process**:
```javascript
1. Create FormData
2. Append each file: formData.append('file', file)
3. Append preset: formData.append('upload_preset', 'meroroom_unsigned')
4. Append folder: formData.append('folder', 'meroroom/posts')

5. POST to: https://api.cloudinary.com/v1_1/djh5owgby/image/upload

6. Parse response:
   {
     "secure_url": "https://res.cloudinary.com/.../image.jpg",
     "public_id": "meroroom/posts/abc123",
     "format": "jpg",
     "width": 1920,
     "height": 1080,
     "bytes": 524288
   }

7. Return: [{url, public_id, format, width, height, bytes}, ...]
```

**Cloudinary Configuration**:
- **Cloud Name**: `djh5owgby`
- **Upload Preset**: `meroroom_unsigned`
- **Preset Mode**: Unsigned (doesn't require API key or signature)
- **Folder**: `meroroom/posts`

**Environment Variables**:
```
VITE_CLOUDINARY_CLOUD_NAME=djh5owgby
VITE_CLOUDINARY_UPLOAD_PRESET=meroroom_unsigned
```

**Security Notes**:
- ✅ Frontend handles all uploads
- ✅ No API key sent from frontend
- ✅ Cloudinary preset is unsigned (safe for frontend)
- ✅ Backend never receives files, only URLs

---

### PHASE 3: Form Submission

**Trigger**: User clicks "Post" button → `handleSubmit()` called

**Validation Checks**:
```javascript
if (!content.trim() && uploadedMedia.length === 0)
  → Alert: "Add some content or media"

if (!selectedCategory)
  → Alert: "Please select a category"

if (selectedTags.length === 0)
  → Alert: "Please add at least one tag"

if (uploading)
  → Alert: "Please wait for images to finish uploading"
```

**Data Structure Sent to Backend**:
```javascript
{
  content: "This is my post...",
  category: "Programming",
  tags: ["JavaScript", "React"],
  isPublic: true,
  mediaUrls: [
    {
      url: "https://res.cloudinary.com/djh5owgby/image/upload/v123/meroroom/posts/abc.jpg",
      public_id: "meroroom/posts/abc"
    },
    {
      url: "https://res.cloudinary.com/djh5owgby/image/upload/v124/meroroom/posts/def.jpg",
      public_id: "meroroom/posts/def"
    }
  ]
}
```

---

### PHASE 4: Redux Thunk Dispatch

**Redux Slice**: `client/src/features/post/postSlice.js`

**Thunk**: `createpost(postData)`

**Implementation**:
```javascript
export const createpost = createAsyncThunk('post/create', async (userData, thunkAPI) => {
  try {
    return await postService.createPost(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
  }
});
```

**Service Call**: `client/src/features/post/postService.js`

```javascript
const createPost = async (postData) => {
  const response = await API.post('/post/create', postData);
  return normalizePost(response.data.post);
};
```

---

### PHASE 5: Backend API Request

**Endpoint**: `POST /post/create`

**Route**: `server/routes/post.routes.js`
```javascript
router.post('/create', verifyToken, createPost);
```

**Middleware**:
- ✅ `verifyToken` - Extracts user ID from JWT token
- ❌ NO file upload middleware (frontend handles Cloudinary)

**Request Body**:
```javascript
{
  content: "This is my post...",
  category: "Programming",
  tags: ["JavaScript", "React"],
  isPublic: true,
  mediaUrls: [
    {url: "https://...", public_id: "meroroom/posts/abc"},
    {url: "https://...", public_id: "meroroom/posts/def"}
  ]
}
```

---

### PHASE 6: Backend Processing

**Controller**: `server/controllers/post.controller.js`

**Function**: `createPost(req, res)`

**Processing Steps**:

1. **Extract Data**:
   ```javascript
   const userId = req.user.id;  // from JWT token
   const { content, category, mediaUrls, tags } = req.body;
   ```

2. **Sanitize Content**:
   ```javascript
   const content = sanitizePlainText(rawContent, 10000);
   // Removes HTML, XSS attempts, max 10,000 chars
   ```

3. **Validate Category**:
   ```javascript
   if (!INTEREST_CATEGORIES.includes(category)) {
     return res.status(400).json({
       message: `Category must be one of: ${INTEREST_CATEGORIES.join(', ')}`
     });
   }
   // 16 valid categories checked
   ```

4. **Validate Content**:
   ```javascript
   if (!content || !content.trim()) {
     return res.status(400).json({
       message: 'Post content is required'
     });
   }
   ```

5. **Process Media URLs**:
   ```javascript
   let mediaArray = [];
   if (mediaUrls && Array.isArray(mediaUrls)) {
     mediaArray = mediaUrls.map(item => ({
       url: item.url || item,      // Cloudinary secure_url
       public_id: item.public_id || ''  // Cloudinary public_id
     }));
   }
   // No file validation or processing needed
   ```

6. **Process Tags**:
   ```javascript
   let tagsArray = [];
   if (Array.isArray(tags)) {
     tagsArray = tags;
   } else if (typeof tags === 'string') {
     tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
   }
   
   tagsArray = tagsArray
     .map(t => sanitizePlainText(String(t), 48))
     .filter(Boolean);
   
   if (tagsArray.length === 0) {
     return res.status(400).json({
       message: 'At least one tag is required'
     });
   }
   ```

7. **Create Post in Database**:
   ```javascript
   const post = await Post.create({
     author: userId,
     content,
     media: mediaArray,      // [{url, public_id}, ...]
     category,
     tags: tagsArray,
     visibility: 'public'
   });
   ```

8. **Update User Stats**:
   ```javascript
   await User.findByIdAndUpdate(userId, { $inc: { 'stats.posts': 1 } });
   ```

9. **Populate Author Info**:
   ```javascript
   const populatedPost = await Post.findById(post._id).populate(
     'author',
     'username profile.fullName profile.avatar'
   );
   ```

10. **Return Response**:
    ```javascript
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost
    });
    ```

---

## Database Schema

### Post Model

**File**: `server/models/post.model.js`

```javascript
{
  _id: ObjectId,
  
  author: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  media: [
    {
      url: String,           // Cloudinary secure_url
      public_id: String,     // Cloudinary public_id
      type: {
        type: String,
        enum: ['image', 'video']
      }
    }
  ],
  
  category: {
    type: String,
    required: true,
    // Must be one of 16 categories
    index: true
  },
  
  tags: [String],  // 1-5 tags
  
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  
  stats: {
    views: Number,
    comments: Number,
    bookmarks: Number,
    shares: Number
  },
  
  reactions: {
    like: Number,
    love: Number,
    haha: Number,
    wow: Number,
    sad: Number,
    angry: Number
  },
  
  totalReactions: Number,
  
  engagementScore: Number,
  
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active'
  },
  
  timestamps: true
}
```

---

## Response Flow

### Backend Response to Frontend
```javascript
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "_id": "507f1f77bcf86cd799439011",
    "author": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "johndoe",
      "profile": {
        "fullName": "John Doe",
        "avatar": "https://..."
      }
    },
    "content": "This is my post...",
    "category": "Programming",
    "tags": ["JavaScript", "React"],
    "media": [
      {
        "url": "https://res.cloudinary.com/.../image.jpg",
        "public_id": "meroroom/posts/abc"
      }
    ],
    "visibility": "public",
    "stats": {
      "views": 0,
      "comments": 0,
      "bookmarks": 0,
      "shares": 0
    },
    "reactions": {
      "like": 0,
      "love": 0
    },
    "totalReactions": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "id": "507f1f77bcf86cd799439011"
  }
}
```

### Redux State Update
```javascript
// postSlice.fulfilled
state.posts.unshift(action.payload);
// New post appears at top of feed
```

### Frontend UI Update
```javascript
// Post automatically renders in feed
// Images load from Cloudinary URLs
// Navigation redirects to home
```

---

## Error Handling

### Frontend Errors

**Upload Errors**:
```javascript
catch (error) {
  console.error('Upload error details:', error);
  alert('Failed to upload images. Please check browser console for details.');
  // Remove failed uploads
  setMedia(prev => prev.filter(m => !newMediaPreviews.includes(m)));
}
```

**Validation Errors**:
```javascript
if (!content.trim() && uploadedMedia.length === 0)
  alert('Add some content or media');

if (!selectedCategory)
  alert('Please select a category');

if (selectedTags.length === 0)
  alert('Please add at least one tag');
```

### Backend Errors

**Validation Errors** (400):
```javascript
{
  "success": false,
  "message": "Category is required and must be one of: Programming, AI, Technology, ..."
}

{
  "success": false,
  "message": "Post content is required"
}

{
  "success": false,
  "message": "At least one tag is required"
}
```

**Server Errors** (500):
```javascript
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Performance Optimization

### Frontend
- ✅ Parallel image uploads to Cloudinary
- ✅ Loading indicators during upload
- ✅ Client-side validation before submit
- ✅ Object URL for image previews (no memory waste)

### Backend
- ✅ No file processing (Cloudinary handles it)
- ✅ Direct URL storage (no image manipulation)
- ✅ Indexed queries by category and author
- ✅ Automatic stats increment

### Cloudinary
- ✅ Automatic image optimization
- ✅ CDN distribution
- ✅ Version control via public_id
- ✅ Lazy loading support

---

## Security Considerations

### Frontend
- ✅ Cloudinary unsigned upload (no API key exposed)
- ✅ Client-side validation
- ✅ Content sanitization on backend

### Backend
- ✅ JWT token verification
- ✅ User authorization (author check on update/delete)
- ✅ Content sanitization (XSS prevention)
- ✅ No direct file access
- ✅ Input validation (category, tags)

### Cloudinary
- ✅ Unsigned preset (no API secret in frontend)
- ✅ Upload restrictions (file type, size)
- ✅ Folder organization (meroroom/posts)

---

## Testing Checklist

- [ ] Select image file
- [ ] Image uploads to Cloudinary (check Network tab)
- [ ] Console shows "Upload successful"
- [ ] Image preview appears
- [ ] Select category
- [ ] Add tags
- [ ] Add content
- [ ] Click Post
- [ ] Backend endpoint called with mediaUrls
- [ ] Post created in database
- [ ] Post appears in feed
- [ ] Images load from Cloudinary
- [ ] User stats increment
- [ ] Category and tags visible

---

## File Reference

| File | Purpose | Status |
|------|---------|--------|
| `client/src/pages/CreatePost.jsx` | Post creation form | ✅ Complete |
| `client/src/utils/cloudinary.js` | Upload utility | ✅ Complete |
| `client/src/features/post/postSlice.js` | Redux state | ✅ Complete |
| `client/src/features/post/postService.js` | API calls | ✅ Complete |
| `server/controllers/post.controller.js` | Business logic | ✅ Complete |
| `server/routes/post.routes.js` | Route definitions | ✅ Complete |
| `server/models/post.model.js` | Database schema | ✅ Complete |
| `client/.env` | Frontend env vars | ✅ Complete |
| `.env` | Backend env vars | ✅ Complete |

---

## Summary

The post creation system is fully functional with:
- ✅ Frontend image upload to Cloudinary
- ✅ Category and tag validation
- ✅ URL-based storage in backend
- ✅ Automatic stats tracking
- ✅ Security best practices
- ✅ Error handling at all layers

