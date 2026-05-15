const Request = require('../models/Request');
const Donation = require('../models/Donation');

// @desc    Create a new request for a donation
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
    try {
        const { donationId, message } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.status !== 'available') {
            return res.status(400).json({ message: 'Donation is no longer available' });
        }

        // Check if request already exists
        const existingRequest = await Request.findOne({
            donation: donationId,
            requester: req.user.id
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You have already requested this donation' });
        }

        const request = await Request.create({
            donation: donationId,
            requester: req.user.id,
            message
        });

        // Mark donation as requested
        donation.status = 'requested';
        await donation.save();

        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while creating request' });
    }
};

// @desc    Get all requests made by the current user
// @route   GET /api/requests/my-requests
// @access  Private
exports.getRequestsByRequester = async (req, res) => {
    try {
        const requests = await Request.find({ requester: req.user.id })
            .populate({
                path: 'donation',
                populate: {
                    path: 'donor',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id
// @access  Private
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await Request.findById(req.params.id).populate('donation');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Ownership logic could go here depending on precise app requirements.
        // E.g. only donor can accept/reject.

        request.status = status;
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating request' });
    }
};
