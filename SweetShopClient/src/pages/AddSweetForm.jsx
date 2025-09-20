import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useCreateSweetMutation } from '../features/api/apiSlice';
import { ArrowLeft, Plus, X, ImagePlus } from 'lucide-react';

const AddSweetForm = () => {
  const navigate = useNavigate();
  const [createSweet, { isLoading, error }] = useCreateSweetMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    currency: 'USD',
    stockQuantity: '',
    unit: 'piece',
    minOrderQuantity: '1',
    maxOrderQuantity: '',
    brand: '',
    manufacturer: '',
    expiryDate: '',
    shelfLife: '',
    isFeatured: false,
    isDiscounted: false,
    discountPercentage: '',
    images: [{ url: '', alt: '', isPrimary: true }],
    ingredients: [{ name: '', allergen: false }],
    allergens: [],
    tags: [],
    nutritionFacts: {
      calories: '',
      fat: '',
      saturatedFat: '',
      cholesterol: '',
      sodium: '',
      carbohydrates: '',
      fiber: '',
      sugars: '',
      protein: '',
      servingSize: ''
    }
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const categories = [
    'chocolates', 'candies', 'gummies', 'hard_candy', 'toffees',
    'lollipops', 'mints', 'fudge', 'caramels', 'marshmallows',
    'cookies', 'cakes', 'pastries', 'ice_cream', 'traditional_sweets',
    'sugar_free', 'organic', 'seasonal', 'gift_boxes', 'bulk_candy'
  ];

  const allergenOptions = [
    'milk', 'eggs', 'fish', 'shellfish', 'tree_nuts',
    'peanuts', 'wheat', 'soybeans', 'sesame'
  ];

  const unitOptions = [
    'piece', 'gram', 'kilogram', 'pound', 'ounce', 'box', 'pack'
  ];

  const currencyOptions = [
    'USD', 'EUR', 'GBP', 'INR'
  ];

  const formatCategory = (cat) => {
    return cat.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (arrayName, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName, newItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleAllergenChange = (allergen, checked) => {
    setFormData(prev => ({
      ...prev,
      allergens: checked 
        ? [...prev.allergens, allergen]
        : prev.allergens.filter(a => a !== allergen)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Valid stock quantity is required';
    
    if (formData.isDiscounted && (!formData.discountPercentage || parseFloat(formData.discountPercentage) <= 0 || parseFloat(formData.discountPercentage) > 100)) {
      newErrors.discountPercentage = 'Valid discount percentage is required (1-100)';
    }

    if (formData.maxOrderQuantity && parseInt(formData.maxOrderQuantity) < parseInt(formData.minOrderQuantity)) {
      newErrors.maxOrderQuantity = 'Max order quantity must be greater than min order quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Clean up data before sending
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity),
        minOrderQuantity: parseInt(formData.minOrderQuantity),
        maxOrderQuantity: formData.maxOrderQuantity ? parseInt(formData.maxOrderQuantity) : undefined,
        discountPercentage: formData.isDiscounted ? parseFloat(formData.discountPercentage) : undefined,
        shelfLife: formData.shelfLife ? parseInt(formData.shelfLife) : undefined,
        expiryDate: formData.expiryDate || undefined,
        
        // Filter out empty images
        images: formData.images.filter(img => img.url.trim()),
        
        // Filter out empty ingredients
        ingredients: formData.ingredients.filter(ing => ing.name.trim()),
        
        // Clean nutrition facts (remove empty values)
        nutritionFacts: Object.fromEntries(
          Object.entries(formData.nutritionFacts).filter(([_, value]) => value && value.toString().trim())
        )
      };

      await createSweet(cleanedData).unwrap();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Failed to create sweet:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Sweet</h1>
              <p className="text-gray-600 mt-1">Create a new sweet product for your shop</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>
              {error.data?.message || 'Failed to create sweet. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Sweet Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Dark Chocolate Truffles"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {formatCategory(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your sweet product..."
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="e.g., SweetShop Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="e.g., Sweet Factory Inc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.charAt(0).toUpperCase() + unit.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isDiscounted"
                  checked={formData.isDiscounted}
                  onCheckedChange={(checked) => handleInputChange('isDiscounted', checked)}
                />
                <Label htmlFor="isDiscounted">This item is on sale</Label>
              </div>

              {formData.isDiscounted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalPrice">Original Price</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discountPercentage">Discount Percentage *</Label>
                    <Input
                      id="discountPercentage"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                      placeholder="0"
                      className={errors.discountPercentage ? 'border-red-500' : ''}
                    />
                    {errors.discountPercentage && <p className="text-sm text-red-500 mt-1">{errors.discountPercentage}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                    placeholder="0"
                    className={errors.stockQuantity ? 'border-red-500' : ''}
                  />
                  {errors.stockQuantity && <p className="text-sm text-red-500 mt-1">{errors.stockQuantity}</p>}
                </div>

                <div>
                  <Label htmlFor="minOrderQuantity">Min Order Quantity</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.minOrderQuantity}
                    onChange={(e) => handleInputChange('minOrderQuantity', e.target.value)}
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxOrderQuantity">Max Order Quantity</Label>
                  <Input
                    id="maxOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.maxOrderQuantity}
                    onChange={(e) => handleInputChange('maxOrderQuantity', e.target.value)}
                    placeholder="No limit"
                    className={errors.maxOrderQuantity ? 'border-red-500' : ''}
                  />
                  {errors.maxOrderQuantity && <p className="text-sm text-red-500 mt-1">{errors.maxOrderQuantity}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
                <Label htmlFor="isFeatured">Feature this sweet</Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={image.url}
                      onChange={(e) => handleArrayInputChange('images', index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Label>Alt Text</Label>
                    <Input
                      value={image.alt}
                      onChange={(e) => handleArrayInputChange('images', index, 'alt', e.target.value)}
                      placeholder="Description for accessibility"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={image.isPrimary}
                        onCheckedChange={(checked) => {
                          // Ensure only one primary image
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.map((img, i) => ({
                                ...img,
                                isPrimary: i === index
                              }))
                            }));
                          }
                        }}
                      />
                      <Label>Primary image</Label>
                    </div>
                  </div>
                  {formData.images.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('images', index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('images', { url: '', alt: '', isPrimary: false })}
                className="w-full"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Another Image
              </Button>
            </CardContent>
          </Card>

          {/* Ingredients & Allergens */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients & Allergens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ingredients</Label>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2 items-center mt-2">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleArrayInputChange('ingredients', index, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={ingredient.allergen}
                        onCheckedChange={(checked) => handleArrayInputChange('ingredients', index, 'allergen', checked)}
                      />
                      <Label className="text-sm">Allergen</Label>
                    </div>
                    {formData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('ingredients', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('ingredients', { name: '', allergen: false })}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Ingredient
                </Button>
              </div>

              <div>
                <Label>Common Allergens</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {allergenOptions.map((allergen) => (
                    <div key={allergen} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.allergens.includes(allergen)}
                        onCheckedChange={(checked) => handleAllergenChange(allergen, checked)}
                      />
                      <Label className="text-sm capitalize">
                        {allergen.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="shelfLife">Shelf Life (days)</Label>
                  <Input
                    id="shelfLife"
                    type="number"
                    min="1"
                    value={formData.shelfLife}
                    onChange={(e) => handleInputChange('shelfLife', e.target.value)}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>

              {/* Nutrition Facts */}
              <div>
                <Label>Nutrition Facts (optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {Object.entries(formData.nutritionFacts).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                      <Input
                        value={value}
                        onChange={(e) => handleNestedInputChange('nutritionFacts', key, e.target.value)}
                        placeholder={key === 'servingSize' ? 'e.g., 1 piece' : '0'}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Creating...' : 'Create Sweet'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSweetForm;