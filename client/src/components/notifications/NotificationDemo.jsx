import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';

export default function NotificationDemo() {
  const triggerNotification = (type) => {
    if (window.showNotification) {
      const mockNotification = {
        _id: Date.now().toString(),
        type,
        actor: {
          _id: 'demo-user',
          username: 'demo_user',
          profile: {
            fullName: 'Demo User',
            avatar: {
              url: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=ffffff'
            }
          }
        },
        post: type !== 'follow' ? 'demo-post-id' : null,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      window.showNotification(mockNotification);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the buttons below to test different notification types:
      </p>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => triggerNotification('like')}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Heart className="w-4 h-4" />
          Like Notification
        </button>
        
        <button
          onClick={() => triggerNotification('comment')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Comment Notification
        </button>
        
        <button
          onClick={() => triggerNotification('follow')}
          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Follow Notification
        </button>
      </div>
    </div>
  );
}