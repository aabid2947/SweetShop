import mongoose from 'mongoose';

const sweetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sweet name is required'],
    trim: true,
    maxlength: [100, 'Sweet name cannot exceed 100 characters'],
    index: true // For search functionality
  },
  description: {
    type: String,
    required: [true, 'Sweet description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'chocolates',
        'candies', 
        'gummies',
        'hard_candy',
        'toffees',
        'lollipops',
        'mints',
        'fudge',
        'caramels',
        'marshmallows',
        'cookies',
        'cakes',
        'pastries',
        'ice_cream',
        'traditional_sweets',
        'sugar_free',
        'organic',
        'seasonal',
        'gift_boxes',
        'bulk_candy'
      ],
      message: 'Invalid category selected'
    },
    index: true // For category-based filtering
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(value) {
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Price must be a valid positive number'
    }
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
    validate: {
      validator: function(value) {
        if (value === undefined || value === null) return true;
        return Number.isFinite(value) && value >= 0;
      },
      message: 'Original price must be a valid positive number'
    }
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD'
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    enum: ['piece', 'gram', 'kilogram', 'pound', 'ounce', 'box', 'pack'],
    default: 'piece'
  },
  minOrderQuantity: {
    type: Number,
    min: [1, 'Minimum order quantity must be at least 1'],
    default: 1
  },
  maxOrderQuantity: {
    type: Number,
    min: [1, 'Maximum order quantity must be at least 1'],
    validate: {
      validator: function(value) {
        if (value === undefined || value === null) return true;
        return value >= this.minOrderQuantity;
      },
      message: 'Maximum order quantity must be greater than or equal to minimum order quantity'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    allergen: {
      type: Boolean,
      default: false
    }
  }],
  nutritionFacts: {
    calories: Number,
    fat: Number,
    saturatedFat: Number,
    cholesterol: Number,
    sodium: Number,
    carbohydrates: Number,
    fiber: Number,
    sugars: Number,
    protein: Number,
    servingSize: String
  },
  allergens: [{
    type: String,
    enum: [
      'milk',
      'eggs', 
      'fish',
      'shellfish',
      'tree_nuts',
      'peanuts',
      'wheat',
      'soybeans',
      'sesame'
    ]
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true;
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  shelfLife: {
    type: Number, // in days
    min: [1, 'Shelf life must be at least 1 day']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDiscounted: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100'],
    validate: {
      validator: function(value) {
        if (!this.isDiscounted) return true;
        return value > 0 && value <= 100;
      },
      message: 'Discount percentage is required when item is discounted'
    }
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
sweetSchema.index({ name: 'text', description: 'text', tags: 'text' });
sweetSchema.index({ category: 1, price: 1 });
sweetSchema.index({ price: 1 });
sweetSchema.index({ isActive: 1, isFeatured: 1 });
sweetSchema.index({ 'rating.average': -1 });
sweetSchema.index({ createdAt: -1 });

// Virtual for discount price
sweetSchema.virtual('discountedPrice').get(function() {
  if (this.isDiscounted && this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual for savings amount
sweetSchema.virtual('savings').get(function() {
  if (this.isDiscounted && this.discountPercentage > 0) {
    return this.price * (this.discountPercentage / 100);
  }
  return 0;
});

// Virtual for stock status
sweetSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'out_of_stock';
  if (this.stockQuantity <= 10) return 'low_stock';
  return 'in_stock';
});

// Pre-save middleware to ensure only one primary image
sweetSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(image => {
      if (image.isPrimary) primaryCount++;
    });
    
    // If no primary image set, make first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }
    // If multiple primary images, keep only the first one
    else if (primaryCount > 1) {
      let foundFirst = false;
      this.images.forEach(image => {
        if (image.isPrimary && !foundFirst) {
          foundFirst = true;
        } else if (image.isPrimary && foundFirst) {
          image.isPrimary = false;
        }
      });
    }
  }
  next();
});

// Static method to get sweets by category
sweetSchema.statics.getByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query, null, options);
};

// Static method to search sweets
sweetSchema.statics.searchSweets = function(searchTerm, options = {}) {
  const query = {
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          { brand: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };
  return this.find(query, null, options);
};

// Static method to get sweets by price range
sweetSchema.statics.getByPriceRange = function(minPrice, maxPrice, options = {}) {
  const query = {
    isActive: true,
    price: { $gte: minPrice, $lte: maxPrice }
  };
  return this.find(query, null, options);
};

// Instance method to update rating
sweetSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = totalRating / this.reviews.length;
    this.rating.count = this.reviews.length;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  return this.save();
};

// Instance method to increment views
sweetSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Ensure virtuals are included in JSON output
sweetSchema.set('toJSON', { virtuals: true });
sweetSchema.set('toObject', { virtuals: true });

const Sweet = mongoose.model('Sweet', sweetSchema);

export default Sweet;