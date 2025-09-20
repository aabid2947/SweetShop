import express from 'express';
import {
  createSweet,
  createSweetByUser,
  getAllSweets,
  searchSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  getSweetsByCategory,
  getFeaturedSweets,
  getDiscountedSweets,
  addSweetReview,
  getSweetCategories,
  getSweetStats
} from '../controllers/sweetController.js';
import {
  authenticate,
  authenticateAdmin,
  authorize,
  authenticateOptional
} from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.get('/categories', getSweetCategories);
router.get('/featured', getFeaturedSweets);
router.get('/discounted', getDiscountedSweets);
router.get('/category/:category', getSweetsByCategory);

// Optional authentication (for views tracking)
router.get('/:id', authenticateOptional, getSweetById);

// User routes (authenticated users can add reviews and create sweets)
router.post('/:id/review', authenticate, addSweetReview);
router.post('/user/create', authenticate, createSweetByUser);

// Admin routes - require admin authentication
router.post('/', authenticateAdmin, authorize(['admin', 'super_admin']), createSweet);
router.put('/:id', authenticateAdmin, authorize(['admin', 'super_admin']), updateSweet);
router.delete('/:id', authenticateAdmin, authorize(['admin', 'super_admin']), deleteSweet);
router.get('/admin/stats', authenticateAdmin, authorize(['admin', 'super_admin']), getSweetStats);

export default router;