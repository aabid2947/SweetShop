import Admin from '../models/Admin.js';
import { AppError } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

// Register a new admin (only super_admin can create new admins)
export const registerAdmin = async (req, res, next) => {
  try {
    const { username, email, password, role, firstName, lastName, phoneNumber, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingAdmin) {
      if (existingAdmin.email === email) {
        return next(new AppError('Email already registered', 400));
      }
      if (existingAdmin.username === username) {
        return next(new AppError('Username already taken', 400));
      }
    }

    // Set default permissions based on role
    let defaultPermissions = [];
    switch (role) {
      case 'super_admin':
        defaultPermissions = ['manage_sweets', 'manage_users', 'view_analytics', 'manage_orders', 'system_config'];
        break;
      case 'admin':
        defaultPermissions = ['manage_sweets', 'manage_users', 'view_analytics', 'manage_orders'];
        break;
      case 'moderator':
        defaultPermissions = ['manage_sweets', 'view_analytics'];
        break;
      default:
        defaultPermissions = ['view_analytics'];
    }

    // Create admin object
    const adminData = {
      username,
      email,
      password,
      role: role || 'admin',
      firstName,
      lastName,
      phoneNumber,
      permissions: permissions || defaultPermissions,
      createdBy: req.admin?._id // Set creator if available from middleware
    };

    // Create admin
    const admin = await Admin.create(adminData);

    // Generate tokens
    const token = await admin.generateAuthToken();
    const refreshToken = await admin.generateRefreshToken();

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin,
        token,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

// Admin login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find admin by credentials
    const admin = await Admin.findByCredentials(email, password);

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate tokens
    const token = await admin.generateAuthToken();
    const refreshToken = await admin.generateRefreshToken();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin,
        token,
        refreshToken
      }
    });

  } catch (error) {
    next(new AppError('Invalid login credentials', 401));
  }
};

// Get admin profile
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    res.json({
      success: true,
      data: { admin }
    });

  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, permissions } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Only super_admin can update permissions
    if (permissions && req.admin.role === 'super_admin') {
      updateData.permissions = permissions;
    }

    const admin = await Admin.findByIdAndUpdate(
      req.admin._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { admin }
    });

  } catch (error) {
    next(error);
  }
};

// Change admin password
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    // Get admin with password
    const admin = await Admin.findById(req.admin._id).select('+password');
    
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    // Check current password
    const isMatch = await admin.checkPassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Logout admin
export const logoutAdmin = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await req.admin.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Logout from all devices
export const logoutAllAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    admin.refreshTokens = [];
    await admin.save();

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Refresh admin token
export const refreshAdminToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find admin and check if refresh token exists
    const admin = await Admin.findOne({
      _id: decoded._id,
      'refreshTokens.token': refreshToken,
      isActive: true
    });

    if (!admin) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Generate new tokens
    const newToken = await admin.generateAuthToken();
    const newRefreshToken = await admin.generateRefreshToken();

    // Remove old refresh token
    await admin.removeRefreshToken(refreshToken);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    next(error);
  }
};

// Get all admins (super_admin only)
export const getAllAdmins = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: 'createdBy', select: 'username email' }
    };

    const admins = await Admin.paginate(filter, options);

    res.json({
      success: true,
      data: admins
    });

  } catch (error) {
    next(error);
  }
};

// Deactivate admin (super_admin only)
export const deactivateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    
    if (adminId === req.admin._id.toString()) {
      return next(new AppError('You cannot deactivate your own account', 400));
    }

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: false },
      { new: true }
    );

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    // Clear all refresh tokens for deactivated admin
    admin.refreshTokens = [];
    await admin.save();

    res.json({
      success: true,
      message: 'Admin deactivated successfully',
      data: { admin }
    });

  } catch (error) {
    next(error);
  }
};

// Activate admin (super_admin only)
export const activateAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      { isActive: true },
      { new: true }
    );

    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    res.json({
      success: true,
      message: 'Admin activated successfully',
      data: { admin }
    });

  } catch (error) {
    next(error);
  }
};