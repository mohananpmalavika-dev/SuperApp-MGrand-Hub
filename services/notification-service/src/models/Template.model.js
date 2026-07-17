/**
 * Notification Template Model
 */

const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'push'],
      required: true,
    },
    subject: String,
    content: {
      type: String,
      required: true,
    },
    variables: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    description: String,
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
