import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { 
  useGetSweetByIdQuery, 
  useAddSweetReviewMutation 
} from '../features/api/apiSlice';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft,
  Eye,
  Clock,
  Shield,
  Truck,
  Award
} from 'lucide-react';
import { useSelector } from 'react-redux';

const SweetDetailsPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { 
    data: sweetData, 
    error, 
    isLoading 
  } = useGetSweetByIdQuery(id);

  const [addReview, { isLoading: isAddingReview }] = useAddSweetReviewMutation();

  const sweet = sweetData?.data?.sweet;

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add a review');
      return;
    }

    try {
      await addReview({
        id,
        rating,
        comment
      }).unwrap();
      
      setShowReviewForm(false);
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Failed to add review:', error);
    }
  };

  const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatCategory = (cat) => {
    return cat?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription>
            Sweet not found or failed to load. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!sweet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Sweet not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const displayPrice = sweet.isDiscounted ? sweet.discountedPrice : sweet.price;
  const images = sweet.images || [];
  const primaryImage = images[selectedImageIndex] || images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/sweets" className="hover:text-orange-600 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to Sweets
            </Link>
            <span>/</span>
            <span>{formatCategory(sweet.category)}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{sweet.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg bg-white">
              <img
                src={primaryImage?.url || '/api/placeholder/600/600'}
                alt={primaryImage?.alt || sweet.name}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/600/600';
                }}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {sweet.isFeatured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Featured
                  </Badge>
                )}
                {sweet.isDiscounted && (
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    {sweet.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div className="absolute top-4 right-4">
                <Badge className={getStockStatusColor(sweet.stockStatus)}>
                  {sweet.stockStatus?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Views */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
                <Eye size={14} />
                {sweet.views || 0}
              </div>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded border-2 transition-colors ${
                      index === selectedImageIndex 
                        ? 'border-orange-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${sweet.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/100/100';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              {sweet.brand && (
                <p className="text-sm text-gray-600 mb-2">{sweet.brand}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {sweet.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline">
                  {formatCategory(sweet.category)}
                </Badge>
                
                {sweet.rating && sweet.rating.count > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{sweet.rating.average.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({sweet.rating.count} reviews)
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {sweet.description}
              </p>
            </div>

            {/* Price */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-orange-600">
                  {formatPrice(displayPrice, sweet.currency)}
                </span>
                {sweet.isDiscounted && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(sweet.price, sweet.currency)}
                    </span>
                    <span className="text-lg text-green-600 font-medium">
                      Save {formatPrice(sweet.savings, sweet.currency)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Price per {sweet.unit || 'piece'}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                {sweet.minOrderQuantity > 1 && (
                  <span className="text-sm text-gray-500">
                    Min: {sweet.minOrderQuantity}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={sweet.stockStatus === 'out_of_stock'}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                Free shipping over $50
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                Quality guaranteed
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Fresh daily
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Award className="w-4 h-4" />
                Premium quality
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 space-y-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd>{formatCategory(sweet.category)}</dd>
                    </div>
                    {sweet.brand && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Brand:</dt>
                        <dd>{sweet.brand}</dd>
                      </div>
                    )}
                    {sweet.manufacturer && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Manufacturer:</dt>
                        <dd>{sweet.manufacturer}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Unit:</dt>
                      <dd>{sweet.unit || 'piece'}</dd>
                    </div>
                  </dl>
                </div>

                {sweet.ingredients && sweet.ingredients.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                    <div className="flex flex-wrap gap-1">
                      {sweet.ingredients.map((ingredient, index) => (
                        <Badge 
                          key={index} 
                          variant={ingredient.allergen ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {ingredient.name}
                          {ingredient.allergen && " ⚠️"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {sweet.allergens && sweet.allergens.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Allergen Information</h4>
                  <div className="flex flex-wrap gap-1">
                    {sweet.allergens.map((allergen, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergen.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {sweet.nutritionFacts && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nutrition Facts</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(sweet.nutritionFacts).map(([key, value]) => (
                      value && (
                        <div key={key} className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium">{value}</div>
                          <div className="text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Reviews ({sweet.reviews?.length || 0})
                {user && (
                  <Button 
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant="outline"
                    size="sm"
                  >
                    Write Review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleAddReview} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this sweet..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={isAddingReview}
                      size="sm"
                    >
                      {isAddingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              {sweet.reviews && sweet.reviews.length > 0 ? (
                <div className="space-y-4">
                  {sweet.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">
                          {review.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No reviews yet. Be the first to review this sweet!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SweetDetailsPage;