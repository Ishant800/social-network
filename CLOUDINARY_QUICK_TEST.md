# Cloudinary Upload - Quick Test Guide

## ⚡ Fast Verification (5 minutes)

### Step 1: Start Frontend
```bash
cd client
npm run dev
# Opens http://localhost:5173
```

### Step 2: Open CreatePost
- Navigate to Create Post page
- Open browser DevTools (F12)
- Go to Console tab

### Step 3: Test Upload
1. Select 1-3 images from your computer
2. **Watch Console Output** for:
   ```
   ✅ "Starting upload for 3 files to folder: meroroom/posts"
   ✅ "Upload successful: [{url: '...', public_id: '...'}]"
   ```

3. Check **Network Tab** (F12 → Network):
   - Look for requests to `api.cloudinary.com`
   - Should be **POST** requests
   - Status should be **200**

### Step 4: Submit Post
1. Add content (required)
2. Select a category (required)
3. Add 1-5 tags (required)
4. Click "Post"

### Step 5: Verify Success
- Post should appear in feed
- Images should load
- Check Network tab - no errors

---

## 🔍 Detailed Troubleshooting

### Scenario 1: Upload Fails Immediately
**Console shows**: `Upload failed with status 400`

**Fix**:
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Click Settings → Upload
3. Look for upload preset: `meroroom_unsigned`
4. If it doesn't exist, click "Add upload preset"
   - Name: `meroroom_unsigned`
   - Unsigned mode: **ON**
   - Save
5. Try upload again

### Scenario 2: No Console Logs
**Upload button disappears but nothing happens**

**Check**:
1. Open Network tab (F12)
2. Select images
3. Do you see network requests to Cloudinary?
   - **YES** → Check for error responses
   - **NO** → JavaScript error (check Console tab for red errors)

### Scenario 3: Upload Works, Post Creation Fails
**Console shows**: `Upload successful` but then `Failed to create post`

**Likely causes**:
1. Category not selected → Select category in dropdown
2. No tags → Add at least 1 tag
3. Content empty → Add post content
4. Backend error → Check Network tab → Response body

---

## 📊 What Should Happen

### Upload Phase
```
User selects file
    ↓
Console: "Starting upload for 1 files..."
    ↓
Network: POST to api.cloudinary.com (status 200)
    ↓
Console: "Upload successful: [{url: 'https://...'}]"
    ↓
Image preview shows in UI
    ↓
Upload button shows "Add Photo" again
```

### Post Creation Phase
```
User clicks "Post"
    ↓
Validation checks (content, category, tags)
    ↓
Network: POST to localhost:5000/post/create
    ↓
Response: {success: true, post: {...}}
    ↓
Redirect to home page
    ↓
Post appears in feed with images
```

---

## 🧪 Manual Test in Browser Console

Paste this in browser console (F12 → Console) to test Cloudinary directly:

```javascript
// Create a test image blob
const canvas = document.createElement('canvas');
canvas.width = 100;
canvas.height = 100;
canvas.getContext('2d').fillStyle = 'blue';
canvas.getContext('2d').fillRect(0, 0, 100, 100);

canvas.toBlob(async (blob) => {
  const file = new File([blob], 'test.jpg', {type: 'image/jpeg'});
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'meroroom_unsigned');
  formData.append('folder', 'meroroom/posts');
  
  try {
    console.log('🔄 Uploading test image...');
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/djh5owgby/image/upload',
      { method: 'POST', body: formData }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Upload failed:', data);
    } else {
      console.log('✅ Upload successful!');
      console.log('URL:', data.secure_url);
      console.log('Public ID:', data.public_id);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
});
```

**Expected Output**:
```
🔄 Uploading test image...
✅ Upload successful!
URL: https://res.cloudinary.com/djh5owgby/image/upload/.../test.jpg
Public ID: meroroom/posts/test
```

---

## 📋 Checklist Before Testing

- [ ] Backend server running (`npm start` in `server` folder)
- [ ] Frontend dev server running (`npm run dev` in `client` folder)
- [ ] Browser can access http://localhost:5173
- [ ] Cloudinary upload preset `meroroom_unsigned` exists
- [ ] Preset is set to "Unsigned" mode
- [ ] Browser DevTools available (F12)

---

## 🐛 If Nothing Works

1. **Clear browser cache**
   - F12 → Application → Clear storage → Clear all
   - Refresh page (Ctrl+Shift+R)

2. **Restart servers**
   - Stop both servers (Ctrl+C)
   - Delete `node_modules` in both `client` and `server`
   - Run `npm install` in both
   - Restart servers

3. **Check environment variables**
   ```bash
   # In client folder
   cat .env
   # Should show:
   # VITE_CLOUDINARY_CLOUD_NAME=djh5owgby
   # VITE_CLOUDINARY_UPLOAD_PRESET=meroroom_unsigned
   ```

4. **Verify Cloudinary account**
   - Cloud name: `djh5owgby`
   - Logged into correct account
   - Upload preset exists

---

## ✅ Success Indicators

- [ ] Images upload quickly (< 2 seconds)
- [ ] Console shows "Upload successful"
- [ ] Image preview appears in UI
- [ ] Post creation doesn't fail
- [ ] Post appears in feed
- [ ] Images load from Cloudinary URL

---

## 📞 Need Help?

Check these files:
1. `CLOUDINARY_SETUP_VERIFICATION.md` - Complete setup reference
2. `client/.env` - Environment variables
3. Browser Console (F12) - Error messages
4. Network Tab (F12) - API responses

