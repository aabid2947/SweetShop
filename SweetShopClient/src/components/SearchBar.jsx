import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { useGetSweetCategoriesQuery } from '../features/api/apiSlice';

const SearchBar = ({ onSearch, onFilterChange, filters = {}, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState(filters.q || '');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    sortBy: filters.sortBy || 'newest',
    ...filters
  });

  const { data: categoriesData } = useGetSweetCategoriesQuery();
  const categories = categoriesData?.data?.categories || [];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'relevance', label: 'Relevance' }
  ];

  const formatCategory = (cat) => {
    return cat.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch({
      q: searchTerm,
      ...localFilters
    });
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = { sortBy: 'newest' };
    setLocalFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange(clearedFilters);
    onSearch({ q: '', ...clearedFilters });
  };

  const activeFiltersCount = Object.keys(localFilters).filter(key => 
    localFilters[key] && key !== 'sortBy'
  ).length + (searchTerm ? 1 : 0);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== filters.q) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search for sweets, brands, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onSearch({ q: '', ...localFilters });
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button 
          type="button"
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4 relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-orange-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </form>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchTerm}"
              <button onClick={() => {
                setSearchTerm('');
                onSearch({ q: '', ...localFilters });
              }}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {localFilters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {formatCategory(localFilters.category)}
              <button onClick={() => clearFilter('category')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {(localFilters.minPrice || localFilters.maxPrice) && (
            <Badge variant="secondary" className="gap-1">
              Price: ${localFilters.minPrice || '0'} - ${localFilters.maxPrice || '∞'}
              <button onClick={() => {
                clearFilter('minPrice');
                clearFilter('maxPrice');
              }}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {localFilters.category 
                    ? formatCategory(localFilters.category)
                    : 'All Categories'
                  }
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem 
                  onClick={() => handleFilterChange('category', '')}
                  className={!localFilters.category ? 'bg-orange-50' : ''}
                >
                  All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.category}
                    onClick={() => handleFilterChange('category', cat.category)}
                    className={localFilters.category === cat.category ? 'bg-orange-50' : ''}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{formatCategory(cat.category)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {cat.count}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Price ($)
            </label>
            <Input
              type="number"
              placeholder="0"
              value={localFilters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price ($)
            </label>
            <Input
              type="number"
              placeholder="No limit"
              value={localFilters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {sortOptions.find(opt => opt.value === localFilters.sortBy)?.label || 'Newest First'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange('sortBy', option.value)}
                    className={localFilters.sortBy === option.value ? 'bg-orange-50' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;