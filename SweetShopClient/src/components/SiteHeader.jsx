import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Globe, Menu, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { selectIsAuthenticated, selectCurrentUser, logoutUser } from "../features/auth/authSlice";
import NotificationBell from "./NotificationBell";
import Logo from "../assets/logo.svg"
function SweetShopLogo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="SweetShop home">
      <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-r from-blue-500 via-violet-500 to-blue-600" />
      <span className="font-['Inter',sans-serif] font-bold text-zinc-900">SweetShop</span>
    </Link>
  );
}

function DesktopNav({ className, isAuthenticated }) {
  const location = useLocation();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef = useRef(null);
  const linksRef = useRef({});

  const navItems = [
    ...(isAuthenticated ? [
      { path: '/dashboard', label: 'Dashboard' }
    ] : [])
  ];

  const updateIndicator = () => {
    const currentPath = location.pathname;
    const activeLink = navItems.find(item => item.path === currentPath);
    
    if (activeLink && linksRef.current[activeLink.path]) {
      const linkElement = linksRef.current[activeLink.path];
      const navElement = navRef.current;
      
      if (linkElement && navElement) {
        const linkRect = linkElement.getBoundingClientRect();
        const navRect = navElement.getBoundingClientRect();
        
        setIndicatorStyle({
          width: linkRect.width,
          transform: `translateX(${linkRect.left - navRect.left}px)`,
          opacity: 1
        });
      }
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  useEffect(() => {
    // Small delay to ensure elements are rendered
    const timer = setTimeout(updateIndicator, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, isAuthenticated]);

  useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname, isAuthenticated]);

  return (
    <nav 
      ref={navRef}
      className={cn("hidden md:flex items-center gap-6 text-sm font-['Inter',sans-serif] relative", className)}
    >
      {/* Moving highlight indicator */}
      <div 
        className="absolute top-0 h-full bg-amber-500/10 rounded-lg transition-all duration-300 ease-out pointer-events-none"
        style={indicatorStyle}
      />
      
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            ref={el => linksRef.current[item.path] = el}
            to={item.path}
            className={cn(
              "relative font-medium transition-all duration-300 px-3 py-2 rounded-lg z-10",
              isActive 
                ? "text-amber-600 font-semibold" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            )}
          >
            {item.label}
            {/* Individual link highlight for hover when not active */}
            {!isActive && (
              <span className="absolute inset-0 bg-zinc-100 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 -z-10" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileNav({ isAuthenticated, currentUser, handleLogout, setMobileOpen }) {
  const location = useLocation();

  const navItems = [
    ...(isAuthenticated ? [
      { path: '/dashboard', label: 'Dashboard' }
    ] : [])
  ];

  return (
    <div className="flex flex-col gap-2 font-['Inter',sans-serif]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "relative font-medium py-3 px-4 rounded-lg transition-all duration-300 overflow-hidden",
              isActive 
                ? "text-amber-600 font-semibold bg-amber-50 border-l-4 border-amber-500" 
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            )}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
            {/* Smooth background transition for mobile */}
            <span className={cn(
              "absolute inset-0 bg-gradient-to-r from-amber-50 to-transparent transition-all duration-300 -z-10",
              isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"
            )} />
          </Link>
        );
      })}
      
      <div className="my-2 h-px w-full bg-zinc-200" />
      
      {isAuthenticated ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { handleLogout(); setMobileOpen(false); }}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-left py-3 px-4 rounded-lg transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Link 
            to="/login" 
            className={cn(
              "text-sm font-semibold py-3 px-4 rounded-lg transition-all duration-300",
              location.pathname === '/login'
                ? "text-amber-600 bg-amber-50"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
            )}
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
          <Button 
            asChild 
            variant="outline" 
            className="rounded-lg border-zinc-300 text-zinc-900 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 w-fit font-['Inter',sans-serif] font-semibold transition-all duration-300"
          >
            <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 font-['Inter',sans-serif] transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-zinc-200",
        scrolled ? "shadow-sm" : ""
      )}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <img src={Logo} alt="SweetShop Logo" />
          <DesktopNav isAuthenticated={isAuthenticated} />
        </div>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <button 
                type="button" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300 p-2.5 rounded-lg hover:scale-105" 
                aria-label="Language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <span className="h-6 w-px bg-zinc-300 mx-2" aria-hidden="true" />
              
              {/* User profile dropdown */}
              <div className="relative user-menu-container">
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 font-['Inter',sans-serif] font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:scale-105",
                    userMenuOpen
                      ? "text-amber-600 bg-amber-50 shadow-sm"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  )}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-['Inter',sans-serif] font-semibold">
                    {currentUser?.username || 'User'}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-zinc-300/50 border border-zinc-200 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        className={cn(
                          "block px-4 py-3 text-sm font-['Inter',sans-serif] font-medium transition-all duration-200 rounded-lg mx-2",
                          location.pathname === '/dashboard'
                            ? "text-amber-600 bg-amber-50"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <hr className="my-2 border-zinc-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-['Inter',sans-serif] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 flex items-center gap-2 transition-all duration-200 rounded-lg mx-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={cn(
                  "text-sm font-['Inter',sans-serif] font-semibold transition-all duration-300 px-3 py-2 rounded-lg",
                  location.pathname === '/login'
                    ? "text-amber-600 bg-amber-50"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                Login
              </Link>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-zinc-300 text-zinc-900 bg-transparent hover:bg-zinc-100 hover:border-zinc-400 hover:scale-105 font-['Inter',sans-serif] font-semibold transition-all duration-300"
              >
                <Link to="/signup">Sign up</Link>
              </Button>
              <span className="h-6 w-px bg-zinc-300 mx-2" aria-hidden="true" />
              <button 
                type="button" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300 p-2.5 rounded-lg hover:scale-105" 
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <button 
                type="button" 
                className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300 p-2.5 rounded-lg hover:scale-105" 
                aria-label="Language"
              >
                <Globe className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className={cn(
              "inline-flex items-center rounded-lg p-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-300 hover:scale-105",
              mobileOpen 
                ? "text-amber-600 bg-amber-50" 
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={cn(
        "md:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-md transition-all duration-300 overflow-hidden",
        mobileOpen 
          ? "max-h-96 opacity-100 shadow-lg" 
          : "max-h-0 opacity-0"
      )}>
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <MobileNav 
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
            handleLogout={handleLogout}
            setMobileOpen={setMobileOpen}
          />
          
          <div className="mt-4 flex items-center gap-2 pt-4 border-t border-zinc-200">
            <button 
              type="button" 
              className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300 p-2.5 rounded-lg" 
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-300 p-2.5 rounded-lg" 
              aria-label="Language"
            >
              <Globe className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}