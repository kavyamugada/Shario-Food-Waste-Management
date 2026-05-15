const express = require('express');
const router = express.Router();
const {
    createRequest,
    getRequestsByRequester,
    updateRequestStatus
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createRequest);
router.route('/my-requests').get(protect, getRequestsByRequester);
router.route('/:id').patch(protect, updateRequestStatus);

module.exports = router;
