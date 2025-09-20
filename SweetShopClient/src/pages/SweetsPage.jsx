import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SweetCard from '../components/SweetCard';
import SearchBar from '../components/SearchBar';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useGetAllSweetsQuery, useSearchSweetsQuery } from '../features/api/apiSlice';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import { ChevronLeft, ChevronRight, Grid, List, Loader2, Plus } from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';
const SweetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20
  });

  // Determine if we're searching or just browsing
  const isSearching = filters.q || filters.category || filters.minPrice || filters.maxPrice;
  
  // Use appropriate query based on whether we're searching
  const {
    data: sweetsData,
    error,
    isLoading,
    refetch
  } = isSearching 
    ? useSearchSweetsQuery(filters, { skip: false })
    : useGetAllSweetsQuery(filters);

  const sweets = sweetsData?.data?.sweets || [];
  const pagination = sweetsData?.data?.pagination || {};

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Update filters when URL changes
  useEffect(() => {
    const newFilters = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'newest',
      page: parseInt(searchParams.get('page')) || 1,
      limit: 20
    };
    setFilters(newFilters);
    setPage(newFilters.page);
  }, [searchParams]);

  const handleSearch = (searchFilters) => {
    const newFilters = {
      ...searchFilters,
      page: 1, // Reset to first page on new search
      limit: 20
    };
    setFilters(newFilters);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    };
    setFilters(updatedFilters);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (sweet) => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', sweet);
    // You can integrate with cart state management here
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription>
            Failed to load sweets. Please try again later.
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="sm" 
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <SiteHeader />
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              {/* <h1 className="text-3xl font-bold text-gray-900">Sweet Shop</h1> */}
              <p className="text-gray-600 mt-1">
                Discover delicious sweets from our collection
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Add Sweet Button */}
              {isAuthenticated && (
                <Link to="/user/sweet/new">
                  <Button className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your Sweet
                  </Button>
                </Link>
              )}
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSearching ? 'Search Results' : 'All Sweets'}
            </h2>
            {!isLoading && (
              <span className="text-gray-500">
                {pagination.totalItems || 0} items found
              </span>
            )}
          </div>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className={`grid gap-6 ${viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
          }`}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && sweets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sweets found</h3>
            <p className="text-gray-600 mb-4">
              {isSearching 
                ? 'Try adjusting your search criteria or filters'
                : 'No sweets are currently available'
              }
            </p>
            {isSearching && (
              <Button onClick={() => handleSearch({ q: '', sortBy: 'newest' })}>
                View All Sweets
              </Button>
            )}
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && sweets.length > 0 && (
          <>
            <div className={`grid gap-6 mb-8 ${viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {sweets.map((sweet) => (
                <SweetCard
                  key={sweet._id}
                  sweet={sweet}
                  onAddToCart={handleAddToCart}
                  className={viewMode === 'list' ? 'flex' : ''}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, index) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (page <= 3) {
                      pageNumber = index + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + index;
                    } else {
                      pageNumber = page - 2 + index;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={page === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.totalPages}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SweetsPage;