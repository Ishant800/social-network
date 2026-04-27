const Notification = require('../models/notification.model');

// SSE client registry: { userId: res }
const sseClients = {};

// Called by other controllers to push a notification
async function pushNotification({ recipient, actor, type, post, blog, comment, message }) {
  // Don't notify yourself for user actions (but allow system notifications)
  if (type !== 'profile_incomplete' && String(recipient) === String(actor)) return;

  try {
    const notif = await Notification.create({
      recipient,
      actor: actor || recipient, // For system notifications, actor can be the user themselves
      type,
      post:    post    || null,
      blog:    blog    || null,
      comment: comment || null,
      message: message || null,
    });

    const populated = await notif.populate('actor', 'username profile.avatar profile.fullName');

    // If the recipient has an active SSE connection, push immediately
    const clientRes = sseClients[String(recipient)];
    if (clientRes) {
      clientRes.write(`data: ${JSON.stringify(populated)}\n\n`);
    }
  } catch (err) {
    console.error('pushNotification error:', err);
  }
}

// GET /notifications/stream  — SSE stream (read-only, server → client)
const streamNotifications = (req, res) => {
  // Token can come from either Authorization header or query param (for EventSource)
  let userId;
  
  if (req.user && req.user.id) {
    // Token was validated by middleware
    userId = String(req.user.id);
  } else {
    // For EventSource which can't send headers, we allow token in query
    // This is already handled by the verifyToken middleware if configured properly
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx passthrough

  // Send a keep-alive comment every 25 s
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25_000);

  // Register this client
  sseClients[userId] = res;

  // On close, clean up
  req.on('close', () => {
    clearInterval(heartbeat);
    delete sseClients[userId];
  });
};

// GET /notifications  — paginated list
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'username profile.avatar profile.fullName'),
      Notification.countDocuments({ recipient: userId }),
    ]);

    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    res.json({ success: true, notifications, total, unreadCount, page, limit });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT /notifications/read  — mark all as read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// PUT /notifications/:id/read  — mark single as read
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  pushNotification,
  streamNotifications,
  getNotifications,
  markAllRead,
  markOneRead,
};
