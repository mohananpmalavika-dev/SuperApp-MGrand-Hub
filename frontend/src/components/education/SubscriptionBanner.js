import React from 'react';
import { Alert, Button, Box } from '@mui/material';
import { CardMembership as SubscriptionIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const { subscription } = useSelector((state) => state.payment);

  // Don't show if user has active subscription
  if (subscription?.status === 'active') {
    return null;
  }

  return (
    <Alert
      severity="info"
      icon={<SubscriptionIcon />}
      action={
        <Button
          color="inherit"
          size="small"
          variant="outlined"
          onClick={() => navigate('/education/subscription-plans')}
        >
          View Plans
        </Button>
      }
      sx={{ mb: 3 }}
    >
      <Box>
        <strong>Unlock Full Access!</strong> Subscribe now to access all courses, AI tutor, and
        premium features. Starting at just ₹999/month.
      </Box>
    </Alert>
  );
};

export default SubscriptionBanner;
