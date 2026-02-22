const router = require('express').Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// Send a message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { listingId, recipientId, text } = req.body;
    if (!listingId || !recipientId || !text)
      return res.status(400).json({ message: 'All fields required' });
    if (req.user._id.toString() === recipientId)
      return res.status(400).json({ message: 'Cannot message yourself' });
    const message = await Message.create({
      listing: listingId,
      sender: req.user._id,
      recipient: recipientId,
      text
    });
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');
    await message.populate('listing', 'title');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });

    // Group by listing + other user
    const convMap = {};
    messages.forEach(msg => {
      const otherId = msg.sender._id.toString() === userId.toString()
        ? msg.recipient._id.toString()
        : msg.sender._id.toString();
      const key = `${msg.listing._id}_${otherId}`;
      if (!convMap[key]) {
        convMap[key] = {
          listingId: msg.listing._id,
          listingTitle: msg.listing.title,
          listingImage: msg.listing.images && msg.listing.images[0],
          otherUser: msg.sender._id.toString() === userId.toString() ? msg.recipient : msg.sender,
          lastMessage: msg.text,
          lastDate: msg.createdAt,
          unread: 0,
        };
      }
      if (!msg.read && msg.recipient._id.toString() === userId.toString()) {
        convMap[key].unread++;
      }
    });

    res.json(Object.values(convMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages in a conversation
router.get('/:listingId/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { listingId, otherUserId } = req.params;
    const messages = await Message.find({
      listing: listingId,
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { listing: listingId, sender: otherUserId, recipient: userId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
