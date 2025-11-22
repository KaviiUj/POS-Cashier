import express from 'express';
import staffRoutes from './staff.js';
import tableRoutes from './table.js';

const router = express.Router();

// Staff routes
router.use('/staff', staffRoutes);

// Table routes
router.use('/table', tableRoutes);

export default router;

