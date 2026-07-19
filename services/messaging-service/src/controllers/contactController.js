/**
 * Contact Controller
 * Handles contact management - add, remove, search, block
 */

const Contact = require('../models/Contact');
const User = require('../models/User'); // Assuming you have a User model

/**
 * Get user's contacts
 */
exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const contacts = await Contact.find({
      user: userId,
      status: 'accepted'
    })
      .populate('contact', 'name email username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message
    });
  }
};

/**
 * Search users to add as contacts
 */
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.userId;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search for users by name, email, or username
    const users = await User.find({
      _id: { $ne: userId }, // Exclude current user
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
      .select('name email username profilePicture')
      .limit(20);

    // Check which users are already contacts
    const contactIds = await Contact.find({
      user: userId,
      contact: { $in: users.map(u => u._id) }
    }).select('contact status');

    const contactMap = {};
    contactIds.forEach(c => {
      contactMap[c.contact.toString()] = c.status;
    });

    // Add contact status to each user
    const usersWithStatus = users.map(user => ({
      ...user.toObject(),
      contactStatus: contactMap[user._id.toString()] || 'none'
    }));

    res.json({
      success: true,
      data: usersWithStatus
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

/**
 * Send contact request
 */
exports.sendContactRequest = async (req, res) => {
  try {
    const { contactId } = req.body;
    const userId = req.user.userId;

    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID is required'
      });
    }

    if (contactId === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot add yourself as a contact'
      });
    }

    // Check if contact already exists
    const existing = await Contact.findOne({
      user: userId,
      contact: contactId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.status === 'pending' 
          ? 'Contact request already sent'
          : 'User is already in your contacts'
      });
    }

    // Create contact request
    const contact = await Contact.create({
      user: userId,
      contact: contactId,
      status: 'pending',
      initiatedBy: userId
    });

    // Create reverse contact entry (so recipient can see the request)
    await Contact.create({
      user: contactId,
      contact: userId,
      status: 'pending',
      initiatedBy: userId
    });

    const populatedContact = await Contact.findById(contact._id)
      .populate('contact', 'name email username profilePicture');

    // TODO: Send notification to the recipient
    // notificationService.send(contactId, {
    //   type: 'contact_request',
    //   from: userId,
    //   message: 'You have a new contact request'
    // });

    res.json({
      success: true,
      message: 'Contact request sent successfully',
      data: populatedContact
    });
  } catch (error) {
    console.error('Send contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send contact request',
      error: error.message
    });
  }
};

/**
 * Get pending contact requests
 */
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get requests where user is the recipient (not initiator)
    const requests = await Contact.find({
      user: userId,
      status: 'pending',
      initiatedBy: { $ne: userId }
    })
      .populate('contact', 'name email username profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests',
      error: error.message
    });
  }
};

/**
 * Accept contact request
 */
exports.acceptContactRequest = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;

    // Update both contact entries
    await Contact.updateMany(
      {
        $or: [
          { user: userId, contact: contactId },
          { user: contactId, contact: userId }
        ]
      },
      { status: 'accepted', acceptedAt: new Date() }
    );

    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    }).populate('contact', 'name email username profilePicture');

    // TODO: Send notification to the requester
    // notificationService.send(contactId, {
    //   type: 'contact_accepted',
    //   from: userId,
    //   message: 'Your contact request was accepted'
    // });

    res.json({
      success: true,
      message: 'Contact request accepted',
      data: contact
    });
  } catch (error) {
    console.error('Accept contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept contact request',
      error: error.message
    });
  }
};

/**
 * Reject contact request
 */
exports.rejectContactRequest = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;

    // Delete both contact entries
    await Contact.deleteMany({
      $or: [
        { user: userId, contact: contactId },
        { user: contactId, contact: userId }
      ]
    });

    res.json({
      success: true,
      message: 'Contact request rejected'
    });
  } catch (error) {
    console.error('Reject contact request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject contact request',
      error: error.message
    });
  }
};

/**
 * Remove contact
 */
exports.removeContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;

    // Delete both contact entries
    await Contact.deleteMany({
      $or: [
        { user: userId, contact: contactId },
        { user: contactId, contact: userId }
      ]
    });

    res.json({
      success: true,
      message: 'Contact removed successfully'
    });
  } catch (error) {
    console.error('Remove contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove contact',
      error: error.message
    });
  }
};

/**
 * Block contact
 */
exports.blockContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;

    // Update user's contact entry to blocked
    await Contact.findOneAndUpdate(
      { user: userId, contact: contactId },
      { status: 'blocked', blockedAt: new Date() },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Contact blocked successfully'
    });
  } catch (error) {
    console.error('Block contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block contact',
      error: error.message
    });
  }
};

/**
 * Unblock contact
 */
exports.unblockContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user.userId;

    const contact = await Contact.findOne({
      user: userId,
      contact: contactId
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    if (contact.status !== 'blocked') {
      return res.status(400).json({
        success: false,
        message: 'Contact is not blocked'
      });
    }

    contact.status = 'accepted';
    contact.blockedAt = undefined;
    await contact.save();

    res.json({
      success: true,
      message: 'Contact unblocked successfully',
      data: contact
    });
  } catch (error) {
    console.error('Unblock contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock contact',
      error: error.message
    });
  }
};

/**
 * Get blocked contacts
 */
exports.getBlockedContacts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const blocked = await Contact.find({
      user: userId,
      status: 'blocked'
    })
      .populate('contact', 'name email username profilePicture')
      .sort({ blockedAt: -1 });

    res.json({
      success: true,
      data: blocked
    });
  } catch (error) {
    console.error('Get blocked contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blocked contacts',
      error: error.message
    });
  }
};

/**
 * Update contact nickname
 */
exports.updateContactNickname = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { nickname } = req.body;
    const userId = req.user.userId;

    const contact = await Contact.findOneAndUpdate(
      { user: userId, contact: contactId },
      { nickname },
      { new: true }
    ).populate('contact', 'name email username profilePicture');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Nickname updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update nickname error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update nickname',
      error: error.message
    });
  }
};

module.exports = exports;
