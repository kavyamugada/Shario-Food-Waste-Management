const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  message: { type: String } // Optional note from requester
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
