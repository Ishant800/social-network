# Cloudinary Upload Troubleshooting Guide

## Issue: "Failed to upload photo"

### Root Causes & Solutions

---

## 1. API Key in Request (FIXED ✅)

**Problem:**
- Sending API key with unsigned upload preset causes rejection
- Unsigned uploads don't need/shouldn't include API key

**Solution Applied:**
- ✅ Removed `api_key` from FormData in `cloudinary.js`
- ✅ Removed from `.env` file (not needed for unsigned uploads)
- ✅ Updated code to use only `upload_preset`

**Files Updated:**
- `client/src/utils/cloudinary.js` - Removed API key
- `client/.env` - Removed VITE_CLOUDINARY_API_KEY

---

## 2. Upload Preset Configuration

**Check Your Cloudinary Setup:**

1. Go to Cloudinary Dashboard
2. Settings → Upload
3. Check Upload presets section
4. Find preset: `meroroom_unsigned`
5. Verify:
   - ✅ Signing Mode: Unsigned
   - ✅ Folder: `meroroom/posts`
   - ✅ Allowed file types: Images

**If preset missing:**
1. Create new upload preset
2. Name: `meroroom_unsigned`
3. Signing Mode: Unsigned
4. Save

---

## 3. Environment Variables

**Verify in `client/.env`:**
```
VITE_CLOUDINARY_CLOUD_NAME=djh5owgby
VITE_CLOUDINARY_UPLOAD_PRESET=meroroom_unsigned
```

**Note:** No API_KEY needed for unsigned uploads

---

## 4. Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Try uploading a file
4. Look for error messages:
   - "error_code" from Cloudinary
   - "error_description"

### Step 2: Check Network Tab
1. DevTools → Network tab
2. Select "Fetch/XHR" filter
3. Upload a file
4. Look for request to `api.cloudinary.com`
5. Click the request and check:
   - **Status:** Should be 200
   - **Response:** Look for `public_id` field

### Step 3: Console Logging (Already Added)
The code now logs:
```javascript
console.log('Starting upload for', files.length, 'files...');
console.log('Upload successful:', uploadResults);
console.error('Upload error details:', error);
```

---

## 5. Common Errors & Solutions

### Error: "Invalid upload preset"
**Cause:** Preset name doesn't match or doesn't exist

**Solution:**
1. Check preset name in Cloudinary console
2. Update `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`
3. Restart dev server

### Error: "Authorization header required"
**Cause:** Code trying to use signed upload without API key

**Solution:**
- Using unsigned preset ✅ (no key needed)
- Verify preset signing mode is "Unsigned"

### Error: "Invalid image file"
**Cause:** File format not allowed

**Solution:**
- Upload only: PNG, JPG, JPEG, GIF, WEBP
- Check file isn't corrupted
- Verify file size is reasonable

### Error: CORS Error
**Cause:** Browser blocking cross-origin request

**Solution:**
- Cloudinary CORS is enabled by default ✅
- Check browser console for full error
- Ensure `VITE_CLOUDINARY_CLOUD_NAME` is correct

### Error: "Timeout"
**Cause:** Network issue or large file

**Solution:**
- Check internet connection
- Try smaller image file
- Try different network

---

## 6. Testing Upload

### Manual Test
1. Create simple HTML test file:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test Upload</title>
</head>
<body>
    <input type="file" id="file" accept="image/*" />
    <button onclick="upload()">Upload</button>
    <script>
        async function upload() {
            const file = document.getElementById('file').files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'meroroom_unsigned');
            formData.append('folder', 'meroroom/posts');
            
            const response = await fetch(
                'https://api.cloudinary.com/v1_1/djh5owgby/image/upload',
                { method: 'POST', body: formData }
            );
            console.log(await response.json());
        }
    </script>
</body>
</html>
```

---

## 7. Debug Output Example

**Successful Upload (Browser Console):**
```
Starting upload for 1 files to folder: meroroom/posts
Upload successful: [
  {
    url: "https://res.cloudinary.com/djh5owgby/image/upload/.../image.jpg",
    public_id: "meroroom/posts/image123",
    format: "jpg",
    width: 1000,
    height: 800,
    bytes: 245000
  }
]
```

**Failed Upload (Browser Console):**
```
Starting upload for 1 files to folder: meroroom/posts
Upload error details: Error: error_code: 400
Cloudinary error response: {
  error: {
    message: "Invalid upload preset",
    http_code: 400
  }
}
```

---

## 8. Quick Checklist

- [ ] `.env` has correct `VITE_CLOUDINARY_CLOUD_NAME`
- [ ] `.env` has correct `VITE_CLOUDINARY_UPLOAD_PRESET`
- [ ] `.env` does NOT have `VITE_CLOUDINARY_API_KEY` (removed)
- [ ] Cloudinary preset exists and is Unsigned
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows successful response from Cloudinary
- [ ] Response includes `public_id` and `secure_url`
- [ ] Dev server restarted after .env changes

---

## 9. If Still Not Working

### Enable Full Error Response
In `client/src/utils/cloudinary.js`, temporarily modify:

```javascript
if (!response.ok) {
  const error = await response.json();
  console.log('Full Cloudinary Response:', error);  // Add this line
  throw new Error(error.error?.message || `Upload failed with status ${response.status}`);
}
```

Then:
1. Try uploading
2. Check browser console
3. Copy full error response
4. Share the error details

### Check Cloudinary Logs
1. Cloudinary Dashboard
2. Media Library → Upload activity
3. Look for failed uploads
4. Check why they failed

---

## 10. Working Solution Summary

**File Changes Made:**
1. ✅ Removed API key from upload request
2. ✅ Added better error logging
3. ✅ Removed API key from .env
4. ✅ Improved error messages

**What to Check:**
1. Verify Cloudinary credentials
2. Check browser console for errors
3. Verify preset exists and is Unsigned
4. Restart dev server after env changes

---

## Support

If upload still fails after checking above:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Try uploading a file**
4. **Copy the error message**
5. **Check Network tab** for Cloudinary response
6. **Share the error details** for debugging

The console now logs:
- File count
- Cloudinary request details
- Upload success/failure with full error
- Error response from Cloudinary
