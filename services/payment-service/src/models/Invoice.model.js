/**
 * Invoice Model
 */

const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    items: [{
      name: String,
      description: String,
      quantity: Number,
      price: Number,
      total: Number,
    }],
    billingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'cancelled'],
      default: 'draft',
    },
    dueDate: Date,
    paidAt: Date,
    pdfUrl: String,
  },
  {
    timestamps: true,
  }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${count + 1}`;
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
