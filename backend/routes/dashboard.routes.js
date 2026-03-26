import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';

const router = express.Router();
router.get('/dashboard/stats', getDashboardStats);

export default router;
