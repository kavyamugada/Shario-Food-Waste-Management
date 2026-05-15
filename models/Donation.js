const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: String, required: true }, // e.g., '10 plates', '5 kg'
  expiryTime: { type: Date, required: true },
  pickupLocation: { type: String, required: true }, // Addressed text
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  image: { type: String },
  status: { type: String, enum: ['available', 'requested', 'completed'], default: 'available' }
}, { timestamps: true });

// Create a geospatial index for the location field
donationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);
