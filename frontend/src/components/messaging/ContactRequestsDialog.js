import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Inbox as InboxIcon
} from '@mui/icons-material';
import axios from 'axios';

const ContactRequestsDialog = ({ open, onClose, apiUrl, token, onRequestHandled }) => {
  const [tab, setTab] = useState(0); // 0: Received, 1: Sent
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (open) {
      loadRequests();
    }
  }, [open]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      // Load received requests
      const receivedResponse = await axios.get(
        `${apiUrl}/api/messaging/contacts/requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReceivedRequests(receivedResponse.data.data || []);

      // Load sent requests
      const sentResponse = await axios.get(
        `${apiUrl}/api/messaging/contacts/requests/sent`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentRequests(sentResponse.data.data || []);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setProcessing(requestId);
    setError('');

    try {
      await axios.post(
        `${apiUrl}/api/messaging/contacts/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list
      setReceivedRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Notify parent
      onRequestHandled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessing(requestId);
    setError('');

    try {
      await axios.post(
        `${apiUrl}/api/messaging/contacts/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list
      setReceivedRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Notify parent
      onRequestHandled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setProcessing(requestId);
    setError('');

    try {
      await axios.delete(
        `${apiUrl}/api/messaging/contacts/cancel/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from list
      setSentRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Notify parent
      onRequestHandled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffMs = now - requestDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return requestDate.toLocaleDateString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Contact Requests
          <Chip 
            label={receivedRequests.length} 
            color="primary" 
            size="small" 
          />
        </Box>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        centered
      >
        <Tab 
          label="Received" 
          icon={<InboxIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Sent" 
          icon={<SendIcon />} 
          iconPosition="start"
        />
      </Tabs>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Received Requests Tab */}
            {tab === 0 && (
              <Box>
                {receivedRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <InboxIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No contact requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      When someone sends you a request, it will appear here
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {receivedRequests.map((request) => (
                      <ListItem
                        key={request._id}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                          <ListItemAvatar>
                            <Avatar src={request.from?.avatar}>
                              {request.from?.name?.[0] || <PersonIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={request.from?.name || 'Unknown User'}
                            secondary={
                              <>
                                {request.from?.email}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ display: 'block', mt: 0.5 }}
                                >
                                  {formatDate(request.createdAt)}
                                </Typography>
                              </>
                            }
                          />
                        </Box>

                        {request.message && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, px: 2 }}
                          >
                            "{request.message}"
                          </Typography>
                        )}

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={processing === request._id ? <CircularProgress size={16} /> : <CheckIcon />}
                            onClick={() => handleAcceptRequest(request._id)}
                            disabled={processing === request._id}
                          >
                            Accept
                          </Button>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={processing === request._id}
                          >
                            Decline
                          </Button>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Sent Requests Tab */}
            {tab === 1 && (
              <Box>
                {sentRequests.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SendIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No pending requests
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your sent contact requests will appear here
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {sentRequests.map((request) => (
                      <ListItem
                        key={request._id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleCancelRequest(request._id)}
                            disabled={processing === request._id}
                          >
                            <CloseIcon />
                          </IconButton>
                        }
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 1
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={request.to?.avatar}>
                            {request.to?.name?.[0] || <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={request.to?.name || 'Unknown User'}
                          secondary={
                            <>
                              {request.to?.email}
                              <br />
                              <Chip
                                label="Pending"
                                size="small"
                                color="warning"
                                sx={{ mt: 0.5 }}
                              />
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{ ml: 1 }}
                              >
                                Sent {formatDate(request.createdAt)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactRequestsDialog;
