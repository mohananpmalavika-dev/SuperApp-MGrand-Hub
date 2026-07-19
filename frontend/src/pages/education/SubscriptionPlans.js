import React, { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder, verifyPayment, clearPaymentError } from '../../store/slices/paymentSlice';

const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { plans, subscription, loading, error } = useSelector((state) => state.payment);
  const { user } = useSelector((state) => state.auth);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSelectPlan = (plan) => {
    if (subscription?.status === 'active') {
      alert('You already have an active subscription!');
      return;
    }
    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPlan(null);
    dispatch(clearPaymentError());
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setPaymentProcessing(true);

    try {
      // Create order
      const orderResult = await dispatch(
        createOrder({
          planId: selectedPlan.id,
          amount: selectedPlan.price,
        })
      ).unwrap();

      // Initialize Razorpay
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
        amount: orderResult.amount,
        currency: 'INR',
        name: 'MGrand Hub - Personal AI Tutor',
        description: `${selectedPlan.name} Subscription`,
        order_id: orderResult.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await dispatch(
              verifyPayment({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId: selectedPlan.id,
              })
            ).unwrap();

            setPaymentProcessing(false);
            handleCloseDialog();
            
            // Show success message and redirect
            alert('Payment successful! Your subscription is now active.');
            navigate('/education/dashboard');
          } catch (error) {
            setPaymentProcessing(false);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#1976d2',
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            alert('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      setPaymentProcessing(false);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const calculateSavings = (plan) => {
    if (plan.originalPrice) {
      return ((plan.originalPrice - plan.price) / plan.originalPrice) * 100;
    }
    return 0;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Choose Your Learning Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Access world-class education at a fraction of traditional coaching costs
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<SchoolIcon />}
            label="CA • IAS • JEE • School (5-Degree)"
            color="primary"
            size="medium"
          />
          <Chip
            icon={<TrendingUpIcon />}
            label="Save ₹25,000 - ₹2,00,000 vs Traditional Coaching"
            color="success"
            size="medium"
          />
        </Box>
      </Box>

      {/* Subscription Status Alert */}
      {subscription?.status === 'active' && (
        <Alert severity="success" sx={{ mb: 3 }}>
          You currently have an active {subscription.planName} subscription valid until{' '}
          {new Date(subscription.expiresAt).toLocaleDateString()}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearPaymentError())}>
          {error}
        </Alert>
      )}

      {/* Pricing Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {plans.map((plan) => {
          const savingsPercentage = calculateSavings(plan);
          
          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.popular ? 3 : 1,
                  borderColor: plan.popular ? 'primary.main' : 'divider',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  },
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Chip
                      icon={<StarIcon />}
                      label="MOST POPULAR"
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
                
                {savingsPercentage > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                    }}
                  >
                    <Chip
                      icon={<OfferIcon />}
                      label={`Save ${savingsPercentage.toFixed(0)}%`}
                      color="error"
                      size="small"
                    />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, pt: plan.popular ? 4 : 2 }}>
                  {/* Plan Name */}
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {plan.duration}
                  </Typography>

                  {/* Pricing */}
                  <Box sx={{ my: 3 }}>
                    {plan.originalPrice && (
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        ₹{plan.originalPrice.toLocaleString()}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography variant="h3" fontWeight="bold" color="primary.main">
                        ₹{plan.price.toLocaleString()}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        /{plan.duration}
                      </Typography>
                    </Box>
                    {plan.savings && (
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        You save ₹{plan.savings.toLocaleString()}
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Features */}
                  <List dense>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: feature.includes('Save') ? 'bold' : 'normal',
                            color: feature.includes('Save') ? 'success.main' : 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* CTA Button */}
                  <Button
                    variant={plan.popular ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={subscription?.status === 'active'}
                    sx={{ mt: 3 }}
                  >
                    {subscription?.status === 'active' ? 'Current Plan' : 'Subscribe Now'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Value Proposition */}
      <Paper sx={{ p: 4, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
          Why Choose MGrand Hub?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                99%
              </Typography>
              <Typography variant="body1">
                Cost Savings vs Traditional Coaching
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                24/7
              </Typography>
              <Typography variant="body1">
                AI-Powered Personal Tutor
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold">
                4 Tracks
              </Typography>
              <Typography variant="body1">
                CA, IAS, JEE, School - All Included
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Payment Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Confirm Subscription
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedPlan.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedPlan.duration} subscription
              </Typography>
              
              <Box sx={{ my: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Plan Price:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ₹{selectedPlan.price.toLocaleString()}
                  </Typography>
                </Box>
                {selectedPlan.originalPrice && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="success.main">
                      You Save:
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      ₹{selectedPlan.savings.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ₹{selectedPlan.price.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                You will be redirected to Razorpay secure payment gateway
              </Alert>

              <Typography variant="caption" color="text.secondary">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
                Your subscription will auto-renew unless cancelled.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={paymentProcessing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePayment}
            disabled={paymentProcessing}
            startIcon={paymentProcessing && <CircularProgress size={16} />}
          >
            {paymentProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubscriptionPlans;
