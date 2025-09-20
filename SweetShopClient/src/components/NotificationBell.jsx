import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Clock, DollarSign, User } from 'lucide-react';
import { useGetPendingTradesQuery } from '../features/api/apiSlice';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const { data: pendingTradesData, isLoading } = useGetPendingTradesQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
  });

  const pendingTrades = pendingTradesData?.data?.trades || [];
  const notificationCount = pendingTrades.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (tradeId) => {
    setIsOpen(false);
    navigate(`/trades/${tradeId}`);
  };

  const formatTime = (date) => {
    const now = new Date();
    const tradeDate = new Date(date);
    const diffInMinutes = Math.floor((now - tradeDate) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          "hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none",
          isOpen ? "bg-zinc-100" : "bg-transparent"
        )}
      >
        <Bell className="h-5 w-5 text-zinc-600" />
        {notificationCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notificationCount > 9 ? '9+' : notificationCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-zinc-200 z-50">
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900">Trade Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-100 rounded"
              >
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-zinc-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : pendingTrades.length === 0 ? (
              <div className="p-4 text-center text-zinc-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                <p className="text-sm">No pending trades</p>
              </div>
            ) : (
              pendingTrades.map((trade) => (
                <div
                  key={trade._id}
                  onClick={() => handleNotificationClick(trade._id)}
                  className="p-4 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        trade.status === 'pending' ? "bg-blue-100" : "bg-green-100"
                      )}>
                        {trade.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {trade.buyerId?.username || 'Unknown User'}
                        </span>
                        <span className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          trade.status === 'pending' 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-green-100 text-green-700"
                        )}>
                          {trade.status === 'pending' ? 'New Trade' : 'Payment Confirmed'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-zinc-600 mb-1">
                        Wants to buy <span className="font-medium">{trade.funTokenAmount} FUN tokens</span>
                      </p>
                      
                      <p className="text-xs text-zinc-500">
                        {formatTime(trade.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pendingTrades.length > 0 && (
            <div className="p-3 border-t border-zinc-200 bg-zinc-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/trades');
                }}
                className="w-full text-sm text-zinc-600 hover:text-zinc-900 font-medium py-1"
              >
                View all trades
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
