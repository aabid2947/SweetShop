import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  logoutAdmin,
  logoutAllAdmin,
  refreshAdminToken,
  getAllAdmins,
  deactivateAdmin,
  activateAdmin
} from '../controllers/adminController.js';
import {
  authenticateAdmin,
  authorize,
  verifyRefreshToken
} from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', loginAdmin);
router.post('/refresh-token', refreshAdminToken);

// Protected routes (authentication required)
router.use(authenticateAdmin);

// Admin authentication routes
router.post('/logout', logoutAdmin);
router.post('/logout-all', logoutAllAdmin);

// Admin profile routes
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

// Super admin only routes
router.use(authorize(['super_admin']));

// Admin management routes (super_admin only)
router.post('/register', registerAdmin);
router.get('/all', getAllAdmins);
router.put('/:adminId/deactivate', deactivateAdmin);
router.put('/:adminId/activate', activateAdmin);

export default router;