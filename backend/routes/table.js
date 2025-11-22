import express from 'express';
import { Table, Order } from '../models/index.js';
import { authenticateToken } from '../middleware/index.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all tables (requires authentication)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tables = await Table.find({}).sort({ tableName: 1 });

    logger.info('Tables fetched successfully', {
      userId: req.user.userId,
      count: tables.length
    });

    res.status(200).json({
      status: 'success',
      message: 'Tables fetched successfully',
      data: {
        tables: tables
      }
    });
  } catch (error) {
    logger.error('Get tables error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tables. Please try again later.'
    });
  }
});

// Get order by table ID (requires authentication)
router.get('/order', authenticateToken, async (req, res) => {
  try {
    const { tableId } = req.query;

    // Validate tableId
    if (!tableId) {
      return res.status(400).json({
        status: 'error',
        message: 'Table ID is required as query parameter'
      });
    }

    // Find table by ID
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({
        status: 'error',
        message: 'Table not found'
      });
    }

    // Check if table has an order
    if (!table.orderId || table.orderId.trim() === '') {
      return res.status(200).json({
        status: 'success',
        message: 'No order found for this table',
        data: {
          order: null,
          table: {
            _id: table._id,
            tableName: table.tableName,
            isAvailable: table.isAvailable
          }
        }
      });
    }

    // Find order by orderNumber (table.orderId matches order.orderNumber)
    const order = await Order.findOne({ orderNumber: table.orderId });

    if (!order) {
      return res.status(200).json({
        status: 'success',
        message: 'Order ID exists in table but order not found',
        data: {
          order: null,
          table: {
            _id: table._id,
            tableName: table.tableName,
            orderId: table.orderId,
            isAvailable: table.isAvailable
          }
        }
      });
    }

    logger.info('Order fetched by table ID successfully', {
      userId: req.user.userId,
      tableId: tableId,
      orderNumber: order.orderNumber
    });

    res.status(200).json({
      status: 'success',
      message: 'Order found',
      data: {
        order: order,
        table: {
          _id: table._id,
          tableName: table.tableName,
          isAvailable: table.isAvailable
        }
      }
    });
  } catch (error) {
    logger.error('Get order by table ID error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      tableId: req.query?.tableId
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order. Please try again later.'
    });
  }
});

export default router;

