# Interest Selection Notification System

## Overview
Implemented a notification system that prompts users to select their interests after signup/login if they haven't already. This helps personalize their content feed.

## Changes Made

### 1. Backend Changes

#### `server/models/notification.model.js`
- Added new notification type: `'system'` to the enum
- This allows creating system-level notifications separate from user actions

#### `server/controllers/auth.controller.js`
- **After Signup**: Creates a system notification welcoming the user and prompting interest selection
- **After Login**: Checks if user has no interests, sends a reminder notification

```javascript
// After user creation
await pushNotification({
  recipient: user._id,
  actor: user._id,
  type: 'system',
  message: 'Welcome! Please select your interests to get personalized content recommendations.',
});

// After login if no interests
if (!user.preferences?.interests || user.preferences.interests.length === 0) {
  await pushNotification({
    recipient: user._id,
    actor: user._id,
    type: 'system',
    message: 'Select your interests in Settings to get personalized content recommendations.',
  });
}
```

### 2. Frontend Changes

#### `client/src/pages/Notifications.jsx`
- Added handling for `'system'` notification type
- System notifications display with a teal bell icon
- Clicking on a system notification navigates to `/settings`
- System notifications use a teal avatar instead of user avatar

```javascript
// Icon handling
case 'system':
  return <Bell className="w-4 h-4 text-teal-600" />;

// Navigation handling
if (notification.type === 'system') {
  onNavigate('/settings');
}

// Avatar for system notifications
const actorAvatar = notification.type === 'system'
  ? `https://ui-avatars.com/api/?name=System&background=0d9488&color=ffffff`
  : // ... user avatar logic
```

#### `client/src/pages/Settings.jsx`
- Already has the Interests section where users can select/save their interests
- Uses the categories from `client/src/constants/categories.js`
- Saves to backend via `/user/update-interests` endpoint

## User Flow

1. **User Signs Up**
   - Account created ✅
   - System notification created: "Welcome! Please select your interests..."
   - User receives notification in real-time (via SSE)

2. **User Logs In (Without Interests)**
   - Login successful ✅
   - System checks if interests are empty
   - System notification created: "Select your interests in Settings..."
   - User receives notification

3. **User Clicks Notification**
   - Notification marked as read ✅
   - User navigated to `/settings` page
   - Interests section is visible and interactive

4. **User Selects Interests**
   - User selects from 16 categories (Programming, AI, Technology, etc.)
   - Clicks "Save" button
   - Backend updates user preferences ✅
   - Feed becomes personalized based on interests

## Benefits

✅ **Improved Onboarding**: New users are guided to set up their preferences
✅ **Better Engagement**: Personalized feed leads to higher engagement
✅ **User Retention**: Reminder on each login until interests are set
✅ **Clear Call-to-Action**: Direct link from notification to settings
✅ **Non-Intrusive**: Uses existing notification system, doesn't block the UI

## Technical Details

### Notification Model
- **Type**: `system`
- **Actor**: User's own ID (self-notification)
- **Recipient**: User's ID
- **Message**: Custom message with clear CTA
- **No Post/Blog/Comment**: System notifications don't reference content

### API Endpoints Used
- `POST /api/auth/register` - Creates user + notification
- `POST /api/auth/login` - Checks interests + creates notification if needed
- `PUT /api/user/update-interests` - Saves user interests
- `GET /api/notifications` - Fetches all notifications
- `PUT /api/notifications/:id/read` - Marks notification as read

### Real-time Updates
- Uses Server-Sent Events (SSE) via `/notifications/stream`
- Notifications appear immediately without page refresh
- Managed by `notificationSlice` in Redux

## Testing Checklist

- [ ] Register new account → Receives welcome notification
- [ ] Click notification → Navigates to Settings page
- [ ] Select interests → Can select multiple categories
- [ ] Save interests → Success message appears
- [ ] Login without interests → Receives reminder notification
- [ ] Login with interests → No reminder notification
- [ ] Notification appears in real-time
- [ ] Notification is marked as read on click
- [ ] System notification has teal icon and System avatar

## Files Modified

### Backend
1. `server/models/notification.model.js` - Added 'system' type
2. `server/controllers/auth.controller.js` - Added notification creation logic

### Frontend
3. `client/src/pages/Notifications.jsx` - Added system notification handling
4. `client/src/pages/Settings.jsx` - (No changes needed, already functional)

## Future Enhancements

- [ ] Don't show notification if user already has interests
- [ ] Dismiss notification permanently option
- [ ] Show interest selection count in notification
- [ ] Gamify with "Complete your profile" progress bar
- [ ] Suggest interests based on user activity
