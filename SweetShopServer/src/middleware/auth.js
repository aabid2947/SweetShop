import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
     
    }
    
    if (!token) {
      console.error('No token provided in request headers');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
    
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from token
      const user = await User.findById(decoded.id).select('-password -refreshTokens');

      if (!user) {
        console.error('User not found for token:', decoded);
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. User not found.'
        });
      }
      
      if (!user.isActive) {
        console.log('Attempt to access with deactivated account:', user._id);
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to authenticate admin users
export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is for admin
      if (decoded.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin token required.'
        });
      }
      
      // Get admin from token
      const admin = await Admin.findById(decoded._id).select('-password -refreshTokens');

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid. Admin not found.'
        });
      }
      
      if (!admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account has been deactivated.'
        });
      }
      
      // Add admin to request object
      req.admin = admin;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired.',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const authenticateOptional = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      // No token provided, continue without authentication
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if it's a user or admin token
      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded._id).select('-password -refreshTokens');
        if (admin && admin.isActive) {
          req.admin = admin;
        }
      } else {
        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        if (user && user.isActive) {
          req.user = user;
        }
      }
      
    } catch (jwtError) {
      // Ignore token errors in optional authentication
      console.log('Optional authentication failed:', jwtError.message);
    }
    
    next();
    
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue even if there's an error
  }
};

// Middleware to check if user has specific role
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user or admin is authenticated
    const currentUser = req.user || req.admin;
    
    if (!currentUser) {
      console.error('Authorization attempted without authenticated user');
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }
    
    // Get the role from user or admin
    const userRole = currentUser.role;
    
    if (!roles.includes(userRole)) {
      console.error(`User role ${userRole} not authorized for this action`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to verify refresh token
export const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      console.error('No refresh token provided in request body');
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }
    
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        issuer: 'p2pserver',
        audience: 'p2pserver-users'
      });
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token type.'
        });
      }
      
      // Find user and check if refresh token exists
      const user = await User.findOne({
        _id: decoded.id,
        'refreshTokens.token': refreshToken,
        isActive: true
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.'
        });
      }
      
      req.user = user;
      req.refreshToken = refreshToken;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired.',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token.'
        });
      }
    }
    
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token verification.'
    });
  }
};

// Middleware to check if user owns the resource or is admin
export const checkOwnership = (resourceIdField = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }
    
    const resourceId = req.params[resourceIdField];
    const userId = req.user._id.toString();
    
    // Allow if user owns the resource or is accessing their own data
    if (resourceId === userId || req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
  };
};
