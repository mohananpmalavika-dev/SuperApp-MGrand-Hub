import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CreditCard as CreditCardIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getSubscription,
  getPaymentHistory,
  cancelSubscription,
  clearPaymentError,
} from '../../store/slices/paymentSlice';

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscription, paymentHistory, loading, error } = useSelector((state) => state.payment);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(getSubscription());
    dispatch(getPaymentHistory());
  }, [dispatch]);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelSubscription()).unwrap();
      setOpenCancelDialog(false);
      alert('Subscription cancelled successfully');
    } catch (error) {
      alert('Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleRenew = () => {
    navigate('/education/subscription-plans');
  };

  const getDaysRemaining = () => {
    if (!subscription?.expiresAt) return 0;
    const expiryDate = new Date(subscription.expiresAt);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUsagePercentage = () => {
    if (!subscription?.startDate || !subscription?.expiresAt) return 0;
    const startDate = new Date(subscription.startDate);
    const expiryDate = new Date(subscription.expiresAt);
    const today = new Date();
    
    const totalDays = (expiryDate - startDate) / (1000 * 60 * 60 * 24);
    const usedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    
    return Math.min(100, Math.max(0, (usedDays / totalDays) * 100));
  };

  const daysRemaining = getDaysRemaining();
  const usagePercentage = getUsagePercentage();

  if (loading && !subscription) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading subscription details...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Subscription
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your subscription and billing
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            dispatch(getSubscription());
            dispatch(getPaymentHistory());
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearPaymentError())}>
          {error}
        </Alert>
      )}

      {/* No Subscription */}
      {!subscription || subscription.status === 'cancelled' || subscription.status === 'expired' ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Active Subscription
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Subscribe now to access all features and start your learning journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/education/subscription-plans')}
          >
            View Plans
          </Button>
        </Paper>
      ) : (
        <>
          {/* Current Subscription */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Current Plan
                    </Typography>
                    <Chip
                      label={subscription.status.toUpperCase()}
                      color={subscription.status === 'active' ? 'success' : 'default'}
                      icon={subscription.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
                    />
                  </Box>

                  <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                    {subscription.planName || 'Premium Plan'}
                  </Typography>

                  <Box sx={{ my: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Time Remaining
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {daysRemaining} days
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100 - usagePercentage}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={daysRemaining < 7 ? 'error' : 'primary'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Expiry Date
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {new Date(subscription.expiresAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {daysRemaining < 7 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Your subscription is expiring soon! Renew now to continue learning without interruption.
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={handleRenew}
                    >
                      Renew Plan
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setOpenCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CreditCardIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Amount Paid
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        ₹{subscription.amount?.toLocaleString() || '0'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CalendarIcon color="success" />
                        <Typography variant="body2" color="text.secondary">
                          Days Active
                        </Typography>
                      </Box>
                      <Typography variant="h5" fontWeight="bold">
                        {Math.floor(usagePercentage * (subscription.duration || 30) / 100)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingUpIcon color="warning" />
                        <Typography variant="body2" color="text.secondary">
                          Auto Renew
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold">
                        {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Features Included */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Features Included
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {[
                'Access to all 4 tracks (CA, IAS, JEE, School)',
                'Unlimited AI-generated lessons',
                'Unlimited practice questions',
                '24/7 AI-powered tutor',
                'Progress tracking & analytics',
                'Mock tests & assessments',
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {/* Payment History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Payment History
        </Typography>
        
        {paymentHistory.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No payment history available
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Payment ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Invoice</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{payment.planName}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {payment.paymentId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={payment.status === 'success' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => alert('Invoice download feature coming soon')}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Cancel Subscription Dialog */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to cancel your subscription?
          </Alert>
          <Typography variant="body2" paragraph>
            If you cancel:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                You'll lose access to all premium features when your current period ends
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Your progress and data will be saved for 30 days
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                You can resubscribe anytime to restore access
              </Typography>
            </li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} disabled={cancelling}>
            Keep Subscription
          </Button>
          <Button
            color="error"
            onClick={handleCancelSubscription}
            disabled={cancelling}
            startIcon={cancelling && <CircularProgress size={16} />}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionManagement;
