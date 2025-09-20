import Sweet from '../models/Sweet.js';
import { AppError } from '../middleware/errorHandler.js';

// Add a new sweet (Admin only)
export const createSweet = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      currency,
      stockQuantity,
      unit,
      minOrderQuantity,
      maxOrderQuantity,
      images,
      ingredients,
      nutritionFacts,
      allergens,
      tags,
      brand,
      manufacturer,
      expiryDate,
      shelfLife,
      isFeatured,
      isDiscounted,
      discountPercentage
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !price || stockQuantity === undefined) {
      return next(new AppError('Please provide all required fields: name, description, category, price, and stockQuantity', 400));
    }

    // Create sweet data
    const sweetData = {
      name,
      description,
      category,
      price,
      stockQuantity,
      createdBy: req.admin._id,
      lastModifiedBy: req.admin._id
    };

    // Add optional fields if provided
    if (originalPrice) sweetData.originalPrice = originalPrice;
    if (currency) sweetData.currency = currency;
    if (unit) sweetData.unit = unit;
    if (minOrderQuantity) sweetData.minOrderQuantity = minOrderQuantity;
    if (maxOrderQuantity) sweetData.maxOrderQuantity = maxOrderQuantity;
    if (images) sweetData.images = images;
    if (ingredients) sweetData.ingredients = ingredients;
    if (nutritionFacts) sweetData.nutritionFacts = nutritionFacts;
    if (allergens) sweetData.allergens = allergens;
    if (tags) sweetData.tags = tags;
    if (brand) sweetData.brand = brand;
    if (manufacturer) sweetData.manufacturer = manufacturer;
    if (expiryDate) sweetData.expiryDate = expiryDate;
    if (shelfLife) sweetData.shelfLife = shelfLife;
    if (isFeatured !== undefined) sweetData.isFeatured = isFeatured;
    if (isDiscounted !== undefined) sweetData.isDiscounted = isDiscounted;
    if (discountPercentage) sweetData.discountPercentage = discountPercentage;

    // Create sweet
    const sweet = await Sweet.create(sweetData);
    
    // Populate creator information
    await sweet.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Sweet created successfully',
      data: { sweet }
    });

  } catch (error) {
    next(error);
  }
};

// Add a new sweet (Regular User)
export const createSweetByUser = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      currency,
      stockQuantity,
      unit,
      minOrderQuantity,
      maxOrderQuantity,
      images,
      ingredients,
      nutritionFacts,
      allergens,
      tags,
      brand,
      manufacturer,
      expiryDate,
      shelfLife,
      isDiscounted,
      discountPercentage
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !price || stockQuantity === undefined) {
      return next(new AppError('Please provide all required fields: name, description, category, price, and stockQuantity', 400));
    }

    // Validate price
    if (price <= 0) {
      return next(new AppError('Price must be greater than 0', 400));
    }

    // Validate stock quantity
    if (stockQuantity < 0) {
      return next(new AppError('Stock quantity cannot be negative', 400));
    }

    // Create sweet data - users cannot set featured status
    const sweetData = {
      name,
      description,
      category,
      price,
      stockQuantity,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      isFeatured: false, // Users cannot create featured sweets
      isActive: true // User-created sweets are active by default
    };

    // Add optional fields if provided
    if (originalPrice && originalPrice > price) sweetData.originalPrice = originalPrice;
    if (currency) sweetData.currency = currency;
    if (unit) sweetData.unit = unit;
    if (minOrderQuantity && minOrderQuantity > 0) sweetData.minOrderQuantity = minOrderQuantity;
    if (maxOrderQuantity && maxOrderQuantity >= (minOrderQuantity || 1)) sweetData.maxOrderQuantity = maxOrderQuantity;
    if (images && Array.isArray(images)) sweetData.images = images;
    if (ingredients && Array.isArray(ingredients)) sweetData.ingredients = ingredients;
    if (nutritionFacts && typeof nutritionFacts === 'object') sweetData.nutritionFacts = nutritionFacts;
    if (allergens && Array.isArray(allergens)) sweetData.allergens = allergens;
    if (tags && Array.isArray(tags)) sweetData.tags = tags;
    if (brand) sweetData.brand = brand;
    if (manufacturer) sweetData.manufacturer = manufacturer;
    if (expiryDate) sweetData.expiryDate = expiryDate;
    if (shelfLife && shelfLife > 0) sweetData.shelfLife = shelfLife;
    if (isDiscounted !== undefined) sweetData.isDiscounted = isDiscounted;
    if (discountPercentage && discountPercentage > 0 && discountPercentage <= 100) {
      sweetData.discountPercentage = discountPercentage;
    }

    // Create sweet
    const sweet = await Sweet.create(sweetData);
    
    // Populate creator information
    await sweet.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Sweet created successfully. It will be visible once approved.',
      data: { sweet }
    });

  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return next(new AppError(`Validation Error: ${validationErrors.join(', ')}`, 400));
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return next(new AppError('A sweet with this name already exists', 400));
    }
    
    next(error);
  }
};

// Get all sweets with filtering and pagination
export const getAllSweets = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      brand,
      isActive = true,
      isFeatured,
      isDiscounted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (category) filter.category = category;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isDiscounted !== undefined) filter.isDiscounted = isDiscounted === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const sweets = await Sweet.find(filter)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Sweet.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sweets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Search sweets by name, category, or price range
