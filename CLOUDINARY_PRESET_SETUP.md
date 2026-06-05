# Cloudinary Upload Preset - Configuration Guide

## ⚡ One-Time Setup in Cloudinary Dashboard

### Step 1: Access Cloudinary Dashboard
1. Go to https://cloudinary.com/console
2. Log in with your Cloudinary account
3. You should see your **Cloud Name**: `djh5owgby`

### Step 2: Create Upload Preset

#### Option A: If Preset Doesn't Exist
1. Click **Settings** (gear icon)
2. Go to **Upload** tab
3. Scroll down to **Upload presets**
4. Click **+ Add upload preset**

#### Option B: If Preset Already Exists
1. Click **Settings** → **Upload**
2. Find `meroroom_unsigned` in the list
3. Click on it to edit

### Step 3: Configure Preset Settings

**Field Values**:
```
Preset Name: meroroom_unsigned
Mode: Unsigned ← IMPORTANT!
```

**Optional Settings** (Recommended):
```
Allowed file types: Image only
Max file size: 10 MB
Auto-rename: Yes
Incoming transformation: (leave empty)
Notification URL: (leave empty)
```

### Step 4: Save and Verify

1. Click **Save**
2. You should see: "Successfully created upload preset 'meroroom_unsigned'"
3. In the preset list, confirm the Status shows: "unsigned"

---

## 🔍 Verify Configuration

### Check Preset Mode

**CORRECT** ✅:
```
Preset Name: meroroom_unsigned
Status: unsigned
```

**INCORRECT** ❌:
```
Preset Name: meroroom_unsigned
Status: signed
← This will NOT work with frontend upload!
```

### Check Allowed File Types

**CORRECT** ✅:
- Image (jpg, png, gif, webp, etc.)
- Size limit set appropriately

**INCORRECT** ❌:
- Only specific formats (should allow all images)
- Size limit too small

---

## 📱 Front-End Usage

Once preset is configured, frontend code will:

1. Read environment variables:
   ```javascript
   VITE_CLOUDINARY_CLOUD_NAME=djh5owgby
   VITE_CLOUDINARY_UPLOAD_PRESET=meroroom_unsigned
   ```

2. Upload to Cloudinary:
   ```javascript
   const formData = new FormData();
   formData.append('file', imageFile);
   formData.append('upload_preset', 'meroroom_unsigned');
   formData.append('folder', 'meroroom/posts');
   
   fetch('https://api.cloudinary.com/v1_1/djh5owgby/image/upload', {
     method: 'POST',
     body: formData
   });
   ```

3. Receive response:
   ```json
   {
     "public_id": "meroroom/posts/abc123",
     "secure_url": "https://res.cloudinary.com/djh5owgby/image/upload/v123/meroroom/posts/abc123.jpg",
     "format": "jpg",
     "width": 1920,
     "height": 1080
   }
   ```

4. Send URL to backend:
   ```json
   {
     "mediaUrls": [
       {
         "url": "https://res.cloudinary.com/djh5owgby/image/upload/v123/meroroom/posts/abc123.jpg",
         "public_id": "meroroom/posts/abc123"
       }
     ]
   }
   ```

---

## 🚨 Troubleshooting

### Issue: "Preset 'meroroom_unsigned' not found"

**Solution**:
1. Go to Cloudinary Dashboard
2. Settings → Upload
3. Check if preset exists in the list
4. If not, create it following Step 2-4 above

### Issue: "Not allowed to send api_key in unsigned upload"

**Cause**: Preset is set to "Signed" mode instead of "Unsigned"

**Solution**:
1. Go to Preset settings
2. Change Mode from "Signed" to "Unsigned"
3. Save

### Issue: Upload works locally but not in production

**Possible Causes**:
1. CORS not configured (usually auto-allowed by Cloudinary)
2. Preset name differs between environments
3. Cloud name differs between environments

**Solution**:
1. Verify `VITE_CLOUDINARY_CLOUD_NAME` in production build
2. Verify `VITE_CLOUDINARY_UPLOAD_PRESET` in production build
3. Run: `npm run build` to create production bundle

---

## ✅ Verification Checklist

Before testing upload, verify:

- [ ] I can access Cloudinary Dashboard
- [ ] My Cloud Name is: `djh5owgby`
- [ ] Upload preset `meroroom_unsigned` exists
- [ ] Preset Mode is set to: "unsigned" (NOT "signed")
- [ ] Preset allows image uploads
- [ ] Preset size limit is at least 10 MB
- [ ] Frontend `.env` has `VITE_CLOUDINARY_CLOUD_NAME`
- [ ] Frontend `.env` has `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## 🎯 Next Steps

1. **Set up preset** (if not already done)
2. **Verify configuration** using checklist above
3. **Test upload** following guide in `CLOUDINARY_QUICK_TEST.md`

---

## 📞 Cloudinary Support

If you need help with Cloudinary:
- [Cloudinary Documentation](https://cloudinary.com/documentation/upload_presets)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Unsigned Upload Guide](https://cloudinary.com/documentation/upload_presets#unsigned_upload)

---

## 🔐 Security Note

**Why "Unsigned" Upload?**

- ✅ Frontend can upload without exposing API secret
- ✅ Secure: Only allows uploads to specific folder
- ✅ Controlled: Preset name is like a password
- ✅ Best practice: Frontend code never sees secret keys

**Never do this** ❌:
```javascript
// WRONG! This exposes your API secret!
formData.append('api_secret', 'your-api-secret');
```

**Always use this** ✅:
```javascript
// CORRECT! Unsigned upload (no secret)
formData.append('upload_preset', 'meroroom_unsigned');
```

