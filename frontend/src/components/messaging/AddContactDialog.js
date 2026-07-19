import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import axios from 'axios';

const AddContactDialog = ({ open, onClose, apiUrl, token, onContactAdded }) => {
  const [tab, setTab] = useState(0); // 0: Search, 1: QR Code, 2: Phone
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setSearchResults([]);

    try {
      const response = await axios.get(`${apiUrl}/api/messaging/users/search`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` }
      });

      setSearchResults(response.data.data || []);
      
      if (response.data.data.length === 0) {
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (userId) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${apiUrl}/api/messaging/contacts/request`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Contact request sent!');
      setTimeout(() => {
        onContactAdded();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAddByPhone = async () => {
    if (!phoneNumber.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${apiUrl}/api/messaging/contacts/by-phone`,
        { phone: phoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Contact request sent!');
      setTimeout(() => {
        onContactAdded();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setSuccess('');
    setPhoneNumber('');
    setTab(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Contact</DialogTitle>
      
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
        <Tab label="Search" icon={<SearchIcon />} />
        <Tab label="QR Code" icon={<QrCodeIcon />} />
        <Tab label="Phone" icon={<PersonIcon />} />
      </Tabs>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Search Tab */}
        {tab === 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Search by username, email, or phone number
            </Typography>
            
            <TextField
              fullWidth
              label="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter username, email, or phone"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                  </IconButton>
                )
              }}
              sx={{ mb: 2 }}
            />

            {searchResults.length > 0 && (
              <List>
                {searchResults.map((user) => (
                  <ListItem
                    key={user._id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleAddContact(user._id)}
                        disabled={loading || user.isContact || user.requestPending}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatar}>
                        {user.name?.[0] || <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <>
                          {user.email}
                          {user.isContact && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="primary"
                              sx={{ ml: 1 }}
                            >
                              (Already in contacts)
                            </Typography>
                          )}
                          {user.requestPending && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="warning.main"
                              sx={{ ml: 1 }}
                            >
                              (Request pending)
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* QR Code Tab */}
        {tab === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCodeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Open your phone camera and scan the QR code to add contact
            </Typography>
            
            {/* QR Code would be generated here */}
            <Box
              sx={{
                width: 200,
                height: 200,
                margin: '0 auto',
                backgroundColor: 'grey.100',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                QR Code will appear here
              </Typography>
            </Box>

            <Button variant="outlined" startIcon={<QrCodeIcon />}>
              Show My QR Code
            </Button>
          </Box>
        )}

        {/* Phone Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add contact by phone number
            </Typography>
            
            <TextField
              fullWidth
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 234 567 8900"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleAddByPhone}
              disabled={loading || !phoneNumber.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              The person will receive a contact request notification
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddContactDialog;
