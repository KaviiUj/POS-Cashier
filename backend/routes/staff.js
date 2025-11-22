import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Staff, TokenBlacklist } from '../models/index.js';
import { authenticateToken } from '../middleware/index.js';
import { logger } from '../utils/logger.js';
import { getJWTSecret } from '../utils/jwt.js';

const router = express.Router();

// Staff Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Find staff by email
    const staff = await Staff.findOne({ email: email.toLowerCase() });

    if (!staff) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if staff is active
    if (!staff.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Staff account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token (expires in 12 hours)
    const tokenPayload = {
      userId: staff._id.toString(),
      userName: staff.staffName,
      role: staff.role,
      userType: 'Staff'
    };

    const secret = getJWTSecret();
    const token = jwt.sign(
      tokenPayload,
      secret,
      { expiresIn: '12h' }
    );

    // Prepare staff details (exclude password)
    const staffDetails = {
      _id: staff._id,
      staffName: staff.staffName,
      role: staff.role,
      mobileNumber: staff.mobileNumber,
      email: staff.email,
      address: staff.address,
      nic: staff.nic,
      profileImageUrl: staff.profileImageUrl,
      isActive: staff.isActive,
      createdBy: staff.createdBy,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt
    };

    logger.info('Staff login successful', {
      staffId: staff._id,
      email: staff.email
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        staff: staffDetails,
        accessToken: token
      }
    });
  } catch (error) {
    logger.error('Staff login error', {
      error: error.message,
      stack: error.stack,
      email: req.body.email
    });

    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again later.'
    });
  }
});

// Staff Logout
router.get('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user.userId;

    // Calculate token expiration time
    const decoded = jwt.decode(token);
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 12 * 60 * 60 * 1000);

    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      userId,
      userType: 'Staff',
      reason: 'logout',
      expiresAt
    });

    logger.info('Staff logout successful', {
      userId,
      token: token.substring(0, 20) + '...'
    });

    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Staff logout error', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId
    });

    res.status(500).json({
      status: 'error',
      message: 'Logout failed. Please try again later.'
    });
  }
});

export default router;

