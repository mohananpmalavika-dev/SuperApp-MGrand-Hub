const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's contacts
router.get('/', contactController.getContacts);

// Search users to add
router.get('/search', contactController.searchUsers);

// Get pending contact requests
router.get('/requests', contactController.getPendingRequests);

// Get blocked contacts
router.get('/blocked', contactController.getBlockedContacts);

// Send contact request
router.post('/request', contactController.sendContactRequest);

// Accept contact request
router.post('/accept/:contactId', contactController.acceptContactRequest);

// Reject contact request
router.post('/reject/:contactId', contactController.rejectContactRequest);

// Remove contact
router.delete('/:contactId', contactController.removeContact);

// Block contact
router.post('/block/:contactId', contactController.blockContact);

// Unblock contact
router.post('/unblock/:contactId', contactController.unblockContact);

// Update contact nickname
router.patch('/:contactId/nickname', contactController.updateContactNickname);

module.exports = router;
