/**
 * Payment Controller
 */

const paymentService = require('../services/payment.service');
const { ApiResponse, asyncHandler } = require('@mgrand-hub/shared');

class PaymentController {
  /**
   * Create payment order
   */
  createOrder = asyncHandler(async (req, res) => {
    const result = await paymentService.createOrder(req.user.userId, req.body);
    
    res.status(201).json(
      new ApiResponse(201, result, 'Payment order created successfully')
    );
  });

  /**
   * Verify payment
   */
  verifyPayment = asyncHandler(async (req, res) => {
    const transaction = await paymentService.verifyPayment(req.body);
    
    res.json(
      new ApiResponse(200, { transaction }, 'Payment verified successfully')
    );
  });

  /**
   * Get transaction
   */
  getTransaction = asyncHandler(async (req, res) => {
    const transaction = await paymentService.getTransaction(
      req.params.id,
      req.user.userId
    );
    
    res.json(
      new ApiResponse(200, { transaction }, 'Transaction retrieved successfully')
    );
  });

  /**
   * Get user transactions
   */
  getUserTransactions = asyncHandler(async (req, res) => {
    const result = await paymentService.getUserTransactions(
      req.user.userId,
      req.query
    );
    
    res.json(
      new ApiResponse(200, result, 'Transactions retrieved successfully')
    );
  });

  /**
   * Process refund
   */
  processRefund = asyncHandler(async (req, res) => {
    const refund = await paymentService.processRefund(
      req.params.id,
      req.body
    );
    
    res.json(
      new ApiResponse(200, { refund }, 'Refund processed successfully')
    );
  });

  /**
   * Webhook handler
   */
  handleWebhook = asyncHandler(async (req, res) => {
    await paymentService.handleWebhook(req.body);
    
    res.json(
      new ApiResponse(200, null, 'Webhook processed successfully')
    );
  });

  /**
   * Get payment statistics
   */
  getStatistics = asyncHandler(async (req, res) => {
    const Transaction = require('../models/Transaction.model');
    
    const stats = await Transaction.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    
    res.json(
      new ApiResponse(200, { stats }, 'Statistics retrieved successfully')
    );
  });
}

module.exports = new PaymentController();
