import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Star, ShoppingCart, Eye } from 'lucide-react';

const SweetCard = ({ sweet, onAddToCart }) => {
  const {
    _id,
    name,
    description,
    category,
    price,
    discountedPrice,
    savings,
    stockStatus,
    currency = 'USD',
    images = [],
    rating,
    views,
    isDiscounted,
    discountPercentage,
    isFeatured,
    brand
  } = sweet;

  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const displayPrice = isDiscounted ? discountedPrice : price;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatCategory = (cat) => {
    return cat.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
      <CardHeader className="p-0 relative">
        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={primaryImage?.url || '/api/placeholder/300/200'}
            alt={primaryImage?.alt || name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/200';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isFeatured && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                Featured
              </Badge>
            )}
            {isDiscounted && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>

          {/* Stock Status */}
          <div className="absolute top-3 right-3">
            <Badge className={getStockStatusColor(stockStatus)}>
              {stockStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Views */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Eye size={12} />
            {views || 0}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Brand */}
        {brand && (
          <p className="text-sm text-gray-500 mb-1">{brand}</p>
        )}

        {/* Title */}
        <Link to={`/sweets/${_id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Category */}
        <Badge variant="outline" className="mb-3">
          {formatCategory(category)}
        </Badge>

        {/* Rating */}
        {rating && rating.count > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.average.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({rating.count} reviews)</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-600">
              {formatPrice(displayPrice)}
            </span>
            {isDiscounted && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-green-600 font-medium">
                  Save {formatPrice(savings)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link 
            to={`/sweets/${_id}`}
            className="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-md text-center text-sm font-medium transition-colors"
          >
            View Details
          </Link>
          
          {stockStatus !== 'out_of_stock' && onAddToCart && (
            <button
              onClick={() => onAddToCart(sweet)}
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-md transition-colors"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SweetCard;