export const searchSweets = async (req, res, next) => {
  try {
    const {
      q: searchTerm,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    if (!searchTerm && !category && !minPrice && !maxPrice) {
      return next(new AppError('Please provide search criteria', 400));
    }

    // Build search filter
    const filter = { isActive: true };
    const searchCriteria = [];

    // Text search
    if (searchTerm) {
      searchCriteria.push(
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { brand: { $regex: searchTerm, $options: 'i' } }
      );
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Add search criteria to filter
    if (searchCriteria.length > 0) {
      filter.$or = searchCriteria;
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price_low':
        sortOptions = { price: 1 };
        break;
      case 'price_high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { views: -1, 'rating.average': -1 };
        break;
      default:
        sortOptions = { _score: { $meta: 'textScore' }, createdAt: -1 };
    }

    // Execute search
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sweets = await Sweet.find(filter)
      .populate('createdBy', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Sweet.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sweets,
        searchTerm,
        filters: { category, minPrice, maxPrice },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get a single sweet by ID
export const getSweetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findById(id)
      .populate('createdBy', 'username email')
      .populate('lastModifiedBy', 'username email')
      .populate('reviews.user', 'username email');

    if (!sweet) {
      return next(new AppError('Sweet not found', 404));
    }

    // Increment views
    await sweet.incrementViews();

    res.json({
      success: true,
      data: { sweet }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid sweet ID', 400));
    }
    next(error);
  }
};

// Update sweet details (Admin only)
export const updateSweet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Add last modified info
    updateData.lastModifiedBy = req.admin._id;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.rating;
    delete updateData.reviews;
    delete updateData.views;

    const sweet = await Sweet.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('createdBy lastModifiedBy', 'username email');

    if (!sweet) {
      return next(new AppError('Sweet not found', 404));
    }

    res.json({
      success: true,
      message: 'Sweet updated successfully',
      data: { sweet }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid sweet ID', 400));
    }
    next(error);
  }
};

// Delete sweet (Admin only)
export const deleteSweet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sweet = await Sweet.findByIdAndDelete(id);

    if (!sweet) {
      return next(new AppError('Sweet not found', 404));
    }

    res.json({
      success: true,
      message: 'Sweet deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid sweet ID', 400));
    }
    next(error);
  }
};

// Get sweets by category
export const getSweetsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sweets = await Sweet.getByCategory(category, {
      sort: sortOptions,
      skip,
      limit: parseInt(limit),
      populate: { path: 'createdBy', select: 'username email' }
    });

    const total = await Sweet.countDocuments({ category, isActive: true });

    res.json({
      success: true,
      data: {
        category,
        sweets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get featured sweets
export const getFeaturedSweets = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const sweets = await Sweet.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: { sweets }
    });

  } catch (error) {
    next(error);
  }
};

// Get discounted sweets
export const getDiscountedSweets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sweets = await Sweet.find({ 
      isActive: true, 
      isDiscounted: true,
      discountPercentage: { $gt: 0 }
    })
      .populate('createdBy', 'username email')
      .sort({ discountPercentage: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Sweet.countDocuments({ 
      isActive: true, 
      isDiscounted: true,
      discountPercentage: { $gt: 0 }
    });

    res.json({
      success: true,
      data: {
        sweets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// Add review to sweet
export const addSweetReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Please provide a valid rating between 1 and 5', 400));
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return next(new AppError('Sweet not found', 404));
    }

    // Check if user already reviewed this sweet
    const existingReview = sweet.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return next(new AppError('You have already reviewed this sweet', 400));
    }

    // Add review
    sweet.reviews.push({
      user: req.user._id,
      rating,
      comment: comment || '',
      isVerified: true // Assuming verified if user is authenticated
    });

    // Update rating
    await sweet.updateRating();

    // Populate user info in the response
    await sweet.populate('reviews.user', 'username email');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { sweet }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return next(new AppError('Invalid sweet ID', 400));
    }
    next(error);
  }
};

// Get sweet categories
export const getSweetCategories = async (req, res, next) => {
  try {
    const categories = await Sweet.distinct('category', { isActive: true });
    
    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Sweet.countDocuments({ category, isActive: true });
        return { category, count };
      })
    );

    res.json({
      success: true,
      data: { categories: categoriesWithCount }
    });

  } catch (error) {
    next(error);
  }
};

// Get sweet statistics (Admin only)
export const getSweetStats = async (req, res, next) => {
  try {
    const stats = await Sweet.aggregate([
      {
        $group: {
          _id: null,
          totalSweets: { $sum: 1 },
          activeSweets: { 
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } 
          },
          featuredSweets: { 
            $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] } 
          },
          discountedSweets: { 
            $sum: { $cond: [{ $eq: ['$isDiscounted', true] }, 1, 0] } 
          },
          averagePrice: { $avg: '$price' },
          totalViews: { $sum: '$views' },
          averageRating: { $avg: '$rating.average' }
        }
      }
    ]);

    const categoryStats = await Sweet.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categories: categoryStats
      }
    });

  } catch (error) {
    next(error);
  }
};