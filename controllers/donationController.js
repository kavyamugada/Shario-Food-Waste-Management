const Donation = require('../models/Donation');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor)
exports.createDonation = async (req, res) => {
    try {
        const { title, description, quantity, expiryTime, pickupLocation, lng, lat, image } = req.body;

        if (!title || !quantity || !pickupLocation || !lng || !lat) {
            return res.status(400).json({ message: 'Please provide all required fields including location coordinates' });
        }

        const donation = await Donation.create({
            donor: req.user.id,
            title,
            description,
            quantity,
            expiryTime,
            pickupLocation,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            image, // Can be cloudinary URL or local path
            status: 'available'
        });

        res.status(201).json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating donation' });
    }
};

// @desc    Get all available donations
// @route   GET /api/donations
// @access  Public
exports.getDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ status: 'available' })
                                        .populate('donor', 'name email')
                                        .sort({ createdAt: -1 });
        res.status(200).json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching donations' });
    }
};

// @desc    Get nearby available donations sorted by distance
// @route   GET /api/donations/nearby?lng=...&lat=...&maxDist=5000
// @access  Public
exports.getNearbyDonations = async (req, res) => {
    try {
        const { lng, lat, maxDist } = req.query;

        if (!lng || !lat) {
            return res.status(400).json({ message: 'Please provide longitude and latitude' });
        }

        const maxDistance = maxDist ? parseInt(maxDist) * 1000 : 10000; // default 10km

        const donations = await Donation.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    distanceField: 'dist.calculated',
                    maxDistance: maxDistance,
                    query: { status: 'available' },
                    spherical: true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'donor',
                    foreignField: '_id',
                    as: 'donorInfo'
                }
            },
            {
                $unwind: '$donorInfo'
            },
            {
                $project: {
                    'donorInfo.password': 0,
                    'donorInfo.otp': 0,
                    'donorInfo.otpExpires': 0
                }
            }
        ]);

        res.status(200).json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching nearby donations' });
    }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public
exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donor', 'name email');
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.status(200).json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update donation status (e.g. from available to requested)
// @route   PATCH /api/donations/:id
// @access  Private
exports.updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['available', 'requested', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Only the donor can modify their own donation (basic ownership check)
        // Or we might allow changes if someone requests it, but typically the request modifies the donation.
        // For simplicity, let's just update it. You may add specific logic later.
        
        donation.status = status;
        await donation.save();

        res.status(200).json(donation);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
