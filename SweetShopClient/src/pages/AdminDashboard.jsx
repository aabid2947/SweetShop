import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  useGetSweetStatsQuery,
  useGetAllSweetsQuery,
  useDeleteSweetMutation,
  useGetAdminProfileQuery
} from '../features/api/apiSlice';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Package,
  Star,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [deleteSweet] = useDeleteSweetMutation();
  
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useGetSweetStatsQuery();

  const { 
    data: sweetsData, 
    isLoading: sweetsLoading,
    refetch: refetchSweets
  } = useGetAllSweetsQuery({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

  const { 
    data: adminData,
    isLoading: adminLoading 
  } = useGetAdminProfileQuery();

  const stats = statsData?.data?.overview || {};
  const categoryStats = statsData?.data?.categories || [];
  const recentSweets = sweetsData?.data?.sweets || [];
  const admin = adminData?.data?.admin;

  const handleDeleteSweet = async (sweetId, sweetName) => {
    if (window.confirm(`Are you sure you want to delete "${sweetName}"?`)) {
      try {
        await deleteSweet(sweetId).unwrap();
        refetchSweets();
      } catch (error) {
        console.error('Failed to delete sweet:', error);
        alert('Failed to delete sweet. Please try again.');
      }
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatCategory = (cat) => {
    return cat?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (statsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {adminLoading ? 'Loading...' : `Welcome back, ${admin?.firstName || 'Admin'}`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link to="/admin/sweets/new">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Sweet
                </Button>
              </Link>
              <Link to="/sweets">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sweets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats.totalSweets || 0}
                  </p>
                </div>
                <Package className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <span>{stats.activeSweets || 0} active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? <Skeleton className="h-8 w-16" /> : stats.featuredSweets || 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <span>{stats.discountedSweets || 0} on sale</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      formatPrice(stats.averagePrice)
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <span>Across all categories</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      (stats.totalViews || 0).toLocaleString()
                    )}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center text-sm text-purple-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>User engagement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Sweets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Sweets</CardTitle>
                <Link to="/admin/sweets">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {sweetsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentSweets.length > 0 ? (
                  <div className="space-y-4">
                    {recentSweets.map((sweet) => (
                      <div key={sweet._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <img
                            src={sweet.images?.[0]?.url || '/api/placeholder/50/50'}
                            alt={sweet.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/50/50';
                            }}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{sweet.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Badge variant="outline" className="text-xs">
                                {formatCategory(sweet.category)}
                              </Badge>
                              <span>{formatPrice(sweet.price)}</span>
                              {sweet.isDiscounted && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  {sweet.discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link to={`/sweets/${sweet._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/sweets/${sweet._id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSweet(sweet._id, sweet.name)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sweets found</p>
                    <Link to="/admin/sweets/new">
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Sweet
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : categoryStats.length > 0 ? (
                  <div className="space-y-4">
                    {categoryStats.slice(0, 8).map((category) => (
                      <div key={category._id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCategory(category._id)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {category.count} items
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {formatPrice(category.averagePrice)}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (category.count / Math.max(...categoryStats.map(c => c.count))) * 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{category.totalViews || 0} views</span>
                          <span>{((category.count / stats.totalSweets) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                    
                    {categoryStats.length > 8 && (
                      <div className="text-center pt-4 border-t">
                        <Link to="/admin/analytics">
                          <Button variant="ghost" size="sm">
                            View All Categories
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/sweets/new" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Sweet
                  </Button>
                </Link>
                <Link to="/admin/sweets" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Sweets
                  </Button>
                </Link>
                <Link to="/admin/analytics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link to="/admin/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;