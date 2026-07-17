import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  Payment as PaymentIcon,
  Receipt,
  Refresh,
  GetApp,
} from '@mui/icons-material';
import axios from 'axios';
import './PaymentPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function PaymentPage({ user }) {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/payments/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/create-order`,
        {
          amount: parseFloat(paymentAmount),
          currency: 'INR',
          description: 'Test Payment',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess('Payment initiated! This is a test environment.');
        setOpenPaymentDialog(false);
        setPaymentAmount('');
        fetchTransactions();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="payment-page">
      {/* App Bar */}
      <AppBar position="sticky" sx={{ bgcolor: '#667eea' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Payments
          </Typography>
          <Button
            color="inherit"
            startIcon={<PaymentIcon />}
            onClick={() => setOpenPaymentDialog(true)}
          >
            New Payment
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#667eea', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Total Transactions</Typography>
                <Typography variant="h3">{transactions.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#4ECDC4', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Completed</Typography>
                <Typography variant="h3">
                  {transactions.filter((t) => t.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#FFA07A', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Pending</Typography>
                <Typography variant="h3">
                  {transactions.filter((t) => t.status === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#F38181', color: 'white' }}>
              <CardContent>
                <Typography variant="h6">Failed</Typography>
                <Typography variant="h3">
                  {transactions.filter((t) => t.status === 'failed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Transactions" />
              <Tab label="Invoices" />
              <Tab label="Refunds" />
            </Tabs>
          </Box>

          {/* All Transactions Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Transaction History</Typography>
              <Button
                startIcon={<Refresh />}
                onClick={fetchTransactions}
              >
                Refresh
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {transaction._id.slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          ₹{transaction.amount} {transaction.currency}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {transaction.paymentMethod || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Receipt />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Invoices Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Invoices
            </Typography>
            <Alert severity="info">
              Invoice management feature coming soon!
            </Alert>
          </TabPanel>

          {/* Refunds Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Refunds
            </Typography>
            <Alert severity="info">
              Refund management feature coming soon!
            </Alert>
          </TabPanel>
        </Card>
      </Container>

      {/* New Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Create New Payment</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (INR)"
            type="number"
            fullWidth
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="Enter amount"
            sx={{ mt: 2 }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This is a test payment in development mode.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePayment}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PaymentPage;
