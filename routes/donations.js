const express = require('express');
const router = express.Router();
const {
    createDonation,
    getDonations,
    getDonationById,
    getNearbyDonations,
    updateDonationStatus
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

// Get all available donations or search nearby
router.route('/').get(getDonations).post(protect, createDonation);

// Get nearby donations passing lng/lat
router.route('/nearby').get(getNearbyDonations);

router.route('/:id').get(getDonationById).patch(protect, updateDonationStatus);

module.exports = router;
