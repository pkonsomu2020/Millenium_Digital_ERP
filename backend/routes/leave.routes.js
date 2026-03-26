import express from 'express';
import {
  getAllLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  updateLeaveRequestStatus,
  deleteLeaveRequest
} from '../controllers/leave.controller.js';

const router = express.Router();

router.get('/leave-requests', getAllLeaveRequests);
router.post('/leave-requests', createLeaveRequest);
router.put('/leave-requests/:id', updateLeaveRequest);
router.put('/leave-requests/:id/status', updateLeaveRequestStatus);
router.delete('/leave-requests/:id', deleteLeaveRequest);

export default router;
